"use client"

import { useLanguage, type CopyKey } from "@/components/LanguageProvider"

// 架构图的三个步骤。
// 这不是复杂技术图，而是评委能快速理解的产品逻辑：
// 私密输入 -> 证明逻辑 -> 公开输出。
const steps: Array<{ titleKey: CopyKey; bodyKey: CopyKey }> = [
  {
    titleKey: "privateInputs",
    bodyKey: "privateInputsBody",
  },
  {
    titleKey: "proofLogic",
    bodyKey: "proofLogicBody",
  },
  {
    titleKey: "disclosedOutputs",
    bodyKey: "disclosedOutputsBody",
  },
]

// ArchitectureDiagram 用卡片形式解释当前 MVP 的证明流水线。
// 未来如果接入 Midnight，这里的“Proof logic”会对应 Compact circuit / ZK proof。
export function ArchitectureDiagram() {
  const { t } = useLanguage()

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {steps.map((step, index) => (
        <div className="border border-[var(--line)] bg-white p-5" key={step.titleKey}>
          <span className="flex h-9 w-9 items-center justify-center bg-[var(--forest)] text-sm font-semibold text-white">
            {index + 1}
          </span>
          <h2 className="mt-4 text-lg font-semibold">{t(step.titleKey)}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {t(step.bodyKey)}
          </p>
        </div>
      ))}
    </section>
  )
}
