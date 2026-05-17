"use client"

import { AiReportPanel } from "@/components/AiReportPanel"
import { useLanguage } from "@/components/LanguageProvider"
import { ProofCard } from "@/components/ProofCard"
import { demoCreator, demoSponsorshipRecords } from "@/lib/demo-data"
import { generateIncomeProof } from "@/lib/proof-engine"
import { generateReport } from "@/lib/report-generator"

// Report 页面展示“同一个证明结果，给不同受众生成不同报告”。
// 这里的关键业务点是：
// AI 报告不能绕过隐私规则，它只能读取已经允许公开披露的 proof 输出。
export default function ReportPage() {
  const { language, t } = useLanguage()

  // 先根据 demo 收入记录生成证明。
  const proof = generateIncomeProof({
    records: demoSponsorshipRecords,
    thresholdUsd: 1000,
    supporterThreshold: 4,
    period: demoCreator.reportPeriod,
  })

  // 品牌报告：适合商业合作审核。
  const brandReport = generateReport(proof, "brand", language)

  // DAO 报告：适合社区基金、Grant、治理委员会审核。
  const daoReport = generateReport(proof, "dao", language)

  return (
    <div className="container py-10">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase text-[var(--moss)]">
          {t("reportBadge")}
        </p>
        <h1 className="mt-3 text-4xl font-semibold">
          {t("reportTitle")}
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">
          {t("reportBody")}
        </p>
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[480px_1fr]">
        {/* 左边保留可验证的 proof card，右边展示 AI 摘要。 */}
        <ProofCard proof={proof} />
        <div className="space-y-6">
          <AiReportPanel report={brandReport} />
          <AiReportPanel report={daoReport} />
        </div>
      </section>
    </div>
  )
}
