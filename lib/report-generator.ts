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
      ? `Alice 在 ${period} 已通过所选收入和支持者门槛。该报告帮助${copy.target}${copy.action}，同时不暴露赞助者身份、精确付款金额或完整私密收入账本。`
      : `Alice passed the selected income and supporter thresholds for ${period}. This report helps ${copy.target} ${copy.action} without exposing sponsor identities, exact payments, or the full private revenue ledger.`
  const bullets =
    language === "zh"
      ? [
          "收入门槛已验证，同时不披露单笔精确付款。",
          "支持者门槛已验证，同时不暴露私密赞助者身份。",
          "公开结果适合审核使用，并保护创作者与赞助者隐私。",
        ]
      : [
          "Income threshold verified without disclosing exact individual payments.",
          "Supporter threshold verified without revealing private sponsor identities.",
          "The disclosed result is suitable for review while preserving creator and sponsor privacy.",
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
