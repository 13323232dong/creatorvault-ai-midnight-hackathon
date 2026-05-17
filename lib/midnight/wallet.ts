import type {
  Configuration,
  ConnectedAPI,
  ConnectionStatus,
  InitialAPI,
} from "@midnight-ntwrk/dapp-connector-api"

// Midnight 钱包连接层。
// 它对应以太坊生态里的 window.ethereum 连接层，但 Midnight 为了避免多个钱包冲突，
// 会把钱包注入到 window.midnight.{walletId} 下面。

export type MidnightWalletSummary = {
  id: string
  name: string
  rdns: string
  icon: string
  apiVersion: string
}

export type MidnightAddressSnapshot = {
  shieldedAddress?: string
  unshieldedAddress?: string
  dustAddress?: string
}

export type MidnightBalanceSnapshot = {
  shieldedTokenTypes: string[]
  unshieldedTokenTypes: string[]
  dustBalance?: string
  dustCap?: string
}

export type MidnightConnectionSnapshot = {
  wallet: MidnightWalletSummary
  requestedNetworkId: string
  status: ConnectionStatus
  configuration: Configuration
  addresses: MidnightAddressSnapshot
  balances: MidnightBalanceSnapshot
  // connected 是 Lace 暴露给 DApp 的真实操作入口。
  // 前面的字段只是“读出来展示给用户看”的快照；
  // 这个对象后面会被部署/调用合约流程继续使用。
  connected: ConnectedAPI
}

export type WalletInjectionSnapshot = {
  midnightWalletIds: string[]
  cardanoWalletIds: string[]
  hasEthereum: boolean
}

export const midnightNetworkOptions = [
  { id: "preprod", label: "Preprod / 官方预生产测试网" },
  { id: "preview", label: "Preview / 官方预览测试网" },
  { id: "undeployed", label: "Undeployed / 本地开发网络" },
  { id: "qanet", label: "QA Net / 官方质量测试网" },
  { id: "devnet", label: "Devnet / 开发网络" },
  { id: "testnet", label: "Testnet / 测试网络" },
  { id: "mainnet", label: "Mainnet / 主网" },
]

const fallbackNetworkIds = midnightNetworkOptions.map((network) => network.id)
const preferredWalletIds = ["gafhhkghbfjjkeiendhlofajokpaflmk"]

function getMidnightRegistry(): Record<string, InitialAPI> {
  if (typeof window === "undefined") {
    return {}
  }

  return window.midnight ?? {}
}

function getCardanoRegistry(): Record<string, unknown> {
  if (typeof window === "undefined") {
    return {}
  }

  const candidateWindow = window as Window & {
    cardano?: Record<string, unknown>
  }

  return candidateWindow.cardano ?? {}
}

function summarizeWallet(id: string, wallet: InitialAPI): MidnightWalletSummary {
  return {
    id,
    name: wallet.name,
    rdns: wallet.rdns,
    icon: wallet.icon,
    apiVersion: wallet.apiVersion,
  }
}

function walletPriority([id, wallet]: [string, InitialAPI]) {
  const searchable = `${id} ${wallet.name} ${wallet.rdns}`.toLowerCase()

  if (preferredWalletIds.includes(id)) {
    return 0
  }

  if (searchable.includes("preview")) {
    return 2
  }

  return 1
}

function getWallet(id: string): InitialAPI {
  const wallet = getMidnightRegistry()[id]

  if (!wallet) {
    throw new Error(`Midnight wallet "${id}" was not found in window.midnight.`)
  }

  return wallet
}

function bigintRecordKeys(record: Record<string, bigint>): string[] {
  return Object.keys(record)
}

// 发现浏览器里已经注入的 Midnight 钱包。
// 如果这里返回空数组，通常说明：
// - 用户还没有安装支持 Midnight DApp Connector 的钱包
// - 当前浏览器插件没有启用
// - 页面不是在钱包支持的环境里打开
export function discoverMidnightWallets(): MidnightWalletSummary[] {
  return Object.entries(getMidnightRegistry())
    .sort((left, right) => walletPriority(left) - walletPriority(right))
    .map(([id, wallet]) => summarizeWallet(id, wallet))
}

export function inspectWalletInjection(): WalletInjectionSnapshot {
  const candidateWindow = window as Window & {
    ethereum?: unknown
  }

  return {
    midnightWalletIds: Object.keys(getMidnightRegistry()),
    cardanoWalletIds: Object.keys(getCardanoRegistry()),
    hasEthereum: Boolean(candidateWindow.ethereum),
  }
}

async function readAddresses(connected: ConnectedAPI): Promise<MidnightAddressSnapshot> {
  const [shielded, unshielded, dust] = await Promise.allSettled([
    connected.getShieldedAddresses(),
    connected.getUnshieldedAddress(),
    connected.getDustAddress(),
  ])

  return {
    shieldedAddress:
      shielded.status === "fulfilled" ? shielded.value.shieldedAddress : undefined,
    unshieldedAddress:
      unshielded.status === "fulfilled" ? unshielded.value.unshieldedAddress : undefined,
    dustAddress: dust.status === "fulfilled" ? dust.value.dustAddress : undefined,
  }
}

async function readBalances(connected: ConnectedAPI): Promise<MidnightBalanceSnapshot> {
  const [shielded, unshielded, dust] = await Promise.allSettled([
    connected.getShieldedBalances(),
    connected.getUnshieldedBalances(),
    connected.getDustBalance(),
  ])

  return {
    shieldedTokenTypes:
      shielded.status === "fulfilled" ? bigintRecordKeys(shielded.value) : [],
    unshieldedTokenTypes:
      unshielded.status === "fulfilled" ? bigintRecordKeys(unshielded.value) : [],
    dustBalance: dust.status === "fulfilled" ? dust.value.balance.toString() : undefined,
    dustCap: dust.status === "fulfilled" ? dust.value.cap.toString() : undefined,
  }
}

// 连接指定 Midnight 钱包，并读取最小可验证信息。
// 这一步是真实 Web3 接入的入口：
// - 用户授权钱包连接
// - DApp 获得钱包配置
// - DApp 获得地址/余额读取能力
// 后续调用合约时，会继续使用 connected API 做交易平衡、证明、提交。
export async function connectMidnightWallet(params: {
  walletId: string
  networkId: string
}): Promise<MidnightConnectionSnapshot> {
  const wallet = getWallet(params.walletId)
  const connected = await wallet.connect(params.networkId)

  // Lace 当前版本的 connector 对 hintUsage 支持不稳定。
  // 它只是“提前告诉钱包 DApp 接下来会用哪些能力”，不是连接成功的必要条件。
  await connected.hintUsage
    ?.([
      "getConnectionStatus",
      "getConfiguration",
      "getShieldedAddresses",
      "getUnshieldedAddress",
      "getDustAddress",
      "getShieldedBalances",
      "getUnshieldedBalances",
      "getDustBalance",
    ])
    .catch(() => undefined)

  const [status, configuration, addresses, balances] = await Promise.all([
    connected.getConnectionStatus(),
    connected.getConfiguration(),
    readAddresses(connected),
    readBalances(connected),
  ])

  return {
    wallet: summarizeWallet(params.walletId, wallet),
    requestedNetworkId: params.networkId,
    status,
    configuration,
    addresses,
    balances,
    connected,
  }
}

// 真实钱包必须连接到“它当前激活的 Midnight 网络”。
// 如果 DApp 传 preprod，但钱包当前是 undeployed，Lace 就会返回 Network ID mismatch。
// 这个函数按常见网络逐个尝试，找到钱包当前接受的那个网络。
export async function connectMidnightWalletAuto(params: {
  walletId: string
  preferredNetworkId?: string
}): Promise<MidnightConnectionSnapshot> {
  const networkIds = [
    params.preferredNetworkId,
    ...fallbackNetworkIds,
  ].filter((networkId, index, values): networkId is string =>
    Boolean(networkId) && values.indexOf(networkId) === index,
  )

  const failures: string[] = []

  for (const networkId of networkIds) {
    try {
      return await connectMidnightWallet({
        walletId: params.walletId,
        networkId,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      failures.push(`${networkId}: ${message}`)
    }
  }

  throw new Error(
    `没有找到 Lace 当前接受的 Midnight 网络。尝试过：${failures.join(" | ")}`,
  )
}

export async function connectAnyMidnightWalletAuto(params: {
  walletIds: string[]
  preferredNetworkId?: string
}): Promise<MidnightConnectionSnapshot> {
  const failures: string[] = []

  for (const walletId of params.walletIds) {
    try {
      return await connectMidnightWalletAuto({
        walletId,
        preferredNetworkId: params.preferredNetworkId,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      failures.push(`${walletId}: ${message}`)
    }
  }

  throw new Error(
    `没有找到可连接的 Midnight 钱包入口。尝试过：${failures.join(" || ")}`,
  )
}
