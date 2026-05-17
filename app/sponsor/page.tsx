"use client"

import { LockKeyhole, WalletCards } from "lucide-react"
import { useLanguage } from "@/components/LanguageProvider"
import { demoSponsorshipRecords } from "@/lib/demo-data"
import { formatUsd } from "@/lib/formatting"
import { translateSponsorLabel } from "@/lib/localized-labels"

// Sponsor 页面是下一步要重点扩展的地方。
// 当前版本先做“静态模拟”，让评委和我们自己先理解：
// 同样是赞助数据，有些可以公开，有些应该作为私密输入保留。
export default function SponsorPage() {
  const { language, t } = useLanguage()

  return (
    <div className="container py-10">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase text-[var(--moss)]">
          {t("sponsorBadge")}
        </p>
        <h1 className="mt-3 text-4xl font-semibold">{t("sponsorTitle")}</h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">
          {t("sponsorBody")}
        </p>
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[420px_1fr]">
        {/* 左侧是赞助输入区。
            下一步会把它改成真正的交互：
            - 输入赞助金额
            - 选择 Public / Private
            - 更新本地 ledger
            - 重新计算 proof */}
        <div className="border border-[var(--line)] bg-white p-5">
          <div className="flex items-center gap-2">
            <WalletCards className="text-[var(--forest)]" size={20} />
            <h2 className="text-lg font-semibold">{t("demoSponsorship")}</h2>
          </div>
          <label className="mt-5 block text-sm font-medium">{t("amount")}</label>
          <input
            className="mt-2 w-full border border-[var(--line)] bg-[#f8faf5] px-3 py-3"
            defaultValue="250"
            readOnly
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {/* Public：公开赞助，未来可以显示 sponsor label 和金额。 */}
            <button className="border border-[var(--line)] bg-white px-4 py-3 text-sm font-semibold">
              {t("public")}
            </button>
            {/* Private：私密赞助，未来进入 proof 计算，但公开报告隐藏明细。 */}
            <button className="bg-[var(--forest)] px-4 py-3 text-sm font-semibold text-white">
              {t("private")}
            </button>
          </div>
          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
            {t("sponsorSkeletonBody")}
          </p>
        </div>

        {/* 右侧是“私密账本预览”。
            它模拟创作者自己能看到的完整收入记录；
            但公开报告不能直接暴露这里的全部内容。 */}
        <div className="border border-[var(--line)] bg-white p-5">
          <div className="flex items-center gap-2">
            <LockKeyhole className="text-[var(--gold)]" size={20} />
            <h2 className="text-lg font-semibold">{t("privateLedgerPreview")}</h2>
          </div>
          <div className="mt-5 space-y-3">
            {demoSponsorshipRecords.map((record) => (
              // record.isPrivate 决定这一条记录在公开视图里是否隐藏身份和金额。
              <div
                className="flex items-center justify-between gap-4 border border-[var(--line)] bg-[#f8faf5] p-3"
                key={record.id}
              >
                <div>
                  <p className="text-sm font-semibold">
                    {record.isPrivate
                      ? t("privateSponsor")
                      : translateSponsorLabel(language, record.sponsorLabel)}
                  </p>
                  <p className="text-xs text-[var(--muted)]">{record.createdAt}</p>
                </div>
                <p className="text-sm font-semibold">
                  {record.isPrivate ? t("hidden") : formatUsd(record.amountUsd)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
