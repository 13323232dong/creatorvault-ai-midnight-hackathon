"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CheckCircle2, FileText, Loader2, LockKeyhole, RadioTower, Sparkles, WalletCards } from "lucide-react"
import { AiReportPanel } from "@/components/AiReportPanel"
import { useLanguage } from "@/components/LanguageProvider"
import { useMidnightWallet } from "@/components/MidnightWalletProvider"
import { ProofCard } from "@/components/ProofCard"
import { demoCreator } from "@/lib/demo-data"
import {
  createVerificationCertificate,
  writeVerificationCertificate,
} from "@/lib/certificate"
import {
  createPrivacySafeReportRequest,
  generateDeepSeekReports,
} from "@/lib/deepseek-report-client"
import {
  creatorVaultPreprodDeployment,
  submitIncomeProofToCreatorVault,
  type CreatorVaultDeploymentProgress,
  type CreatorVaultProofSubmissionResult,
} from "@/lib/midnight/creator-vault-contract"
import {
  createIncomeProofSubmission,
  summarizeIncomeProofSubmission,
} from "@/lib/midnight/proof-submission"
import { generateIncomeProof } from "@/lib/proof-engine"
import { generateReport } from "@/lib/report-generator"
import { readSponsorshipRecords } from "@/lib/sponsorship-ledger"
import type { AIReport, ReportAudience } from "@/types/report"
import type { SponsorshipRecord } from "@/types/sponsorship"

type ReportGenerationState =
  | { status: "idle" }
  | { status: "generating" }
  | { status: "generated"; reports: AIReport[]; source: string; model: string }
  | { status: "failed"; message: string; reports: AIReport[] }

type ChainSubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "submitted"; result: CreatorVaultProofSubmissionResult }
  | { status: "failed"; message: string }

const audiences: ReportAudience[] = ["brand"]

function hasPositiveDust(balance?: string) {
  if (!balance) {
    return false
  }

  try {
    return BigInt(balance) > BigInt(0)
  } catch {
    return Number(balance) > 0
  }
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return [error.name, error.message, error.cause ? JSON.stringify(error.cause) : ""]
      .filter(Boolean)
      .join(": ")
  }

  return typeof error === "string" ? error : "未知错误"
}

// Report 页面展示“同一个证明结果，给不同受众生成不同报告”。
// 这里的关键业务点是：
// AI 报告不能绕过隐私规则，它只能读取已经允许公开披露的 proof 输出。
export default function ReportPage() {
  const { language, t } = useLanguage()
  const { connection, connectWallet, error, isAutoConnecting } = useMidnightWallet()
  const [records, setRecords] = useState<SponsorshipRecord[]>([])
  const [reportState, setReportState] = useState<ReportGenerationState>({
    status: "idle",
  })
  const [submissionState, setSubmissionState] = useState<ChainSubmissionState>({
    status: "idle",
  })
  const [submissionProgress, setSubmissionProgress] = useState<
    CreatorVaultDeploymentProgress[]
  >([])

  useEffect(() => {
    setRecords(readSponsorshipRecords())
  }, [])

  const proof = generateIncomeProof({
    records,
    thresholdUsd: 1000,
    supporterThreshold: 4,
    period: demoCreator.reportPeriod,
  })

  const proofSubmission = useMemo(
    () => createIncomeProofSubmission(proof, demoCreator),
    [proof],
  )
  const submissionSummary = useMemo(
    () => summarizeIncomeProofSubmission(proofSubmission),
    [proofSubmission],
  )
  const canSubmitToChain =
    connection?.status.status === "connected" &&
    connection.configuration.networkId === "preprod" &&
    hasPositiveDust(connection.balances.dustBalance) &&
    proof.result === "passed"

  async function handleGenerateReports() {
    setReportState({ status: "generating" })

    const fallbackReports = audiences.map((audience) =>
      generateReport(proof, audience, language),
    )

    try {
      const result = await generateDeepSeekReports(
        createPrivacySafeReportRequest(proof, audiences, language),
      )

      setReportState({
        status: "generated",
        reports: result.reports,
        source: result.source,
        model: result.model,
      })
    } catch (reportError) {
      console.error("DeepSeek report generation failed", reportError)
      setReportState({
        status: "failed",
        message: formatError(reportError),
        reports: fallbackReports,
      })
    }
  }

  async function handleSubmitProof() {
    if (!connection?.connected) {
      setSubmissionState({
        status: "failed",
        message: "请先连接 Lace 钱包，再提交 proof 结果到 Midnight Preprod。",
      })
      return
    }

    try {
      setSubmissionProgress([])
      setSubmissionState({ status: "submitting" })
      const result = await submitIncomeProofToCreatorVault(
        connection.connected,
        proofSubmission,
        {
          onProgress(progress) {
            setSubmissionProgress((current) => [...current, progress])
          },
        },
      )

      writeVerificationCertificate(
        createVerificationCertificate({
          creatorName: demoCreator.name,
          proof,
          submission: result,
        }),
      )
      setSubmissionState({ status: "submitted", result })
    } catch (submitError) {
      console.error("CreatorVault proof submission failed", submitError)
      setSubmissionState({
        status: "failed",
        message: formatError(submitError),
      })
      await connectWallet("auto").catch(() => undefined)
    }
  }

  return (
    <div className="container py-10">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase text-[var(--moss)]">
          {language === "zh" ? "品牌合作收入证明" : "Brand Partnership Income Report"}
        </p>
        <h1 className="mt-3 text-4xl font-semibold">
          {language === "zh"
            ? "给品牌看的可信创作者收入报告"
            : "A Trustworthy Creator Income Report for Brands"}
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">
          {language === "zh"
            ? "CreatorVault 帮创作者证明“我确实达到收入和支持者门槛”，但不把赞助者名单、单笔金额和完整账本暴露给品牌。"
            : "CreatorVault helps creators prove they meet income and supporter thresholds without exposing sponsor lists, individual payments, or the full private ledger."}
        </p>
      </div>

      {records.length === 0 ? (
        <section className="mt-8 border border-[#d8c9a6] bg-[#fff8e3] p-6 text-sm leading-6 text-[#6d5526]">
          <h2 className="text-xl font-semibold text-[#6d5526]">
            {language === "zh" ? "还没有真实赞助记录" : "No real sponsorship records yet"}
          </h2>
          <p className="mt-3">
            {language === "zh"
              ? "请先去 Sponsor 页录入真实赞助记录。报告页不会再使用样例假数据；没有私密账本输入，就不会生成通过证明。"
              : "Go to the Sponsor page first and add real sponsorship records. The report page no longer uses sample fake data; without private ledger inputs, it will not generate a passing proof."}
          </p>
          <Link
            className="mt-4 inline-flex bg-[var(--forest)] px-4 py-3 font-semibold text-white"
            href="/sponsor"
          >
            {language === "zh" ? "去录入赞助" : "Add sponsorship records"}
          </Link>
        </section>
      ) : null}

      <section className="mt-8 grid gap-6 lg:grid-cols-[480px_1fr]">
        <section className="border border-[var(--line)] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-[var(--moss)]">
            {language === "zh" ? "本期结论" : "This Period"}
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-[var(--ink)]">
            {proof.result === "passed"
              ? language === "zh"
                ? "Alice 已通过收入可信度验证"
                : "Alice Passed Income Credibility Verification"
              : language === "zh"
                ? "等待真实赞助记录达到门槛"
                : "Waiting for real sponsorship records to meet thresholds"}
          </h2>
          <div className="mt-5 grid gap-3">
            <div className="border border-[var(--line)] bg-[#f8faf5] p-4">
              <p className="text-xs text-[var(--muted)]">
                {language === "zh" ? "验证结果" : "Verification Result"}
              </p>
              <p className="mt-1 text-lg font-semibold text-[var(--forest)]">
                {proof.result === "passed"
                  ? language === "zh"
                    ? `达到 $${proof.thresholdUsd.toLocaleString()}+ 收入门槛`
                    : `Meets $${proof.thresholdUsd.toLocaleString()}+ income threshold`
                  : language === "zh"
                    ? `当前收入未达到 $${proof.thresholdUsd.toLocaleString()} 门槛`
                    : `Current income is below the $${proof.thresholdUsd.toLocaleString()} threshold`}
              </p>
            </div>
            <div className="border border-[var(--line)] bg-[#f8faf5] p-4">
              <p className="text-xs text-[var(--muted)]">
                {language === "zh" ? "社区支持" : "Community Support"}
              </p>
              <p className="mt-1 text-lg font-semibold text-[var(--forest)]">
                {proof.supporterCount >= proof.supporterThreshold
                  ? language === "zh"
                    ? `达到 ${proof.supporterThreshold}+ 支持者门槛`
                    : `Meets ${proof.supporterThreshold}+ supporter threshold`
                  : language === "zh"
                    ? `当前 ${proof.supporterCount} 位支持者，未达到 ${proof.supporterThreshold} 位门槛`
                    : `${proof.supporterCount} supporters so far; below the ${proof.supporterThreshold} supporter threshold`}
              </p>
            </div>
            <div className="border border-[var(--line)] bg-[#fbfcf8] p-4">
              <p className="text-xs text-[var(--muted)]">
                {language === "zh" ? "本地私密账本输入" : "Local private ledger input"}
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                {language === "zh"
                  ? `${records.length} 条真实录入记录参与计算`
                  : `${records.length} manually entered records used`}
              </p>
            </div>
            <div className="border border-[#d8c9a6] bg-[#fff8e3] p-4">
              <p className="text-xs font-semibold text-[#6d5526]">
                {language === "zh" ? "不会公开" : "Not Shared"}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#6d5526]">
                {language === "zh"
                  ? "赞助者身份、钱包地址、每笔付款金额、完整私密收入账本。"
                  : "Sponsor identities, wallet addresses, individual payment amounts, and the full private income ledger."}
              </p>
            </div>
          </div>
          <details className="mt-5 border-t border-[var(--line)] pt-4">
            <summary className="cursor-pointer text-sm font-semibold text-[var(--moss)]">
              {language === "zh" ? "查看 proof 卡片" : "View Proof Card"}
            </summary>
            <div className="mt-4">
              <ProofCard proof={proof} />
            </div>
          </details>
        </section>
        <div className="space-y-6">
          <section className="border border-[var(--line)] bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="text-[var(--gold)]" size={20} />
                  <p className="text-xs font-semibold uppercase text-[var(--moss)]">
                    {language === "zh" ? "AI 报告生成器" : "AI Report Generator"}
                  </p>
                </div>
                <h2 className="mt-3 text-xl font-semibold">
                  {language === "zh" ? "生成一份品牌能看懂的报告" : "Generate a brand-readable report"}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  {language === "zh"
                    ? "DeepSeek V4 会把验证结果写成品牌审核语言。它只知道“是否通过、门槛、周期和证明承诺值”，不知道任何私密赞助明细。"
                    : "DeepSeek V4 turns the verification result into brand-review language. It only receives pass status, thresholds, period, and proof commitment, not private sponsorship details."}
                </p>
              </div>
              <button
                className="inline-flex items-center gap-2 bg-[var(--forest)] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#9ba99c]"
                disabled={reportState.status === "generating"}
                onClick={handleGenerateReports}
                type="button"
              >
                {reportState.status === "generating" ? (
                  <Loader2 className="animate-spin" size={17} />
                ) : (
                  <FileText size={17} />
                )}
                  {reportState.status === "generating"
                    ? language === "zh"
                      ? "生成中"
                      : "Generating"
                  : language === "zh"
                    ? "用 DeepSeek V4 生成"
                    : "Generate with DeepSeek V4"}
              </button>
            </div>

            <details className="mt-5 border border-[var(--line)] bg-[#fbfcf8] p-4">
              <summary className="cursor-pointer text-sm font-semibold text-[var(--ink)]">
                {language === "zh" ? "AI 看到/看不到什么" : "What AI Can and Cannot See"}
              </summary>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="border border-[var(--line)] bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
                    <CheckCircle2 size={16} />
                    {language === "zh" ? "可以看到" : "Can See"}
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                    {proof.disclosedFields.map((field) => (
                      <li key={field}>{field}</li>
                    ))}
                  </ul>
                </div>
                <div className="border border-[var(--line)] bg-[#fff8e8] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
                    <LockKeyhole size={16} />
                    {language === "zh" ? "不能看到" : "Cannot See"}
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                    {proof.hiddenFields.map((field) => (
                      <li key={field}>{field}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </details>
          </section>

          {reportState.status === "idle" ? (
            <section className="border border-dashed border-[var(--line)] bg-[#fbfcf8] p-5 text-sm leading-6 text-[var(--muted)]">
              {language === "zh"
                ? "点击上方按钮后，会通过服务端 DeepSeek V4 代理生成品牌审核报告。"
                : "Click the button above to generate a brand-review report through the server-side DeepSeek V4 proxy."}
            </section>
          ) : null}

          {reportState.status === "generated" ? (
            <section className="border border-[#b8d6bd] bg-[#f0f8f1] p-4 text-sm leading-6 text-[var(--forest)]">
              {language === "zh"
                ? `报告来源：${reportState.source} / ${reportState.model}`
                : `Report source: ${reportState.source} / ${reportState.model}`}
            </section>
          ) : null}

          {reportState.status === "failed" ? (
            <section className="border border-[#d8c9a6] bg-[#fff8e3] p-4 text-sm leading-6 text-[#6d5526]">
              {language === "zh"
                ? `DeepSeek 生成暂时不可用，已回退到本地隐私安全报告。原因：${reportState.message}`
                : `DeepSeek generation is temporarily unavailable. Using local privacy-safe fallback. Reason: ${reportState.message}`}
            </section>
          ) : null}

          {reportState.status === "generated"
            ? reportState.reports.map((report) => (
                <AiReportPanel key={report.id} report={report} />
              ))
            : null}
          {reportState.status === "failed"
            ? reportState.reports.map((report) => (
                <AiReportPanel key={report.id} report={report} />
              ))
            : null}
        </div>
      </section>

      <section className="mt-8 border border-[var(--line)] bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 border border-[var(--line)] bg-[#f5f7f2] px-3 py-2 text-sm font-medium text-[var(--forest)]">
              <RadioTower size={17} />
              Midnight Preprod Registry
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-[var(--ink)]">
              {language === "zh" ? "链上存证状态" : "On-chain Record Status"}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              {language === "zh"
                ? "合约已经部署到 Midnight Preprod。下一步可把这份报告对应的 proof 结果登记到合约里，形成公开可查的验证记录。"
                : "The contract is already deployed on Midnight Preprod. The next step can register this report's proof result into the contract as a public verification record."}
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 bg-[var(--forest)] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#9ba99c]"
            disabled={!canSubmitToChain || submissionState.status === "submitting"}
            onClick={handleSubmitProof}
            type="button"
          >
            {submissionState.status === "submitting" ? (
              <Loader2 className="animate-spin" size={17} />
            ) : (
              <WalletCards size={17} />
            )}
            {submissionState.status === "submitting"
              ? "提交中"
              : "提交 proof 结果"}
          </button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="border border-[var(--line)] bg-[#fbfcf8] p-4">
            <p className="text-sm font-semibold text-[var(--ink)]">Contract</p>
            <div className="mt-3 inline-flex items-center gap-2 bg-[#e6efe2] px-3 py-2 text-xs font-semibold text-[var(--forest)]">
              <CheckCircle2 size={14} />
              {language === "zh" ? "已部署到 Midnight Preprod" : "Deployed on Midnight Preprod"}
            </div>
            <p className="mono mt-3 break-all text-xs text-[var(--muted)]">
              {creatorVaultPreprodDeployment.contractAddress}
            </p>
          </div>
          <div className="border border-[var(--line)] bg-[#fbfcf8] p-4">
            <p className="text-sm font-semibold text-[var(--ink)]">Wallet</p>
            <p className="mt-3 text-sm text-[var(--muted)]">
              {connection?.status.status === "connected"
                ? connection.configuration.networkId
                : "未连接"}
            </p>
            {connection?.balances.dustBalance ? (
              <p className="mt-2 text-xs text-[var(--muted)]">
                DUST {connection.balances.dustBalance} raw
              </p>
            ) : null}
          </div>
          <div className="border border-[var(--line)] bg-[#fbfcf8] p-4">
            <p className="text-sm font-semibold text-[var(--ink)]">Circuit</p>
            <p className="mt-3 text-sm text-[var(--muted)]">
              submitIncomeProof / schema v{submissionSummary.proofSchemaVersion}
            </p>
            <p className="mt-2 text-xs text-[var(--muted)]">
              threshold cents {submissionSummary.incomeThresholdUsdCents}
            </p>
          </div>
        </div>

        <details className="mt-5 border border-[var(--line)] bg-[#fbfcf8] p-4">
          <summary className="cursor-pointer text-sm font-semibold text-[var(--ink)]">
            {language === "zh" ? "智能合约函数 API 文档" : "Smart contract function API"}
          </summary>
          <div className="mt-3 text-sm leading-6 text-[var(--muted)]">
            <p>
              {language === "zh"
                ? "合约源码：contracts/src/creator_vault.compact；前端调用封装：lib/midnight/creator-vault-contract.ts。"
                : "Contract source: contracts/src/creator_vault.compact; frontend wrapper: lib/midnight/creator-vault-contract.ts."}
            </p>
            <pre className="mono mt-3 overflow-auto whitespace-pre-wrap break-all bg-white p-4 text-xs text-[var(--muted)]">
{`submitIncomeProof(
  creatorIdHash: Bytes<32>,
  periodHash: Bytes<32>,
  proofSchemaVersion: Uint<16>,
  incomeThresholdUsdCents: Uint<64>,
  supporterThreshold: Uint<32>,
  proofCommitment: Bytes<32>
): Bytes<32>`}
            </pre>
          </div>
          <pre className="mono mt-3 overflow-auto whitespace-pre-wrap break-all bg-white p-4 text-xs text-[var(--muted)]">
            {JSON.stringify(submissionSummary, null, 2)}
          </pre>
        </details>

        {!canSubmitToChain ? (
          <div className="mt-5 border border-[#d8c9a6] bg-[#fff8e3] p-4 text-sm leading-6 text-[#6d5526]">
            {language === "zh"
              ? "合约已经部署上链。这里连接 Lace 只是为了下一步把本页 demo proof 结果提交到这个已部署合约。请确认网络为 preprod，并确保钱包里有 tDUST。"
              : "The contract is already deployed. Connect Lace here only for the next step: submitting this page's demo proof result to the deployed contract. Use preprod and keep tDUST available."}
            <button
              className="ml-3 border border-[#9b7b32] px-3 py-1 font-semibold text-[#6d5526]"
              disabled={isAutoConnecting}
              onClick={() => void connectWallet("auto")}
              type="button"
            >
              {isAutoConnecting
                ? language === "zh"
                  ? "连接中"
                  : "Connecting"
                : language === "zh"
                  ? "连接 Lace 提交 proof"
                  : "Connect Lace to submit proof"}
            </button>
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 border border-[#e2b8b8] bg-[#fff1f1] p-4 text-sm leading-6 text-[#8a2b2b]">
            钱包连接错误：{error}
          </div>
        ) : null}

        {submissionProgress.length ? (
          <div className="mt-5 border border-[var(--line)] bg-[#fbfcf8] p-4 text-sm leading-6 text-[var(--ink)]">
            <div className="font-semibold">提交诊断</div>
            <ol className="mt-3 space-y-3">
              {submissionProgress.map((item, index) => (
                <li key={`${item.step}-${index}`}>
                  <p className="font-medium">
                    {index + 1}. {item.step}
                  </p>
                  {item.detail ? (
                    <pre className="mt-1 overflow-auto whitespace-pre-wrap break-all bg-white p-3 text-xs text-[var(--muted)]">
                      {item.detail}
                    </pre>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {submissionState.status === "failed" ? (
          <div className="mt-5 border border-[#e2b8b8] bg-[#fff1f1] p-4 text-sm leading-6 text-[#8a2b2b]">
            提交失败：{submissionState.message}
          </div>
        ) : null}

        {submissionState.status === "submitted" ? (
          <div className="mt-5 border border-[#b8d6bd] bg-[#f0f8f1] p-4 text-sm leading-6 text-[var(--forest)]">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 size={17} />
              proof 结果已登记
            </div>
            <p className="mt-3 break-all">交易 ID：{submissionState.result.txId}</p>
            <p className="break-all">交易 Hash：{submissionState.result.txHash}</p>
            <p>区块高度：{submissionState.result.blockHeight}</p>
            <p className="break-all">Proof Key：{submissionState.result.proofKey}</p>
            <Link
              className="mt-4 inline-flex bg-[var(--forest)] px-4 py-3 font-semibold text-white"
              href="/certificate"
            >
              {language === "zh" ? "查看证书" : "View certificate"}
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  )
}
