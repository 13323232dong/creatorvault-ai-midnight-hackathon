import type { Language } from "@/lib/language"
import type { ProofClaim } from "@/types/proof"
import type { AIReport, ReportAudience } from "@/types/report"

export type DeepSeekReportRequest = {
  proof: Pick<
    ProofClaim,
    | "id"
    | "thresholdUsd"
    | "supporterThreshold"
    | "period"
    | "result"
    | "disclosedFields"
    | "hiddenFields"
    | "proofHash"
    | "generatedAt"
  >
  audiences: ReportAudience[]
  language: Language
}

export type DeepSeekReportResponse = {
  reports: AIReport[]
  source: "deepseek-v4" | "local-fallback"
  model: string
}

export function createPrivacySafeReportRequest(
  proof: ProofClaim,
  audiences: ReportAudience[],
  language: Language,
): DeepSeekReportRequest {
  return {
    proof: {
      id: proof.id,
      thresholdUsd: proof.thresholdUsd,
      supporterThreshold: proof.supporterThreshold,
      period: proof.period,
      result: proof.result,
      disclosedFields: proof.disclosedFields,
      hiddenFields: proof.hiddenFields,
      proofHash: proof.proofHash,
      generatedAt: proof.generatedAt,
    },
    audiences,
    language,
  }
}

export async function generateDeepSeekReports(
  request: DeepSeekReportRequest,
): Promise<DeepSeekReportResponse> {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
  const response = await fetch(`${basePath}/api/reports/deepseek`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`DeepSeek report API failed with HTTP ${response.status}`)
  }

  const payload = (await response.json()) as DeepSeekReportResponse

  if (!Array.isArray(payload.reports) || payload.reports.length === 0) {
    throw new Error("DeepSeek report API returned no reports.")
  }

  return payload
}
