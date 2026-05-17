// 创作者公开资料。
// 这不是收入账本，只是页面展示和报告归属需要的基础信息。
export type Creator = {
  // 系统内部 ID，方便关联不同数据。
  id: string
  // 创作者显示名。
  name: string
  // 社交账号或产品内 handle。
  handle: string
  // 创作者类型，例如开源作者、视频创作者、教育创作者。
  category: string
  // 可选公开钱包地址。`0x${string}` 表示它必须以 0x 开头。
  walletAddress?: `0x${string}`
  // 当前报告周期，例如 April 2026。
  reportPeriod: string
  // 头像占位字母，例如 Alice Chen -> AC。
  avatarInitials: string
}
