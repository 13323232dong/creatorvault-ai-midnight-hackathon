"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { LockKeyhole, Plus, Trash2, WalletCards } from "lucide-react"
import { useLanguage } from "@/components/LanguageProvider"
import { formatUsd } from "@/lib/formatting"
import {
  createSponsorshipRecord,
  readSponsorshipRecords,
  writeSponsorshipRecords,
} from "@/lib/sponsorship-ledger"
import type { SponsorshipRecord } from "@/types/sponsorship"

export default function SponsorPage() {
  const { language } = useLanguage()
  const [records, setRecords] = useState<SponsorshipRecord[]>([])
  const [sponsorLabel, setSponsorLabel] = useState("")
  const [sponsorAddress, setSponsorAddress] = useState("")
  const [amountUsd, setAmountUsd] = useState("250")
  const [isPrivate, setIsPrivate] = useState(true)
  const totals = useMemo(
    () => ({
      income: records.reduce((total, record) => total + record.amountUsd, 0),
      supporters: records.length,
    }),
    [records],
  )

  useEffect(() => {
    setRecords(readSponsorshipRecords())
  }, [])

  function persist(nextRecords: SponsorshipRecord[]) {
    setRecords(nextRecords)
    writeSponsorshipRecords(nextRecords)
  }

  function handleAddRecord() {
    const amount = Number(amountUsd)

    if (!Number.isFinite(amount) || amount <= 0) {
      return
    }

    persist([
      createSponsorshipRecord({
        sponsorLabel,
        sponsorAddress,
        amountUsd: amount,
        isPrivate,
      }),
      ...records,
    ])
    setSponsorLabel("")
    setSponsorAddress("")
    setAmountUsd("250")
    setIsPrivate(true)
  }

  function handleRemoveRecord(recordId: string) {
    persist(records.filter((record) => record.id !== recordId))
  }

  return (
    <div className="container py-10">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase text-[var(--moss)]">
          {language === "zh" ? "真实赞助账本" : "Real Sponsorship Ledger"}
        </p>
        <h1 className="mt-3 text-4xl font-semibold">
          {language === "zh" ? "先录入你的真实赞助，再生成证明" : "Add real sponsorships before generating proof"}
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">
          {language === "zh"
            ? "这里不再使用假数据。你录入的每条赞助会保存在本浏览器的私密账本里，报告页会用这份账本计算收入门槛和支持者门槛。当前版本不是收款合约，只是把真实赞助记录作为 proof 输入。"
            : "This page no longer uses fake data. Each entry is stored in this browser's private ledger and used by the report page to compute the income and supporter thresholds. This version does not collect payment on-chain; it uses real sponsorship records as proof inputs."}
        </p>
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="border border-[var(--line)] bg-white p-5">
          <div className="flex items-center gap-2">
            <WalletCards className="text-[var(--forest)]" size={20} />
            <h2 className="text-lg font-semibold">
              {language === "zh" ? "新增赞助记录" : "Add Sponsorship Record"}
            </h2>
          </div>

          <label className="mt-5 block text-sm font-medium">
            {language === "zh" ? "赞助方名称" : "Sponsor name"}
          </label>
          <input
            className="mt-2 w-full border border-[var(--line)] bg-[#f8faf5] px-3 py-3"
            onChange={(event) => setSponsorLabel(event.target.value)}
            placeholder={language === "zh" ? "例如 Builder DAO" : "e.g. Builder DAO"}
            value={sponsorLabel}
          />

          <label className="mt-4 block text-sm font-medium">
            {language === "zh" ? "赞助方钱包/付款标识（可选）" : "Sponsor wallet/payment reference (optional)"}
          </label>
          <input
            className="mt-2 w-full border border-[var(--line)] bg-[#f8faf5] px-3 py-3"
            onChange={(event) => setSponsorAddress(event.target.value)}
            placeholder="0x... / tx ref / invoice ref"
            value={sponsorAddress}
          />

          <label className="mt-4 block text-sm font-medium">
            {language === "zh" ? "金额（USD）" : "Amount (USD)"}
          </label>
          <input
            className="mt-2 w-full border border-[var(--line)] bg-[#f8faf5] px-3 py-3"
            inputMode="decimal"
            onChange={(event) => setAmountUsd(event.target.value)}
            value={amountUsd}
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              className={`border px-4 py-3 text-sm font-semibold ${
                !isPrivate
                  ? "border-[var(--forest)] bg-[#e6efe2] text-[var(--forest)]"
                  : "border-[var(--line)] bg-white"
              }`}
              onClick={() => setIsPrivate(false)}
              type="button"
            >
              {language === "zh" ? "公开记录" : "Public"}
            </button>
            <button
              className={`px-4 py-3 text-sm font-semibold ${
                isPrivate
                  ? "bg-[var(--forest)] text-white"
                  : "border border-[var(--line)] bg-white"
              }`}
              onClick={() => setIsPrivate(true)}
              type="button"
            >
              {language === "zh" ? "私密记录" : "Private"}
            </button>
          </div>

          <button
            className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-[var(--forest)] px-4 py-3 text-sm font-semibold text-white"
            onClick={handleAddRecord}
            type="button"
          >
            <Plus size={17} />
            {language === "zh" ? "加入私密账本" : "Add to private ledger"}
          </button>

          <div className="mt-5 border border-[var(--line)] bg-[#fbfcf8] p-4">
            <p className="text-sm font-semibold text-[var(--ink)]">
              {language === "zh" ? "当前 proof 输入" : "Current proof inputs"}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {language === "zh" ? "总收入：" : "Total income: "}
              <span className="font-semibold text-[var(--forest)]">
                {formatUsd(totals.income)}
              </span>
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {language === "zh" ? "支持者数量：" : "Supporters: "}
              <span className="font-semibold text-[var(--forest)]">
                {totals.supporters}
              </span>
            </p>
          </div>

          <Link
            className="mt-4 inline-flex w-full items-center justify-center bg-[var(--gold)] px-4 py-3 text-sm font-semibold text-[var(--ink)]"
            href="/report"
          >
            {language === "zh" ? "去生成 proof 和证书" : "Generate proof and certificate"}
          </Link>
        </div>

        <div className="border border-[var(--line)] bg-white p-5">
          <div className="flex items-center gap-2">
            <LockKeyhole className="text-[var(--gold)]" size={20} />
            <h2 className="text-lg font-semibold">
              {language === "zh" ? "浏览器私密账本" : "Browser private ledger"}
            </h2>
          </div>
          {records.length === 0 ? (
            <div className="mt-5 border border-dashed border-[var(--line)] bg-[#fbfcf8] p-5 text-sm leading-6 text-[var(--muted)]">
              {language === "zh"
                ? "还没有赞助记录。先新增真实赞助记录，再去报告页生成 proof。"
                : "No sponsorship records yet. Add real records first, then generate proof on the report page."}
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {records.map((record) => (
                <div
                  className="flex items-center justify-between gap-4 border border-[var(--line)] bg-[#f8faf5] p-3"
                  key={record.id}
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {record.isPrivate
                        ? language === "zh"
                          ? "私密赞助者"
                          : "Private sponsor"
                        : record.sponsorLabel}
                    </p>
                    <p className="text-xs text-[var(--muted)]">{record.createdAt}</p>
                    {record.sponsorAddress ? (
                      <p className="mono mt-1 break-all text-xs text-[var(--muted)]">
                        {record.isPrivate ? "hidden reference" : record.sponsorAddress}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold">
                      {record.isPrivate
                        ? language === "zh"
                          ? "金额隐藏"
                          : "Hidden"
                        : formatUsd(record.amountUsd)}
                    </p>
                    <button
                      aria-label="Remove record"
                      className="border border-[var(--line)] bg-white p-2 text-[var(--clay)]"
                      onClick={() => handleRemoveRecord(record.id)}
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
