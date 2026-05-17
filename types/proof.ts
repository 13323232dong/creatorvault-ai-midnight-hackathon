// ProofClaim 是“证明结果”的数据结构。
// 它不是完整私密账本，而是经过 proof-engine 计算后可以交给 UI/报告层使用的对象。
export type ProofClaim = {
  // 证明 ID。
  id: string
  // 证明标题，例如“月收入门槛证明”。
  title: string
  // 收入门槛，单位是美元。
  thresholdUsd: number
  // 支持者数量门槛。
  supporterThreshold: number
  // 证明对应的时间周期。
  period: string
  // 证明是否通过。
  result: "passed" | "failed"
  // 当前 MVP 里保留的总收入数值，用于展示/调试。
  // 真实隐私版本里可以只公开“是否超过门槛”，不公开精确总额。
  totalPrivateIncomeUsd: number
  // 支持者数量。真实隐私版本也可以只公开是否超过门槛。
  supporterCount: number
  // 可以公开披露的字段列表。
  disclosedFields: string[]
  // 必须隐藏的字段列表。
  hiddenFields: string[]
  // 模拟 proof commitment。未来可替换为真实 ZK proof/commitment。
  proofHash: string
  // 生成时间。
  generatedAt: string
}
