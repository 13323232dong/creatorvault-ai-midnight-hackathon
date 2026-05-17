"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Award, CheckCircle2 } from "lucide-react"
import { useLanguage } from "@/components/LanguageProvider"
import {
  readVerificationCertificate,
  type VerificationCertificate,
} from "@/lib/certificate"
import { formatUsd } from "@/lib/formatting"

export default function CertificatePage() {
  const { language } = useLanguage()
  const [certificate, setCertificate] = useState<VerificationCertificate>()

  useEffect(() => {
    setCertificate(readVerificationCertificate())
  }, [])

  if (!certificate) {
    return (
      <div className="container py-10">
        <section className="border border-[#d8c9a6] bg-[#fff8e3] p-6 text-[#6d5526]">
          <h1 className="text-2xl font-semibold">
            {language === "zh" ? "还没有证书" : "No certificate yet"}
          </h1>
          <p className="mt-3 text-sm leading-6">
            {language === "zh"
              ? "请先在 Sponsor 页录入赞助记录，再到 Report 页提交 proof 结果到合约。提交成功后这里会生成证书。"
              : "Add sponsorship records on Sponsor, then submit the proof result to the contract from Report. A certificate appears here after successful submission."}
          </p>
          <Link
            className="mt-4 inline-flex bg-[var(--forest)] px-4 py-3 text-sm font-semibold text-white"
            href="/sponsor"
          >
            {language === "zh" ? "从赞助记录开始" : "Start with sponsorship records"}
          </Link>
        </section>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <section className="border border-[var(--line)] bg-white p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 border border-[var(--line)] bg-[#f5f7f2] px-3 py-2 text-sm font-medium text-[var(--forest)]">
              <Award size={17} />
              {language === "zh" ? "CreatorVault 证书" : "CreatorVault Certificate"}
            </div>
            <h1 className="mt-5 text-4xl font-semibold text-[var(--ink)]">
              {language === "zh" ? "创作者收入验证证书" : "Creator Income Verification Certificate"}
            </h1>
            <p className="mt-3 text-base leading-7 text-[var(--muted)]">
              {language === "zh"
                ? "这份证书表示该创作者的收入门槛 proof 结果已经登记到 Midnight Preprod 合约。"
                : "This certificate shows that the creator's income-threshold proof result was registered on the Midnight Preprod contract."}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 bg-[#e6efe2] px-4 py-3 text-sm font-semibold text-[var(--forest)]">
            <CheckCircle2 size={18} />
            {certificate.result === "passed"
              ? language === "zh"
                ? "已通过"
                : "Passed"
              : language === "zh"
                ? "未通过"
                : "Failed"}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="border border-[var(--line)] bg-[#fbfcf8] p-4">
            <p className="text-xs text-[var(--muted)]">
              {language === "zh" ? "创作者" : "Creator"}
            </p>
            <p className="mt-1 text-lg font-semibold">{certificate.creatorName}</p>
          </div>
          <div className="border border-[var(--line)] bg-[#fbfcf8] p-4">
            <p className="text-xs text-[var(--muted)]">
              {language === "zh" ? "报告周期" : "Period"}
            </p>
            <p className="mt-1 text-lg font-semibold">{certificate.period}</p>
          </div>
          <div className="border border-[var(--line)] bg-[#fbfcf8] p-4">
            <p className="text-xs text-[var(--muted)]">
              {language === "zh" ? "签发时间" : "Issued"}
            </p>
            <p className="mt-1 text-lg font-semibold">
              {new Date(certificate.issuedAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="border border-[var(--line)] bg-[#f8faf5] p-5">
            <p className="text-sm font-semibold text-[var(--ink)]">
              {language === "zh" ? "验证门槛" : "Verified thresholds"}
            </p>
            <p className="mt-3 text-sm text-[var(--muted)]">
              {language === "zh" ? "收入门槛：" : "Income threshold: "}
              <span className="font-semibold text-[var(--forest)]">
                {formatUsd(certificate.thresholdUsd)}+
              </span>
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {language === "zh" ? "支持者门槛：" : "Supporter threshold: "}
              <span className="font-semibold text-[var(--forest)]">
                {certificate.supporterThreshold}+
              </span>
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {language === "zh" ? "本次支持者数量：" : "Supporters used: "}
              <span className="font-semibold text-[var(--forest)]">
                {certificate.supporterCount}
              </span>
            </p>
          </div>
          <div className="border border-[#d8c9a6] bg-[#fff8e3] p-5 text-[#6d5526]">
            <p className="text-sm font-semibold">
              {language === "zh" ? "隐私边界" : "Privacy boundary"}
            </p>
            <p className="mt-3 text-sm leading-6">
              {language === "zh"
                ? "证书不包含赞助者身份、赞助者地址、单笔付款金额或完整私密账本。"
                : "The certificate does not include sponsor identities, sponsor addresses, individual payments, or the full private ledger."}
            </p>
          </div>
        </div>

        <details className="mt-6 border border-[var(--line)] bg-[#fbfcf8] p-4">
          <summary className="cursor-pointer text-sm font-semibold text-[var(--ink)]">
            {language === "zh" ? "链上验证信息" : "On-chain verification"}
          </summary>
          <div className="mono mt-4 space-y-2 break-all text-xs leading-5 text-[var(--muted)]">
            <p>contractAddress={certificate.contractAddress}</p>
            <p>txId={certificate.txId}</p>
            <p>txHash={certificate.txHash}</p>
            <p>blockHeight={certificate.blockHeight}</p>
            <p>proofKey={certificate.proofKey}</p>
            <p>proofCommitment={certificate.proofCommitment}</p>
          </div>
        </details>
      </section>
    </div>
  )
}
