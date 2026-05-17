import type { CreatorVaultProofSubmissionResult } from "@/lib/midnight/creator-vault-contract"
import type { ProofClaim } from "@/types/proof"

export const certificateStorageKey = "creatorvault.latest.certificate"

export type VerificationCertificate = {
  creatorName: string
  period: string
  result: ProofClaim["result"]
  thresholdUsd: number
  supporterThreshold: number
  supporterCount: number
  proofCommitment: string
  contractAddress: string
  txId: string
  txHash: string
  blockHeight: number
  proofKey: string
  issuedAt: string
}

export function createVerificationCertificate(params: {
  creatorName: string
  proof: ProofClaim
  submission: CreatorVaultProofSubmissionResult
}): VerificationCertificate {
  return {
    creatorName: params.creatorName,
    period: params.proof.period,
    result: params.proof.result,
    thresholdUsd: params.proof.thresholdUsd,
    supporterThreshold: params.proof.supporterThreshold,
    supporterCount: params.proof.supporterCount,
    proofCommitment: params.proof.proofHash,
    contractAddress: params.submission.contractAddress,
    txId: params.submission.txId,
    txHash: params.submission.txHash,
    blockHeight: params.submission.blockHeight,
    proofKey: params.submission.proofKey,
    issuedAt: new Date().toISOString(),
  }
}

export function readVerificationCertificate(): VerificationCertificate | undefined {
  if (typeof window === "undefined") {
    return undefined
  }

  const stored = window.localStorage.getItem(certificateStorageKey)

  if (!stored) {
    return undefined
  }

  try {
    return JSON.parse(stored) as VerificationCertificate
  } catch {
    window.localStorage.removeItem(certificateStorageKey)
    return undefined
  }
}

export function writeVerificationCertificate(certificate: VerificationCertificate) {
  window.localStorage.setItem(certificateStorageKey, JSON.stringify(certificate))
}
