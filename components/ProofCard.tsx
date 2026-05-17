"use client"

import { CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react"
import { useLanguage } from "@/components/LanguageProvider"
import type { ProofClaim } from "@/types/proof"
import { formatUsd } from "@/lib/formatting"
import { translatePeriod } from "@/lib/localized-labels"

// ProofCard 是这个产品最核心的视觉组件之一。
// 它展示的不是“原始收入明细”，而是证明后的公开结果：
// - 收入是否达到门槛
// - 支持者数量是否达到门槛
// - 哪些信息被隐藏
// - proof commitment 是什么
export function ProofCard({ proof }: { proof: ProofClaim }) {
  const { language, t } = useLanguage()
  // proof.result 是证明结果。这里把它转成 boolean，方便控制 UI 状态。
  const passed = proof.result === "passed"
  const period = translatePeriod(language, proof.period)

  return (
    <section className="border border-[var(--line)] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-[var(--moss)]">
            {t("proofCardLabel")}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--ink)]">
            {t("proofTitle")}
          </h2>
        </div>
        <span
          // 通过/失败使用不同颜色，评委一眼能看出证明结果。
          className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold ${
            passed
              ? "bg-[#e6efe2] text-[var(--forest)]"
              : "bg-[#f3ded7] text-[var(--clay)]"
          }`}
        >
          <CheckCircle2 size={18} />
          {passed ? t("proofPassed") : t("proofFailed")}
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {/* 公开门槛：外部只需要知道“门槛是多少”，不需要知道每笔收入。 */}
        <div className="border border-[var(--line)] bg-[#f8faf5] p-4">
          <p className="text-xs text-[var(--muted)]">{t("incomeThreshold")}</p>
          <p className="mt-1 text-lg font-semibold">
            {formatUsd(proof.thresholdUsd)}+
          </p>
        </div>
        {/* 支持者数量门槛：证明社区支持度，而不是公开每个支持者身份。 */}
        <div className="border border-[var(--line)] bg-[#f8faf5] p-4">
          <p className="text-xs text-[var(--muted)]">{t("supporterThreshold")}</p>
          <p className="mt-1 text-lg font-semibold">
            {language === "zh"
              ? `${proof.supporterThreshold}+ ${t("supporters")}`
              : `${proof.supporterThreshold}+ ${t("supporters")}`}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {/* Disclosed result：可以公开给品牌/DAO看的结果。 */}
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 text-[var(--forest)]" size={20} />
          <p className="text-sm text-[var(--muted)]">
            {t("disclosedResult", { period })}
          </p>
        </div>
        {/* Hidden details：仍然参与证明计算，但不出现在公开报告里。 */}
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-0.5 text-[var(--gold)]" size={20} />
          <p className="text-sm text-[var(--muted)]">
            {t("hiddenDetails")}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-[var(--line)] pt-4">
        {/* proofHash 当前是模拟的 commitment。
            未来如果接 Midnight/ZK，这里可以替换成真实证明或承诺值。 */}
        <p className="text-xs text-[var(--muted)]">{t("proofCommitment")}</p>
        <p className="mono mt-1 break-all text-sm text-[var(--forest)]">
          {proof.proofHash}
        </p>
      </div>
    </section>
  )
}
