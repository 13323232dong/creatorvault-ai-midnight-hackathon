"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, FileText, Loader2, LockKeyhole, RadioTower, Sparkles, WalletCards } from "lucide-react"
import { AiReportPanel } from "@/components/AiReportPanel"
import { useLanguage } from "@/components/LanguageProvider"
import { useMidnightWallet } from "@/components/MidnightWalletProvider"
import { ProofCard } from "@/components/ProofCard"
import { demoCreator, demoSponsorshipRecords } from "@/lib/demo-data"
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
import type { AIReport, ReportAudience } from "@/types/report"

type ReportGenerationState =
  | { status: "idle" }
  | { status: "generating" }
  | { status: "generated"; reports: AIReport[] }

type ChainSubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "submitted"; result: CreatorVaultProofSubmissionResult }
  | { status: "failed"; message: string }

const audiences: ReportAudience[] = ["brand", "dao", "community"]

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
  const [reportState, setReportState] = useState<ReportGenerationState>({
    status: "idle",
  })
  const [submissionState, setSubmissionState] = useState<ChainSubmissionState>({
    status: "idle",
  })
  const [submissionProgress, setSubmissionProgress] = useState<
    CreatorVaultDeploymentProgress[]
  >([])

  // 先根据 demo 收入记录生成证明。
  const proof = generateIncomeProof({
    records: demoSponsorshipRecords,
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

    await new Promise((resolve) => window.setTimeout(resolve, 650))

    setReportState({
      status: "generated",
      reports: audiences.map((audience) => generateReport(proof, audience, language)),
    })
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
          {t("reportBadge")}
        </p>
        <h1 className="mt-3 text-4xl font-semibold">
          {t("reportTitle")}
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">
          {t("reportBody")}
        </p>
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[480px_1fr]">
        <ProofCard proof={proof} />
        <div className="space-y-6">
          <section className="border border-[var(--line)] bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="text-[var(--gold)]" size={20} />
                  <p className="text-xs font-semibold uppercase text-[var(--moss)]">
                    AI Report Generator
                  </p>
                </div>
                <h2 className="mt-3 text-xl font-semibold">
                  {language === "zh" ? "从公开 proof 输出生成报告" : "Generate from disclosed proof outputs"}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  {language === "zh"
                    ? "AI 只读取通过状态、门槛、周期和 proof commitment；赞助者身份、单笔金额和完整私密账本不会进入报告输入。"
                    : "The AI only reads pass status, thresholds, period, and proof commitment. Sponsor identities, individual payments, and the private ledger stay out of the prompt."}
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
                    ? "生成 AI 报告"
                    : "Generate AI reports"}
              </button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="border border-[var(--line)] bg-[#f8faf5] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
                  <CheckCircle2 size={16} />
                  {language === "zh" ? "允许输入 AI" : "Allowed AI inputs"}
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
                  {language === "zh" ? "禁止输入 AI" : "Blocked AI inputs"}
                </div>
                <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                  {proof.hiddenFields.map((field) => (
                    <li key={field}>{field}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {reportState.status === "idle" ? (
            <section className="border border-dashed border-[var(--line)] bg-[#fbfcf8] p-5 text-sm leading-6 text-[var(--muted)]">
              {language === "zh"
                ? "点击上方按钮后，会生成品牌、DAO 和社区三种报告口径。"
                : "Click the button above to generate brand, DAO, and community report variants."}
            </section>
          ) : null}

          {reportState.status === "generated"
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
              {language === "zh" ? "把 demo proof 结果登记到已部署合约" : "Submit the demo proof result to the deployed contract"}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              {language === "zh"
                ? "这一步不会上传原始赞助流水，只把公开 proof 输出转换成 Compact 电路参数，并调用 submitIncomeProof。"
                : "This step does not upload raw sponsorship records. It converts disclosed proof outputs into Compact circuit arguments and calls submitIncomeProof."}
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
            {language === "zh" ? "查看本次链上参数" : "View chain arguments"}
          </summary>
          <pre className="mono mt-3 overflow-auto whitespace-pre-wrap break-all bg-white p-4 text-xs text-[var(--muted)]">
            {JSON.stringify(submissionSummary, null, 2)}
          </pre>
        </details>

        {!canSubmitToChain ? (
          <div className="mt-5 border border-[#d8c9a6] bg-[#fff8e3] p-4 text-sm leading-6 text-[#6d5526]">
            请连接 Lace，确认网络为 preprod，并确保钱包里有 tDUST 后再提交。
            <button
              className="ml-3 border border-[#9b7b32] px-3 py-1 font-semibold text-[#6d5526]"
              disabled={isAutoConnecting}
              onClick={() => void connectWallet("auto")}
              type="button"
            >
              {isAutoConnecting ? "连接中" : "自动连接"}
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
          </div>
        ) : null}
      </section>
    </div>
  )
}
