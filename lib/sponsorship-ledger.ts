import type { SponsorshipRecord } from "@/types/sponsorship"

export const sponsorshipLedgerStorageKey = "creatorvault.sponsorship.records"

export function createSponsorshipRecord(params: {
  sponsorLabel: string
  sponsorAddress?: string
  amountUsd: number
  isPrivate: boolean
}): SponsorshipRecord {
  return {
    id: `sp-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    sponsorLabel: params.sponsorLabel.trim() || "Direct sponsor",
    sponsorAddress: params.sponsorAddress?.trim() || undefined,
    amountUsd: params.amountUsd,
    isPrivate: params.isPrivate,
    createdAt: new Date().toISOString().slice(0, 10),
  }
}

export function readSponsorshipRecords(): SponsorshipRecord[] {
  if (typeof window === "undefined") {
    return []
  }

  const stored = window.localStorage.getItem(sponsorshipLedgerStorageKey)

  if (!stored) {
    return []
  }

  try {
    const parsed = JSON.parse(stored) as SponsorshipRecord[]
    return parsed.filter((record) => record.amountUsd > 0)
  } catch {
    window.localStorage.removeItem(sponsorshipLedgerStorageKey)
    return []
  }
}

export function writeSponsorshipRecords(records: SponsorshipRecord[]) {
  window.localStorage.setItem(sponsorshipLedgerStorageKey, JSON.stringify(records))
}
