"use client"

import { Languages } from "lucide-react"
import { useLanguage, type Language } from "@/components/LanguageProvider"

const languageOptions: Array<{ label: string; value: Language }> = [
  { label: "EN", value: "en" },
  { label: "中", value: "zh" },
]

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <div
      aria-label="Language selector"
      className="flex items-center gap-1 border border-[var(--line)] bg-white p-1"
    >
      <Languages aria-hidden="true" className="ml-2 text-[var(--moss)]" size={16} />
      {languageOptions.map((option) => {
        const isActive = option.value === language

        return (
          <button
            aria-pressed={isActive}
            className={[
              "min-h-8 px-2.5 text-xs font-semibold transition",
              isActive
                ? "bg-[var(--forest)] text-white"
                : "text-[var(--muted)] hover:bg-[#e9ede4] hover:text-[var(--forest)]",
            ].join(" ")}
            key={option.value}
            onClick={() => setLanguage(option.value)}
            type="button"
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
