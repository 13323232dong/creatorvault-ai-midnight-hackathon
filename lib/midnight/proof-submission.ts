import type { Creator } from "@/types/creator"
import type { ProofClaim } from "@/types/proof"

export type IncomeProofSubmission = {
  creatorIdHash: Uint8Array
  periodHash: Uint8Array
  proofSchemaVersion: bigint
  incomeThresholdUsdCents: bigint
  supporterThreshold: bigint
  proofCommitment: Uint8Array
}

export type IncomeProofSubmissionSummary = {
  creatorIdHashHex: string
  periodHashHex: string
  proofSchemaVersion: string
  incomeThresholdUsdCents: string
  supporterThreshold: string
  proofCommitmentHex: string
}

function stableBytes32(input: string): Uint8Array {
  const encoded = new TextEncoder().encode(input)
  const output = new Uint8Array(32)
  let state = 0x811c9dc5

  for (let round = 0; round < 4; round += 1) {
    state ^= 0x9e3779b9 + round

    for (const byte of encoded) {
      state ^= byte + round
      state = Math.imul(state, 0x01000193) >>> 0
      state ^= state >>> 13
    }

    for (let index = 0; index < 8; index += 1) {
      state = Math.imul(state ^ (state >>> 16), 0x85ebca6b) >>> 0
      output[round * 8 + index] = state & 0xff
    }
  }

  return output
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

export function createIncomeProofSubmission(
  proof: ProofClaim,
  creator: Creator,
): IncomeProofSubmission {
  return {
    creatorIdHash: stableBytes32(`creatorvault:creator:${creator.id}:${creator.handle}`),
    periodHash: stableBytes32(`creatorvault:period:${proof.period}`),
    proofSchemaVersion: BigInt(1),
    incomeThresholdUsdCents: BigInt(Math.round(proof.thresholdUsd * 100)),
    supporterThreshold: BigInt(proof.supporterThreshold),
    proofCommitment: stableBytes32(
      [
        "creatorvault:proof-commitment",
        proof.id,
        proof.period,
        proof.result,
        proof.thresholdUsd,
        proof.supporterThreshold,
        proof.proofHash,
      ].join(":"),
    ),
  }
}

export function summarizeIncomeProofSubmission(
  submission: IncomeProofSubmission,
): IncomeProofSubmissionSummary {
  return {
    creatorIdHashHex: bytesToHex(submission.creatorIdHash),
    periodHashHex: bytesToHex(submission.periodHash),
    proofSchemaVersion: submission.proofSchemaVersion.toString(),
    incomeThresholdUsdCents: submission.incomeThresholdUsdCents.toString(),
    supporterThreshold: submission.supporterThreshold.toString(),
    proofCommitmentHex: bytesToHex(submission.proofCommitment),
  }
}
