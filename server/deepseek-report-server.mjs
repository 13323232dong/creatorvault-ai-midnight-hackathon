import http from "node:http"
import https from "node:https"

const port = Number(process.env.PORT || 4301)
const deepSeekApiUrl = "https://api.deepseek.com/chat/completions"
const deepSeekModel = process.env.DEEPSEEK_MODEL || "deepseek-v4-pro"
const allowedAudiences = new Set(["brand", "dao", "community"])

function json(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  })
  response.end(JSON.stringify(payload))
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = ""

    request.on("data", (chunk) => {
      body += chunk
      if (body.length > 64_000) {
        reject(new Error("Request body too large."))
        request.destroy()
      }
    })
    request.on("end", () => resolve(body))
    request.on("error", reject)
  })
}

function postJson(url, payload, headers = {}, timeoutMs = 28_000) {
  return new Promise((resolve, reject) => {
    const target = new URL(url)
    const body = JSON.stringify(payload)
    const request = https.request(
      {
        hostname: target.hostname,
        path: `${target.pathname}${target.search}`,
        method: "POST",
        timeout: timeoutMs,
        headers: {
          "content-type": "application/json",
          "content-length": Buffer.byteLength(body),
          ...headers,
        },
      },
      (response) => {
        let responseBody = ""

        response.on("data", (chunk) => {
          responseBody += chunk
        })
        response.on("end", () => {
          resolve({
            ok: response.statusCode >= 200 && response.statusCode < 300,
            status: response.statusCode,
            body: responseBody,
          })
        })
      },
    )

    request.on("timeout", () => {
      request.destroy(new Error("DeepSeek upstream request timed out."))
    })
    request.on("error", reject)
    request.write(body)
    request.end()
  })
}

function localReport(proof, audience, language) {
  const zh = language === "zh"
  const titles = {
    brand: zh ? "已验证创作者收入报告" : "Verified Creator Income Report",
    dao: zh ? "DAO Grant 资格摘要" : "DAO Grant Eligibility Summary",
    community: zh ? "隐私安全社区更新" : "Privacy-Safe Community Update",
  }

  return {
    id: `report-${audience}`,
    audience,
    title: titles[audience],
    summary: zh
      ? `Alice 在 ${proof.period} 已通过所选收入和支持者门槛。该报告只使用公开 proof 输出，不暴露赞助者身份、精确付款金额或完整私密收入账本。`
      : `Alice passed the selected income and supporter thresholds for ${proof.period}. This report uses only disclosed proof outputs without exposing sponsor identities, exact payments, or the full private revenue ledger.`,
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
    generatedAt: proof.generatedAt,
    source: "local-fallback",
    model: "local-deterministic",
  }
}

function fallback(payload) {
  return {
    reports: payload.audiences.map((audience) =>
      localReport(payload.proof, audience, payload.language),
    ),
    source: "local-fallback",
    model: "local-deterministic",
  }
}

function validate(payload) {
  const audiences = Array.isArray(payload.audiences)
    ? payload.audiences.filter((audience) => allowedAudiences.has(audience))
    : []

  if (!payload.proof || audiences.length === 0) {
    throw new Error("Invalid report request.")
  }

  return {
    proof: payload.proof,
    audiences,
    language: payload.language === "zh" ? "zh" : "en",
  }
}

function buildPrompt(payload) {
  return [
    "Generate privacy-safe creator income proof reports.",
    "Return JSON only, with shape: {\"reports\":[{\"id\":\"report-brand\",\"audience\":\"brand\",\"title\":\"...\",\"summary\":\"...\",\"bullets\":[\"...\"],\"generatedAt\":\"...\"}]}",
    `Language: ${payload.language === "zh" ? "Simplified Chinese" : "English"}.`,
    `Audiences: ${payload.audiences.join(", ")}.`,
    "You may use only these disclosed proof fields:",
    JSON.stringify(payload.proof),
    "Privacy rule: do not invent or reveal sponsor identities, individual payments, sponsor addresses, or full private revenue ledger details.",
    "Each report needs one concise summary and exactly three bullets.",
  ].join("\n")
}

function parseReports(content) {
  const trimmed = content.trim()
  const jsonText = trimmed.startsWith("```")
    ? trimmed.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim()
    : trimmed
  const parsed = JSON.parse(jsonText)
  return Array.isArray(parsed) ? parsed : parsed.reports || []
}

const server = http.createServer(async (request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    json(response, 200, { ok: true, model: deepSeekModel })
    return
  }

  if (request.method !== "POST" || request.url !== "/api/reports/deepseek") {
    json(response, 404, { error: "Not found" })
    return
  }

  let payload

  try {
    payload = validate(JSON.parse(await readBody(request)))
  } catch (error) {
    json(response, 400, {
      error: error instanceof Error ? error.message : "Invalid request.",
    })
    return
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    json(response, 200, fallback(payload))
    return
  }

  try {
    const upstream = await postJson(
      deepSeekApiUrl,
      {
        model: deepSeekModel,
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
      },
      {
        authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
    )

    if (!upstream.ok) {
      console.error("DeepSeek upstream failed", upstream.status, upstream.body)
      json(response, 200, fallback(payload))
      return
    }

    const upstreamPayload = JSON.parse(upstream.body)
    const content = upstreamPayload.choices?.[0]?.message?.content
    const reports = content
      ? parseReports(content).map((report) => ({
          ...report,
          source: "deepseek-v4",
          model: deepSeekModel,
        }))
      : []

    json(response, 200, {
      reports: reports.length ? reports : fallback(payload).reports,
      source: reports.length ? "deepseek-v4" : "local-fallback",
      model: reports.length ? deepSeekModel : "local-deterministic",
    })
  } catch (error) {
    console.error("DeepSeek report generation failed", error)
    json(response, 200, fallback(payload))
  }
})

server.listen(port, "127.0.0.1", () => {
  console.log(`CreatorVault DeepSeek report server listening on 127.0.0.1:${port}`)
})
