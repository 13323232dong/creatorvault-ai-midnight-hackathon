"use client"

import Link from "next/link"
import { CircleDot, PlugZap, ShieldCheck } from "lucide-react"
import { useLanguage } from "@/components/LanguageProvider"
import { useMidnightWallet } from "@/components/MidnightWalletProvider"

function shortText(value: string | undefined, emptyLabel: string): string {
  if (!value) {
    return emptyLabel
  }

  if (value.length <= 18) {
    return value
  }

  return `${value.slice(0, 10)}...${value.slice(-6)}`
}

export function MidnightConnectionStatus() {
  const { t } = useLanguage()
  const { connection, networkId, selectedWallet, wallets } = useMidnightWallet()
  const connectedStatus =
    connection?.status.status === "connected" ? connection.status : null
  const isConnected = Boolean(connectedStatus)
  const activeNetwork = connectedStatus?.networkId ?? networkId

  return (
    <section className="border border-[var(--line)] bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 items-center justify-center border ${
              isConnected
                ? "border-[#d6e3ea] bg-[#f4fafc] text-[var(--blue)]"
                : "border-[#eadbd5] bg-[#fff8f5] text-[var(--clay)]"
            }`}
          >
            {isConnected ? <ShieldCheck size={18} /> : <PlugZap size={18} />}
          </span>
          <div>
            <p className="text-sm font-semibold">
              {isConnected ? t("walletConnected") : t("walletNotConnected")}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {isConnected
                ? t("walletConnectedBody")
                : wallets.length > 0
                  ? t("walletDetectedBody")
                  : t("walletMissingBody")}
            </p>
          </div>
        </div>

        <Link
          className="inline-flex items-center gap-2 border border-[var(--forest)] px-3 py-2 text-sm font-semibold text-[var(--forest)]"
          href="/architecture"
        >
          <CircleDot size={15} />
          {t("manageWallet")}
        </Link>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div className="border border-[var(--line)] bg-[#f8faf5] p-3">
          <dt className="text-xs text-[var(--muted)]">{t("wallet")}</dt>
          <dd className="mt-1 font-semibold">
            {selectedWallet
              ? `${selectedWallet.name} (${selectedWallet.apiVersion})`
              : t("notDetected")}
          </dd>
        </div>
        <div className="border border-[var(--line)] bg-[#f8faf5] p-3">
          <dt className="text-xs text-[var(--muted)]">{t("network")}</dt>
          <dd className="mono mt-1 text-xs font-semibold">{activeNetwork}</dd>
        </div>
        <div className="border border-[var(--line)] bg-[#f8faf5] p-3">
          <dt className="text-xs text-[var(--muted)]">{t("address")}</dt>
          <dd className="mono mt-1 text-xs font-semibold">
            {shortText(connection?.addresses.unshieldedAddress, t("notConnected"))}
          </dd>
        </div>
      </dl>
    </section>
  )
}
