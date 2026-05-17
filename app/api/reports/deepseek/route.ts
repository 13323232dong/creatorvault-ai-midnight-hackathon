import { NextResponse } from "next/server"
import type { DeepSeekReportRequest, DeepSeekReportResponse } from "@/lib/deepseek-report-client"
import type { AIReport, ReportAudience } from "@/types/report"

export const runtime = "nodejs"

const deepSeekApiUrl = "https://api.deepseek.com/chat/completions"
const defaultDeepSeekModel = "deepseek-v4-pro"
const allowedAudiences = new Set<ReportAudience>(["brand", "dao", "community"])

function parseReportPayload(content: string): AIReport[] {
  const trimmed = content.trim()
  const jsonText = trimmed.startsWith("```")
    ? trimmed.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim()
    : trimmed
  const parsed = JSON.parse(jsonText) as { reports?: AIReport[] } | AIReport[]
  return Array.isArray(parsed) ? parsed : parsed.reports ?? []
}

function buildPrompt(request: DeepSeekReportRequest) {
  return [
    "Generate privacy-safe creator income proof reports.",
    "Return JSON only, with shape: {\"reports\":[{\"id\":\"report-brand\",\"audience\":\"brand\",\"title\":\"...\",\"summary\":\"...\",\"bullets\":[\"...\"],\"generatedAt\":\"...\"}]}",
    `Language: ${request.language === "zh" ? "Simplified Chinese" : "English"}.`,
    `Audiences: ${request.audiences.join(", ")}.`,
    "You may use only these disclosed proof fields:",
    JSON.stringify(request.proof),
    "Privacy rule: do not invent or reveal sponsor identities, individual payments, sponsor addresses, or full private revenue ledger details.",
    "Each report needs one concise summary and exactly three bullets.",
  ].join("\n")
}

function localFallback(request: DeepSeekReportRequest): DeepSeekReportResponse {
  const copy: Record<ReportAudience, { en: string; zh: string }> = {
    brand: {
      en: "Verified Creator Income Report",
      zh: "已验证创作者收入报告",
    },
    dao: {
      en: "DAO Grant Eligibility Summary",
      zh: "DAO Grant 资格摘要",
    },
    community: {
      en: "Privacy-Safe Community Update",
      zh: "隐私安全社区更新",
    },
  }
  const zh = request.language === "zh"

  return {
    reports: request.audiences.map((audience) => ({
      id: `report-${audience}`,
      audience,
      title: copy[audience][request.language],
      summary: zh
        ? `Alice 在 ${request.proof.period} 已通过所选收入和支持者门槛。该报告只使用公开 proof 输出，不暴露赞助者身份、精确付款金额或完整私密收入账本。`
        : `Alice passed the selected income and supporter thresholds for ${request.proof.period}. This report uses only disclosed proof outputs without exposing sponsor identities, exact payments, or the full private revenue ledger.`,
      bullets: zh
        ? [
            "收入门槛已验证，同时不披露单笔精确付款。",
            "支持者门槛已验证，同时不暴露私密赞助者身份。",
            "公开结果适合审核使用，并保护创作者与赞助者隐私。",
          ]
        : [
            "Income threshold verified without disclosing exact individual payments.",
            "Supporter threshold verified without revealing private sponsor identities.",
            "The disclosed result is suitable for review while preserving creator and sponsor privacy.",
          ],
      generatedAt: request.proof.generatedAt,
      source: "local-fallback",
      model: "local-deterministic",
    })),
    source: "local-fallback",
    model: "local-deterministic",
  }
}

function validateRequest(payload: DeepSeekReportRequest): DeepSeekReportRequest {
  const audiences = payload.audiences.filter((audience) =>
    allowedAudiences.has(audience),
  )

  if (!payload.proof || audiences.length === 0) {
    throw new Error("Invalid report request.")
  }

  return {
    proof: payload.proof,
    audiences,
    language: payload.language === "zh" ? "zh" : "en",
  }
}

export async function POST(request: Request) {
  const payload = validateRequest((await request.json()) as DeepSeekReportRequest)
  const apiKey = process.env.DEEPSEEK_API_KEY
  const model = process.env.DEEPSEEK_MODEL || defaultDeepSeekModel

  if (!apiKey) {
    return NextResponse.json(localFallback(payload))
  }

  try {
    const response = await fetch(deepSeekApiUrl, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a privacy compliance report writer. Output strict JSON only.",
          },
          {
            role: "user",
            content: buildPrompt(payload),
          },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(28_000),
    })

    if (!response.ok) {
      return NextResponse.json(localFallback(payload))
    }

    const deepSeekPayload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const content = deepSeekPayload.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json(localFallback(payload))
    }

    const reports = parseReportPayload(content).map((report) => ({
      ...report,
      source: "deepseek-v4" as const,
      model,
    }))

    return NextResponse.json({
      reports,
      source: "deepseek-v4",
      model,
    } satisfies DeepSeekReportResponse)
  } catch {
    return NextResponse.json(localFallback(payload))
  }
}
