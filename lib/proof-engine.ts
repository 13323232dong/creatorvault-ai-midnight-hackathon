import type { ProofClaim } from "@/types/proof"
import type { SponsorshipRecord } from "@/types/sponsorship"

// 当前 MVP 里的简单 hash，只用于模拟 proof commitment。
// 它不是密码学安全哈希，也不是真正的 ZK proof。
// 真正接入 Midnight/ZK 时，这里应该替换为真实证明系统生成的 proof / commitment。
function simpleHash(input: string): string {
  let hash = 0

  // 用字符串内容计算一个稳定的短 hash，方便 Demo 中观察 proof 变化。
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }

  return `0x${Math.abs(hash).toString(16).padStart(8, "0")}...proof`
}

// generateIncomeProof 是当前项目的“证明引擎”。
// 它模拟 ZK/隐私证明的业务流程：
// 1. 输入完整赞助记录 records。
// 2. 在本地计算总收入和支持者数量。
// 3. 判断是否达到公开门槛 thresholdUsd / supporterThreshold。
// 4. 返回可以公开展示的 proof claim。
//
// 关键思想：
// - totalPrivateIncomeUsd 和 records 参与计算，但不应该完整公开。
// - disclosedFields 是外部可以看到的字段。
// - hiddenFields 是证明使用但公开报告隐藏的字段。
export function generateIncomeProof(params: {
  records: SponsorshipRecord[]
  thresholdUsd: number
  supporterThreshold: number
  period: string
}): ProofClaim {
  // 把所有赞助金额相加，得到创作者在该周期的总收入。
  // 当前为了演示会保留 totalPrivateIncomeUsd，未来真实隐私版本可以不公开这个精确值。
  const totalPrivateIncomeUsd = params.records.reduce(
    (total, record) => total + record.amountUsd,
    0,
  )

  // 支持者数量也来自私密账本。公开报告只需要知道是否达到门槛。
  const supporterCount = params.records.length

  // 证明结果：收入门槛和支持者门槛必须同时满足。
  const passed =
    totalPrivateIncomeUsd >= params.thresholdUsd &&
    supporterCount >= params.supporterThreshold

  // proofMaterial 是用于生成模拟 commitment 的材料。
  // 注意这里故意不放 sponsorLabel / sponsorAddress，避免把身份信息塞进公开 commitment 文本。
  const proofMaterial = JSON.stringify({
    period: params.period,
    supporterCount,
    thresholdUsd: params.thresholdUsd,
    totalPrivateIncomeUsd,
  })

  // 返回 ProofClaim。
  // UI 层只关心这个对象，不需要知道原始 records 的所有细节。
  return {
    id: "proof-april-2026",
    title: "Monthly creator income threshold",
    thresholdUsd: params.thresholdUsd,
    supporterThreshold: params.supporterThreshold,
    period: params.period,
    result: passed ? "passed" : "failed",
    totalPrivateIncomeUsd,
    supporterCount,
    // 可以公开披露给品牌/DAO/社区的信息。
    disclosedFields: [
      "income threshold",
      "supporter threshold",
      "report period",
      "proof result",
      "proof commitment",
    ],
    // 不应出现在公开报告里的敏感信息。
    hiddenFields: [
      "sponsor identities",
      "exact individual payments",
      "full private revenue ledger",
      "private brand relationships",
    ],
    proofHash: simpleHash(proofMaterial),
    generatedAt: "2026-05-07T00:00:00.000Z",
  }
}
