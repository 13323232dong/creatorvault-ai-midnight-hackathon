"use client"

import { CalendarDays, UserRoundCheck } from "lucide-react"
import { useLanguage } from "@/components/LanguageProvider"
import type { Creator } from "@/types/creator"
import { shortAddress } from "@/lib/formatting"
import { translateCreatorCategory, translatePeriod } from "@/lib/localized-labels"

// CreatorProfile 展示创作者的公开身份信息。
// 注意：这里展示的是可以公开的 profile，不是完整收入账本。
export function CreatorProfile({ creator }: { creator: Creator }) {
  const { language, t } = useLanguage()

  return (
    <section className="border border-[var(--line)] bg-white p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center bg-[var(--forest)] text-base font-semibold text-white">
          {creator.avatarInitials}
        </div>
        <div>
          <h2 className="text-xl font-semibold">{creator.name}</h2>
          <p className="text-sm text-[var(--muted)]">{creator.handle}</p>
        </div>
      </div>

      {/* 创作者分类和报告周期是公开报告可以披露的信息。 */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-3 border border-[var(--line)] bg-[#f8faf5] p-3">
          <UserRoundCheck size={18} className="mt-0.5 text-[var(--forest)]" />
          <div>
            <p className="text-xs text-[var(--muted)]">{t("creatorCategory")}</p>
            <p className="text-sm font-semibold">
              {translateCreatorCategory(language, creator.category)}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 border border-[var(--line)] bg-[#f8faf5] p-3">
          <CalendarDays size={18} className="mt-0.5 text-[var(--forest)]" />
          <div>
            <p className="text-xs text-[var(--muted)]">{t("reportPeriod")}</p>
            <p className="text-sm font-semibold">
              {translatePeriod(language, creator.reportPeriod)}
            </p>
          </div>
        </div>
      </div>

      {/* 钱包地址是公开地址，但 UI 上做缩写，避免视觉噪音。 */}
      {creator.walletAddress ? (
        <p className="mono mt-4 text-xs text-[var(--muted)]">
          {t("publicWallet")}: {shortAddress(creator.walletAddress)}
        </p>
      ) : null}
    </section>
  )
}
