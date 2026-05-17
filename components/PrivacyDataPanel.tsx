"use client"

import { Eye, EyeOff } from "lucide-react"
import { useLanguage } from "@/components/LanguageProvider"
import { translateProofField } from "@/lib/localized-labels"
import type { ProofClaim } from "@/types/proof"

// PrivacyDataPanel 用来解释“隐私项目到底隐藏了什么、公开了什么”。
// 这是 Midnight/ZK 叙事里很重要的一块：
// 不是所有数据都上公开账本，而是把原始数据变成可验证的公开结论。
export function PrivacyDataPanel({ proof }: { proof: ProofClaim }) {
  const { language, t } = useLanguage()

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {/* 左侧：私密输入。它们参与 proof 计算，但不应该被公开报告展示。 */}
      <div className="border border-[var(--line)] bg-white p-5">
        <div className="flex items-center gap-2">
          <EyeOff className="text-[var(--clay)]" size={20} />
          <h2 className="text-lg font-semibold">{t("privateDataTitle")}</h2>
        </div>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {t("privateDataBody")}
        </p>
        <ul className="mt-4 space-y-2">
          {/* hiddenFields 来自 proof-engine，代表本次证明隐藏了哪些字段。 */}
          {proof.hiddenFields.map((field) => (
            <li
              className="border border-[#eadbd5] bg-[#fff8f5] px-3 py-2 text-sm"
              key={field}
            >
              {translateProofField(language, field)}
            </li>
          ))}
        </ul>
      </div>

      {/* 右侧：公开输出。外部审核者只看到这些安全披露字段。 */}
      <div className="border border-[var(--line)] bg-white p-5">
        <div className="flex items-center gap-2">
          <Eye className="text-[var(--blue)]" size={20} />
          <h2 className="text-lg font-semibold">{t("disclosedDataTitle")}</h2>
        </div>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {t("disclosedDataBody")}
        </p>
        <ul className="mt-4 space-y-2">
          {/* disclosedFields 是可分享信息，例如门槛、周期、证明结果。 */}
          {proof.disclosedFields.map((field) => (
            <li
              className="border border-[#d6e3ea] bg-[#f4fafc] px-3 py-2 text-sm"
              key={field}
            >
              {translateProofField(language, field)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
