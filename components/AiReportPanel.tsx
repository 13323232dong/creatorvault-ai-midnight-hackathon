"use client"

import { Sparkles } from "lucide-react"
import { useLanguage } from "@/components/LanguageProvider"
import type { AIReport } from "@/types/report"

// AiReportPanel 展示 AI 生成的“可读报告”。
// 重点：AI 不应该直接拿隐私原始数据写报告；
// 它应该只基于 proof 的公开输出生成摘要。
export function AiReportPanel({ report }: { report: AIReport }) {
  const { t } = useLanguage()

  return (
    <section className="border border-[var(--line)] bg-white p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="text-[var(--gold)]" size={20} />
        <p className="text-xs font-semibold uppercase text-[var(--moss)]">
          {report.source === "deepseek-v4" ? "DeepSeek V4 Report" : t("aiReportLabel")}
        </p>
      </div>
      <h2 className="mt-3 text-xl font-semibold">{report.title}</h2>
      {report.model ? (
        <p className="mt-2 text-xs text-[var(--muted)]">model: {report.model}</p>
      ) : null}
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        {report.summary}
      </p>
      <ul className="mt-4 space-y-2">
        {/* bullets 是给品牌/DAO快速扫描的审核要点。 */}
        {report.bullets.map((bullet) => (
          <li className="border-l-2 border-[var(--gold)] pl-3 text-sm" key={bullet}>
            {bullet}
          </li>
        ))}
      </ul>
    </section>
  )
}
