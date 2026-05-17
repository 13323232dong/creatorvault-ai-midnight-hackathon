// 报告受众类型。
// 同一份 proof 可以针对品牌、DAO、社区生成不同文案。
export type ReportAudience = "brand" | "dao" | "community"

// AI 报告结构。
// 这里先是本地规则生成，未来可以替换成真实 AI API 的结构化输出。
export type AIReport = {
  // 报告 ID。
  id: string
  // 报告面向谁。
  audience: ReportAudience
  // 报告标题。
  title: string
  // 一段摘要。
  summary: string
  // 审核要点列表。
  bullets: string[]
  // 生成时间。
  generatedAt: string
}
