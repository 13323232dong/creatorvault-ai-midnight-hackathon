"use client"

import Link from "next/link"
import { ArrowRight, ShieldCheck } from "lucide-react"
import { AiReportPanel } from "@/components/AiReportPanel"
import { CreatorProfile } from "@/components/CreatorProfile"
import { useLanguage } from "@/components/LanguageProvider"
import { MidnightConnectionStatus } from "@/components/MidnightConnectionStatus"
import { PrivacyDataPanel } from "@/components/PrivacyDataPanel"
import { ProofCard } from "@/components/ProofCard"
import { demoCreator, demoSponsorshipRecords } from "@/lib/demo-data"
import { generateIncomeProof } from "@/lib/proof-engine"
import { generateReport } from "@/lib/report-generator"

// 首页 Dashboard。
// 这个页面负责把整个产品故事压缩成一屏：
// 1. 创作者有私密收入账本。
// 2. 系统生成一个“收入/支持者门槛已通过”的证明。
// 3. 品牌或 DAO 看到的是证明结果，不是完整收入明细。
export default function DashboardPage() {
  const { language, t } = useLanguage()

  // 这里先用 demoSponsorshipRecords 模拟真实业务里的“赞助收入记录”。
  // 未来接入真实链或 Midnight 时，这些 records 可以来自：
  // - 用户本地私密数据
  // - 钱包/合约读取结果
  // - Midnight private witness
  const proof = generateIncomeProof({
    records: demoSponsorshipRecords,
    thresholdUsd: 1000,
    supporterThreshold: 4,
    period: demoCreator.reportPeriod,
  })

  // 根据 proof 生成给品牌看的报告。
  // 注意：报告只使用 proof 的公开字段，不直接暴露 sponsor identities / exact payments。
  const report = generateReport(proof, "brand", language)

  return (
    <div className="container py-10">
      {/* 首屏 Hero：告诉评委这个项目解决的核心问题。 */}
      <section className="grid gap-6 lg:grid-cols-[1fr_480px] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--forest)]">
            <ShieldCheck size={17} />
            {t("heroBadge")}
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight text-[var(--ink)] md:text-6xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted)]">
            {t("heroBody")}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center gap-2 bg-[var(--forest)] px-5 py-3 text-sm font-semibold !text-white"
              href="/report"
            >
              {t("heroPrimary")}
              <ArrowRight size={17} />
            </Link>
            <Link
              className="inline-flex items-center gap-2 border border-[var(--forest)] px-5 py-3 text-sm font-semibold text-[var(--forest)]"
              href="/architecture"
            >
              {t("heroSecondary")}
            </Link>
          </div>
        </div>

        {/* ProofCard 是核心展示组件：把证明结果包装成评委能一眼看懂的卡片。 */}
        <ProofCard proof={proof} />
      </section>

      <section className="mt-6">
        <MidnightConnectionStatus />
      </section>

      {/* 创作者资料 + 隐私/公开数据对比。 */}
      <section className="mt-8 grid gap-6 lg:grid-cols-[420px_1fr]">
        <CreatorProfile creator={demoCreator} />
        <PrivacyDataPanel proof={proof} />
      </section>

      {/* AI 报告区：演示如何把证明结果变成商业可读的审核报告。 */}
      <section className="mt-6">
        <AiReportPanel report={report} />
      </section>
    </div>
  )
}
