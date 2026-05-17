"use client"

import { ArchitectureDiagram } from "@/components/ArchitectureDiagram"
import { useLanguage } from "@/components/LanguageProvider"
import { MidnightWalletPanel } from "@/components/MidnightWalletPanel"
import { PrivacyDataPanel } from "@/components/PrivacyDataPanel"
import { demoCreator, demoSponsorshipRecords } from "@/lib/demo-data"
import { generateIncomeProof } from "@/lib/proof-engine"

// Architecture 页面不是给普通用户看的主流程，
// 而是给评委/开发者看的“技术解释页”：
// 当前 MVP 怎样模拟 ZK/隐私证明，未来怎样映射到 Midnight / Compact。
export default function ArchitecturePage() {
  const { t } = useLanguage()

  // 这里复用同一份证明逻辑，保证页面展示和首页的 proof 口径一致。
  const proof = generateIncomeProof({
    records: demoSponsorshipRecords,
    thresholdUsd: 1000,
    supporterThreshold: 4,
    period: demoCreator.reportPeriod,
  })

  return (
    <div className="container py-10">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase text-[var(--moss)]">
          {t("architectureBadge")}
        </p>
        <h1 className="mt-3 text-4xl font-semibold">
          {t("architectureTitle")}
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">
          {t("architectureBody")}
        </p>
      </div>

      <section className="mt-8">
        <ArchitectureDiagram />
      </section>

      <section className="mt-6">
        <MidnightWalletPanel />
      </section>

      <section className="mt-6">
        <PrivacyDataPanel proof={proof} />
      </section>

      <section className="mt-6 border border-[var(--line)] bg-white p-5">
        <p className="text-sm font-semibold uppercase text-[var(--moss)]">
          {t("compactDirection")}
        </p>
        {/* 这段不是正式 Compact 代码，而是“伪代码方向”。
            用来向评委说明我们理解 Midnight 的核心思想：
            privateLedger 是私密输入，threshold / period / true 是公开输出。 */}
        <pre className="mono mt-4 overflow-x-auto bg-[#17201a] p-5 text-sm leading-6 text-[#eff5e9]">
{`circuit proveCreatorIncome(privateLedger, threshold, period) {
  total = sum(privateLedger)
  assert(total >= threshold)

  disclose(threshold)
  disclose(period)
  disclose(true)
}`}
        </pre>
      </section>
    </div>
  )
}
