import type { ProofClaim } from "@/types/proof"
import type { AIReport, ReportAudience } from "@/types/report"
import type { Language } from "@/lib/language"
import { translatePeriod } from "@/lib/localized-labels"

// 不同审核对象关心的语言不一样：
// - brand 关心商业合作
// - dao 关心 grant / 资助资格
// - community 关心社区透明度
// 所以同一个 proof 可以生成不同口径的报告。
const audienceCopy: Record<
  ReportAudience,
  Record<Language, { title: string; target: string; action: string }>
> = {
  brand: {
    en: {
      title: "Verified Creator Income Report",
      target: "brand review",
      action: "evaluate partnership fit",
    },
    zh: {
      title: "已验证创作者收入报告",
      target: "品牌审核",
      action: "评估合作匹配度",
    },
  },
  dao: {
    en: {
      title: "DAO Grant Eligibility Summary",
      target: "grant committee review",
      action: "assess funding eligibility",
    },
    zh: {
      title: "DAO Grant 资格摘要",
      target: "Grant 委员会审核",
      action: "评估资助资格",
    },
  },
  community: {
    en: {
      title: "Privacy-Safe Community Update",
      target: "community transparency",
      action: "understand creator momentum",
    },
    zh: {
      title: "隐私安全社区更新",
      target: "社区透明度沟通",
      action: "理解创作者增长势能",
    },
  },
}

// generateReport 把 proof 转成人类/AI 都容易读的报告。
// 它只接收 ProofClaim，不接收 SponsorshipRecord[]。
// 这是一个很重要的隐私边界：
// 报告生成器没有机会看到完整赞助明细，只能使用已经允许披露的证明结果。
export function generateReport(
  proof: ProofClaim,
  audience: ReportAudience,
  language: Language = "en",
): AIReport {
  const copy = audienceCopy[audience][language]
  const period = translatePeriod(language, proof.period)

  const summary =
    language === "zh"
      ? `Alice Chen 在 ${period} 的创作者收入与支持者数量已通过 CreatorVault 验证。品牌或资助方可以把这份报告作为合作前的可信收入证明，同时无需看到赞助者名单、单笔付款或完整私密账本。`
      : `Alice Chen's creator income and supporter count for ${period} have been verified by CreatorVault. Brands and funding partners can use this as a trustworthy partnership-readiness report without seeing sponsor lists, individual payments, or the private revenue ledger.`
  const bullets =
    language === "zh"
      ? [
          "结论：Alice 已达到本期收入门槛，具备商业合作或资助审核的基础可信度。",
          "社区信号：支持者数量达到要求，说明收入不是单一来源偶然事件。",
          "隐私保护：报告只展示验证结论，不公开赞助者身份、地址或单笔金额。",
        ]
      : [
          "Conclusion: Alice meets the income threshold for this period and is ready for partnership or funding review.",
          "Community signal: The supporter threshold is also met, showing the revenue is not a one-off payment from a single source.",
          "Privacy protection: The report shares the verification result without revealing sponsor identities, addresses, or individual payment amounts.",
        ]

  // 返回结构化报告，UI 可以直接渲染。
  // 后面如果接真实 AI API，也建议保持这种结构化输出，避免模型随意泄露字段。
  return {
    id: `report-${audience}`,
    audience,
    title: copy.title,
    summary,
    bullets,
    generatedAt: proof.generatedAt,
    source: "local-fallback",
  }
}
