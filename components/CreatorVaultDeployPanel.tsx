"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Rocket, ShieldCheck, WalletCards } from "lucide-react"
import { useMidnightWallet } from "@/components/MidnightWalletProvider"
import {
  deployCreatorVaultContract,
  type CreatorVaultDeploymentProgress,
} from "@/lib/midnight/creator-vault-contract"

type DeployState =
  | { status: "idle" }
  | { status: "deploying"; message: string }
  | {
      status: "deployed"
      contractAddress: string
      txId: string
      blockHeight?: number
    }
  | { status: "failed"; message: string }

const deploymentStorageKey = "creatorvault.preprod.deployment"

const confirmedPreprodDeployment: Extract<DeployState, { status: "deployed" }> = {
  status: "deployed",
  contractAddress:
    "799d2a5a63fd3abcb8c6b892d7e46d234db66b3570e07092a78372ea96720774",
  txId: "005dae86d1b76d11dcbf9391cb10d41302dd6f60ad41d91744c661a48c90d5dd11",
  blockHeight: 798723,
}

function shortValue(value?: string) {
  if (!value) {
    return "未连接"
  }

  return value.length > 18 ? `${value.slice(0, 10)}...${value.slice(-8)}` : value
}

function hasPositiveDust(balance?: string) {
  if (!balance) {
    return false
  }

  try {
    return BigInt(balance) > BigInt(0)
  } catch {
    return Number(balance) > 0
  }
}

function formatDustBalance(balance?: string) {
  if (!balance) {
    return "未读取"
  }

  return `${balance} raw`
}

function isDeployableNetwork(networkId?: string) {
  return networkId === "preprod"
}

function getNetworkLabel(networkId?: string) {
  if (networkId === "undeployed") {
    return "Midnight Undeployed 本地链"
  }

  if (networkId === "preprod") {
    return "Midnight Preprod 测试链"
  }

  return "Midnight 网络"
}

function formatDeployError(error: unknown): string {
  if (error instanceof Error) {
    const serializedError = JSON.stringify(
      error,
      Object.getOwnPropertyNames(error),
      2,
    )

    if (
      error.message.includes("SubmissionError") ||
      JSON.stringify(error.cause).includes("SubmissionError") ||
      serializedError.includes("SubmissionError")
    ) {
      return [
        "链提交失败：钱包已经完成签名，但交易没有被 Midnight Preprod 接收。",
        "当前 Lace 已有 tDUST，所以需要查看钱包/节点返回的原始拒绝原因。",
        `原始错误：${error.name || "Error"} ${error.message || ""}`,
        serializedError,
      ].join("\n")
    }

    const details: string[] = [
      error.name,
      error.message,
      error.cause ? `cause: ${formatDeployError(error.cause)}` : "",
      error.stack ? `stack: ${error.stack}` : "",
    ].filter(Boolean)

    return details.join("\n\n") || "部署交易被钱包或网络拒绝，但没有返回详细原因。"
  }

  if (typeof error === "string") {
    return error || "部署失败，但没有返回详细原因。"
  }

  try {
    return JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
  } catch {
    return "部署失败，但错误对象无法序列化。"
  }
}

function readStoredDeployment(): DeployState {
  if (typeof window === "undefined") {
    return confirmedPreprodDeployment
  }

  const stored = window.localStorage.getItem(deploymentStorageKey)

  if (!stored) {
    return confirmedPreprodDeployment
  }

  try {
    const parsed = JSON.parse(stored) as Partial<
      Extract<DeployState, { status: "deployed" }>
    >

    if (parsed.contractAddress && parsed.txId) {
      return {
        status: "deployed",
        contractAddress: parsed.contractAddress,
        txId: parsed.txId,
        blockHeight: parsed.blockHeight,
      }
    }
  } catch {
    window.localStorage.removeItem(deploymentStorageKey)
  }

  return confirmedPreprodDeployment
}

function storeDeployment(deployment: Extract<DeployState, { status: "deployed" }>) {
  window.localStorage.setItem(deploymentStorageKey, JSON.stringify(deployment))
}

// 这个组件是当前项目第一次“真正把智能合约写入测试链”的按钮。
// 流程是：
// 1. 使用已经连接的 Lace DApp Connector API。
// 2. midnight-js 构造 deploy transaction。
// 3. Lace 钱包补 DUST 手续费、签名并弹窗确认。
// 4. 钱包把交易广播到 Midnight Preprod。
export function CreatorVaultDeployPanel() {
  const { connection, connectWallet, error, isAutoConnecting } = useMidnightWallet()
  const [deployState, setDeployState] = useState<DeployState>({ status: "idle" })
  const [deployProgress, setDeployProgress] = useState<CreatorVaultDeploymentProgress[]>([])

  const canDeploy =
    connection?.status.status === "connected" &&
    isDeployableNetwork(connection.configuration.networkId)
  const hasDust = hasPositiveDust(connection?.balances.dustBalance)
  const canSubmitDeployment = canDeploy && hasDust
  const networkLabel = getNetworkLabel(connection?.configuration.networkId)
  const hasDeployment = deployState.status === "deployed"

  useEffect(() => {
    const storedDeployment = readStoredDeployment()
    setDeployState(storedDeployment)

    if (storedDeployment.status === "deployed") {
      storeDeployment(storedDeployment)
    }
  }, [])

  async function handleDeploy() {
    if (!connection?.connected) {
      setDeployState({
        status: "failed",
        message: "请先连接 Lace 钱包，再部署智能合约。",
      })
      return
    }

    if (!hasDust) {
      setDeployState({
        status: "failed",
        message:
          "当前 Lace 的 Midnight 账户 DUST 为 0。部署合约需要 DUST 作为手续费，请先在 Lace 里生成或领取 tDUST。",
      })
      return
    }

    try {
      setDeployProgress([])
      setDeployState({
        status: "deploying",
        message: "正在生成部署交易，请在 Lace 钱包里确认...",
      })

      const result = await deployCreatorVaultContract(connection.connected, {
        onProgress(progress) {
          setDeployProgress((current) => [...current, progress])
        },
      })

      const nextDeployState: Extract<DeployState, { status: "deployed" }> = {
        status: "deployed",
        ...result,
      }

      storeDeployment(nextDeployState)
      setDeployState(nextDeployState)
    } catch (error) {
      console.error("CreatorVault deploy failed", error)

      setDeployState({
        status: "failed",
        message: formatDeployError(error),
      })

      await connectWallet("auto").catch(() => undefined)
    }
  }

  return (
    <section className="border border-[var(--line)] bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 border border-[var(--line)] bg-[#f5f7f2] px-3 py-2 text-sm font-medium text-[var(--forest)]">
            <Rocket size={17} />
            Midnight Preprod Deploy
          </div>
          <h1 className="mt-5 text-3xl font-semibold text-[var(--ink)]">
            部署 CreatorVault 合约到{networkLabel}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            这一步相当于把 CreatorVault 的第一版“公开 proof 结果登记规则”写进 Midnight
            Preprod 测试链。部署成功后会得到一个合约地址，后续前端就围绕这个地址提交 proof
            结果、读取状态。
          </p>
        </div>

        <button
          className="inline-flex items-center gap-2 bg-[var(--forest)] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#9ba99c]"
          disabled={!canSubmitDeployment || deployState.status === "deploying"}
          onClick={handleDeploy}
          type="button"
        >
          <ShieldCheck size={17} />
          {deployState.status === "deploying"
            ? "部署中"
            : hasDeployment
              ? "已部署"
              : "部署合约"}
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="border border-[var(--line)] bg-[#fbfcf8] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
            <WalletCards size={16} />
            钱包网络
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">
            {connection?.configuration.networkId ?? "未连接"}
          </p>
          {connection?.wallet ? (
            <p className="mt-2 break-all text-xs text-[var(--muted)]">
              {connection.wallet.name} / {connection.wallet.id}
            </p>
          ) : null}
        </div>

        <div className="border border-[var(--line)] bg-[#fbfcf8] p-4">
          <div className="text-sm font-semibold text-[var(--ink)]">DUST</div>
          <p className="mt-3 text-sm text-[var(--muted)]">
            {formatDustBalance(connection?.balances.dustBalance)}
          </p>
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
            页面展示的是钱包 connector 返回的原始单位；Lace 侧栏里的 tDUST Tank
            是更适合人工判断的手续费余额。
          </p>
        </div>

        <div className="border border-[var(--line)] bg-[#fbfcf8] p-4">
          <div className="text-sm font-semibold text-[var(--ink)]">非隐私地址</div>
          <p className="mt-3 break-all text-sm text-[var(--muted)]">
            {connection?.addresses.unshieldedAddress ?? "未连接"}
          </p>
        </div>
      </div>

      {!canDeploy && !hasDeployment && (
        <div className="mt-5 border border-[#d8c9a6] bg-[#fff8e3] p-4 text-sm leading-6 text-[#6d5526]">
          当前还不能部署：请先连接 Lace，并确认网络是 Midnight Preprod 测试链。
          <button
            className="ml-3 border border-[#9b7b32] px-3 py-1 font-semibold text-[#6d5526]"
            disabled={isAutoConnecting}
            onClick={() => void connectWallet("auto")}
            type="button"
          >
            {isAutoConnecting ? "连接中" : "自动连接"}
          </button>
        </div>
      )}

      {canDeploy && !hasDust && !hasDeployment ? (
        <div className="mt-5 border border-[#d8c9a6] bg-[#fff8e3] p-4 text-sm leading-6 text-[#6d5526]">
          当前主 Lace 钱包已连接到 {connection?.configuration.networkId}，但 DUST 为 0。部署合约需要 DUST
          支付测试链手续费，请先在 Lace 的 Midnight 账户里生成或领取 tDUST。
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 border border-[#e2b8b8] bg-[#fff1f1] p-4 text-sm leading-6 text-[#8a2b2b]">
          钱包连接错误：{error}
        </div>
      ) : null}

      {deployState.status === "deploying" && (
        <div className="mt-5 border border-[var(--line)] bg-[#eef4f0] p-4 text-sm text-[var(--forest)]">
          {deployState.message}
        </div>
      )}

      {deployProgress.length ? (
        <div className="mt-5 border border-[var(--line)] bg-[#fbfcf8] p-4 text-sm leading-6 text-[var(--ink)]">
          <div className="font-semibold">部署诊断</div>
          <ol className="mt-3 space-y-3">
            {deployProgress.map((item, index) => (
              <li key={`${item.step}-${index}`}>
                <p className="font-medium">
                  {index + 1}. {item.step}
                </p>
                {item.detail ? (
                  <pre className="mt-1 overflow-auto whitespace-pre-wrap break-all bg-white p-3 text-xs text-[var(--muted)]">
                    {item.detail}
                  </pre>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {deployState.status === "failed" && (
        <div className="mt-5 border border-[#e2b8b8] bg-[#fff1f1] p-4 text-sm leading-6 text-[#8a2b2b]">
          部署失败：{deployState.message}
        </div>
      )}

      {deployState.status === "deployed" && (
        <div className="mt-5 border border-[#b8d6bd] bg-[#f0f8f1] p-4 text-sm leading-6 text-[var(--forest)]">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 size={17} />
            合约已部署
          </div>
          <p className="mt-3 break-all">合约地址：{deployState.contractAddress}</p>
          <p className="break-all">交易 ID：{deployState.txId}</p>
          {deployState.blockHeight ? <p>区块高度：{deployState.blockHeight}</p> : null}
        </div>
      )}
    </section>
  )
}
