"use client"

import { CompiledContract } from "@midnight-ntwrk/compact-js"
import { fromHex, toHex } from "@midnight-ntwrk/compact-runtime"
import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api"
import { FetchZkConfigProvider } from "@midnight-ntwrk/midnight-js-fetch-zk-config-provider"
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider"
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider"
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id"
import {
  type MidnightProviders,
  type UnboundTransaction,
} from "@midnight-ntwrk/midnight-js-types"
import { deployContract } from "@midnight-ntwrk/midnight-js-contracts"
import {
  Binding,
  FinalizedTransaction,
  Proof,
  SignatureEnabled,
  Transaction,
  type TransactionId,
} from "@midnight-ntwrk/ledger-v8"
import * as CreatorVault from "@/contracts/managed/creator-vault/contract/index.js"
import { createInMemoryPrivateStateProvider } from "@/lib/midnight/in-memory-private-state-provider"

type CreatorVaultContract = CreatorVault.Contract<undefined>
type CreatorVaultCircuitKeys = "submitIncomeProof"

type IndexedTransaction = {
  readonly hash: string
  readonly block?: {
    readonly height: number
    readonly hash: string
  }
}

export type CreatorVaultDeploymentResult = {
  contractAddress: string
  txId: string
  blockHeight?: number
}

export type CreatorVaultDeploymentProgress = {
  step: string
  detail?: string
}

export type CreatorVaultDeploymentOptions = {
  onProgress?: (progress: CreatorVaultDeploymentProgress) => void
}

function serializeUnknownError(error: unknown): unknown {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: serializeUnknownError(error.cause),
      ownProperties: Object.fromEntries(
        Object.getOwnPropertyNames(error).map((key) => [
          key,
          serializeUnknownError((error as unknown as Record<string, unknown>)[key]),
        ]),
      ),
    }
  }

  if (typeof error === "bigint") {
    return error.toString()
  }

  if (!error || typeof error !== "object") {
    return error
  }

  try {
    return JSON.parse(JSON.stringify(error))
  } catch {
    return String(error)
  }
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds))
}

async function queryIndexedTransaction(
  indexerUri: string,
  txId: string,
): Promise<IndexedTransaction | undefined> {
  const response = await fetch(indexerUri, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query CreatorVaultTxByIdentifier($id: HexEncoded!) {
          transactions(offset: { identifier: $id }) {
            hash
            block {
              height
              hash
            }
          }
        }
      `,
      variables: { id: txId },
    }),
  })

  if (!response.ok) {
    throw new Error(`Indexer query failed with HTTP ${response.status}`)
  }

  const payload = (await response.json()) as {
    data?: {
      transactions?: IndexedTransaction[]
    }
    errors?: unknown
  }

  if (payload.errors) {
    throw new Error(`Indexer query failed: ${JSON.stringify(payload.errors)}`)
  }

  return payload.data?.transactions?.[0]
}

async function waitForIndexedTransaction(
  indexerUri: string,
  txId: string,
  options: CreatorVaultDeploymentOptions,
): Promise<IndexedTransaction | undefined> {
  const maxAttempts = 24

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const indexed = await queryIndexedTransaction(indexerUri, txId).catch(() => undefined)

    if (indexed) {
      return indexed
    }

    options.onProgress?.({
      step: "Lace 报错后检查链上确认",
      detail: `txId=${txId}\nattempt=${attempt}/${maxAttempts}`,
    })
    await sleep(1500)
  }

  return undefined
}

// compiledCreatorVaultContract 是“合约源码编译后的部署说明书”。
// 注意：它不是链上合约本体；链上合约要等 deployContract 生成交易并由钱包提交后才存在。
const compiledCreatorVaultContract = CompiledContract.make<CreatorVaultContract>(
  "CreatorVault",
  CreatorVault.Contract<undefined>,
).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets("/creator-vault"),
)

// 浏览器部署时，ZK keys / zkir 不能从本机文件系统读。
// 所以我们把 artifact 放在 public/creator-vault 下，通过 HTTP fetch 给 SDK。
function createZkConfigProvider() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

  return new FetchZkConfigProvider<CreatorVaultCircuitKeys>(
    `${window.location.origin}${basePath}/creator-vault`,
    fetch.bind(window),
  )
}

async function createProviders(
  connected: ConnectedAPI,
  options: CreatorVaultDeploymentOptions = {},
): Promise<MidnightProviders<CreatorVaultCircuitKeys, string, undefined>> {
  options.onProgress?.({ step: "读取 Lace 网络配置" })
  const config = await connected.getConfiguration()
  setNetworkId(config.networkId)
  options.onProgress?.({
    step: "读取 Lace 网络配置完成",
    detail: [
      `network=${config.networkId}`,
      `indexer=${config.indexerUri}`,
      `prover=${config.proverServerUri ?? "http://127.0.0.1:6300"}`,
    ].join("\n"),
  })

  options.onProgress?.({ step: "读取钱包 shielded 公钥" })
  const shieldedAddresses = await connected.getShieldedAddresses()
  const zkConfigProvider = createZkConfigProvider()
  const proofProvider = httpClientProofProvider(
    config.proverServerUri ?? "http://127.0.0.1:6300",
    zkConfigProvider,
  )

  return {
    privateStateProvider: createInMemoryPrivateStateProvider<string, undefined>(),
    zkConfigProvider,
    proofProvider,
    publicDataProvider: indexerPublicDataProvider(
      config.indexerUri,
      config.indexerWsUri,
    ),
    walletProvider: {
      getCoinPublicKey() {
        return shieldedAddresses.shieldedCoinPublicKey
      },
      getEncryptionPublicKey() {
        return shieldedAddresses.shieldedEncryptionPublicKey
      },
      async balanceTx(tx: UnboundTransaction): Promise<FinalizedTransaction> {
        // deployContract 先构造“未平衡交易”。
        // Lace 在这里负责补 DUST 手续费、签名、绑定交易。
        options.onProgress?.({
          step: "请求 Lace 平衡交易",
          detail: `unboundTxBytes=${tx.serialize().length}`,
        })
        const balanced = await connected.balanceUnsealedTransaction(
          toHex(tx.serialize()),
        )

        const finalized = Transaction.deserialize<SignatureEnabled, Proof, Binding>(
          "signature",
          "proof",
          "binding",
          fromHex(balanced.tx),
        )

        console.info("CreatorVault balanceUnsealedTransaction succeeded", {
          balancedTxLength: balanced.tx.length,
          identifiers: finalized.identifiers(),
        })
        options.onProgress?.({
          step: "Lace 平衡交易完成",
          detail: [
            `balancedTxHexLength=${balanced.tx.length}`,
            `identifiers=${finalized.identifiers().join(", ")}`,
          ].join("\n"),
        })

        return finalized
      },
    },
    midnightProvider: {
      async submitTx(tx: FinalizedTransaction): Promise<TransactionId> {
        // 到这里才是真正把交易广播到 Midnight Preprod。
        const serializedTx = toHex(tx.serialize())
        const txId = tx.identifiers()[0]

        try {
          options.onProgress?.({
            step: "提交交易到 Midnight Preprod",
            detail: [`txId=${txId}`, `txHexLength=${serializedTx.length}`].join("\n"),
          })
          await connected.submitTransaction(serializedTx)
          options.onProgress?.({
            step: "交易提交已被 Lace 接受",
            detail: `txId=${txId}`,
          })
          return txId
        } catch (error) {
          console.error("CreatorVault submitTransaction failed", {
            txId,
            txLength: serializedTx.length,
            error: serializeUnknownError(error),
          })
          options.onProgress?.({
            step: "提交返回错误，开始检查链上是否已接收",
            detail: `txId=${txId}`,
          })

          const indexed = await waitForIndexedTransaction(config.indexerUri, txId, options)

          if (indexed) {
            console.warn("CreatorVault submitTransaction errored after indexing", {
              txId,
              txHash: indexed.hash,
              blockHeight: indexed.block?.height,
              error: serializeUnknownError(error),
            })
            options.onProgress?.({
              step: "链上已确认，忽略 Lace submit 返回错误",
              detail: [
                `txId=${txId}`,
                `txHash=${indexed.hash}`,
                indexed.block ? `blockHeight=${indexed.block.height}` : undefined,
              ]
                .filter(Boolean)
                .join("\n"),
            })
            return txId
          }

          options.onProgress?.({
            step: "提交交易失败",
            detail: JSON.stringify(serializeUnknownError(error), null, 2),
          })
          throw error
        }
      },
    },
  }
}

export async function deployCreatorVaultContract(
  connected: ConnectedAPI,
  options: CreatorVaultDeploymentOptions = {},
): Promise<CreatorVaultDeploymentResult> {
  const providers = await createProviders(connected, options)

  options.onProgress?.({ step: "开始生成 proof 并部署合约" })
  const deployed = await deployContract(providers, {
    compiledContract: compiledCreatorVaultContract,
  })

  const publicDeployData = deployed.deployTxData.public
  options.onProgress?.({
    step: "部署完成",
    detail: [
      `contractAddress=${publicDeployData.contractAddress}`,
      `txId=${publicDeployData.txId}`,
      publicDeployData.blockHeight
        ? `blockHeight=${publicDeployData.blockHeight}`
        : undefined,
    ]
      .filter(Boolean)
      .join("\n"),
  })

  return {
    contractAddress: publicDeployData.contractAddress,
    txId: publicDeployData.txId,
    blockHeight: publicDeployData.blockHeight,
  }
}
