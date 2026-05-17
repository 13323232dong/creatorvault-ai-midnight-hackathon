"use client"

import { PlugZap, RefreshCw, ShieldCheck, WalletCards } from "lucide-react"
import {
  midnightNetworkOptions,
} from "@/lib/midnight/wallet"
import { useLanguage } from "@/components/LanguageProvider"
import { useMidnightWallet } from "@/components/MidnightWalletProvider"

function displayValue(value: string | undefined, emptyLabel: string): string {
  return value && value.length > 0 ? value : emptyLabel
}

function shortText(value: string | undefined, emptyLabel: string): string {
  if (!value) {
    return emptyLabel
  }

  if (value.length <= 18) {
    return value
  }

  return `${value.slice(0, 10)}...${value.slice(-6)}`
}

export function MidnightWalletPanel() {
  const { t } = useLanguage()
  const {
    wallets,
    selectedWallet,
    selectedWalletId,
    setSelectedWalletId,
    networkId,
    setNetworkId,
    connection,
    injection,
    error,
    isConnecting,
    isAutoConnecting,
    refreshWallets,
    connectWallet,
  } = useMidnightWallet()

  return (
    <section className="border border-[var(--line)] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <PlugZap className="text-[var(--forest)]" size={20} />
            <p className="text-xs font-semibold uppercase text-[var(--moss)]">
              {t("midnightBridge")}
            </p>
          </div>
          <h2 className="mt-3 text-xl font-semibold">{t("connectWalletLayer")}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            {t("bridgeBody")}
          </p>
        </div>

        <button
          className="inline-flex items-center gap-2 border border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--forest)]"
          onClick={refreshWallets}
          type="button"
        >
          <RefreshCw size={16} />
          {t("refresh")}
        </button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
        <label className="block">
          <span className="text-xs font-semibold text-[var(--muted)]">
            {t("wallet")}
          </span>
          <select
            className="mt-2 w-full border border-[var(--line)] bg-[#f8faf5] px-3 py-3 text-sm"
            onChange={(event) => setSelectedWalletId(event.target.value)}
            value={selectedWalletId}
          >
            {wallets.length > 0 ? (
              wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name} ({wallet.apiVersion})
                </option>
              ))
            ) : (
              <option value="">{t("noWalletDetected")}</option>
            )}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-[var(--muted)]">
            {t("midnightNetwork")}
          </span>
          <select
            className="mt-2 w-full border border-[var(--line)] bg-[#f8faf5] px-3 py-3 text-sm"
            onChange={(event) => setNetworkId(event.target.value)}
            value={networkId}
          >
            {midnightNetworkOptions.map((network) => (
              <option key={network.id} value={network.id}>
                {network.label}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 bg-[var(--forest)] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isConnecting || isAutoConnecting || !selectedWalletId}
            onClick={() => connectWallet("selected")}
            type="button"
          >
            <WalletCards size={17} />
            {isConnecting ? t("connecting") : t("connectSelectedNetwork")}
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 border border-[var(--forest)] px-5 py-3 text-sm font-semibold text-[var(--forest)] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isConnecting || isAutoConnecting || !selectedWalletId}
            onClick={() => connectWallet("auto")}
            type="button"
          >
            <RefreshCw size={16} />
            {isAutoConnecting ? t("matching") : t("autoMatchNetwork")}
          </button>
        </div>
      </div>

      {selectedWallet ? (
        <div className="mt-4 border border-[var(--line)] bg-[#f8faf5] p-3 text-sm">
          <p className="font-semibold">{selectedWallet.name}</p>
          <p className="mono mt-1 text-xs text-[var(--muted)]">
            {selectedWallet.rdns} / {selectedWallet.id}
          </p>
        </div>
      ) : (
        <div className="mt-4 border border-[#eadbd5] bg-[#fff8f5] p-3 text-sm text-[var(--clay)]">
          {t("noInjectedWallet")}
        </div>
      )}

      <div className="mt-4 border border-[#d6e3ea] bg-[#f4fafc] p-3 text-sm text-[var(--blue)]">
        {t("networkMismatchHint")}
      </div>

      <div className="mt-4 border border-[var(--line)] bg-[#f8faf5] p-3 text-sm">
        <p className="font-semibold">{t("injectedDiagnostics")}</p>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          <div>
            <p className="text-xs text-[var(--muted)]">window.midnight</p>
            <p className="mono mt-1 break-all text-xs">
              {injection?.midnightWalletIds.length
                ? injection.midnightWalletIds.join(", ")
                : t("notDetected")}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted)]">window.cardano</p>
            <p className="mono mt-1 break-all text-xs">
              {injection?.cardanoWalletIds.length
                ? injection.cardanoWalletIds.join(", ")
                : t("notDetected")}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted)]">window.ethereum</p>
            <p className="mono mt-1 text-xs">
              {injection?.hasEthereum ? t("detected") : t("notDetected")}
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-4 border border-[#eadbd5] bg-[#fff8f5] p-3 text-sm text-[var(--clay)]">
          {error}
        </div>
      ) : null}

      {connection ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="border border-[#d6e3ea] bg-[#f4fafc] p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-[var(--blue)]" size={18} />
              <h3 className="text-sm font-semibold">{t("connectionSnapshot")}</h3>
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-xs text-[var(--muted)]">{t("status")}</dt>
                <dd className="font-semibold">{connection.status.status}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)]">
                  {t("requestedNetwork")}
                </dt>
                <dd className="font-semibold">{connection.requestedNetworkId}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)]">{t("network")}</dt>
                <dd className="font-semibold">
                  {connection.status.status === "connected"
                    ? connection.status.networkId
                    : t("disconnected")}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)]">
                  {t("unshieldedAddress")}
                </dt>
                <dd className="mono break-all text-xs">
                  {shortText(connection.addresses.unshieldedAddress, t("notDetected"))}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)]">
                  {t("shieldedAddress")}
                </dt>
                <dd className="mono break-all text-xs">
                  {shortText(connection.addresses.shieldedAddress, t("notDetected"))}
                </dd>
              </div>
            </dl>
          </div>

          <div className="border border-[var(--line)] bg-[#f8faf5] p-4">
            <h3 className="text-sm font-semibold">{t("walletConfiguration")}</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-xs text-[var(--muted)]">{t("indexer")}</dt>
                <dd className="mono break-all text-xs">
                  {displayValue(connection.configuration.indexerUri, t("notDetected"))}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)]">{t("substrateNode")}</dt>
                <dd className="mono break-all text-xs">
                  {displayValue(
                    connection.configuration.substrateNodeUri,
                    t("notDetected"),
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)]">{t("dustBalance")}</dt>
                <dd className="mono text-xs">
                  {displayValue(connection.balances.dustBalance, t("notDetected"))}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      ) : null}
    </section>
  )
}
