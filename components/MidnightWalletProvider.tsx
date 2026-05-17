"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  connectAnyMidnightWalletAuto,
  connectMidnightWallet,
  connectMidnightWalletAuto,
  discoverMidnightWallets,
  inspectWalletInjection,
  type MidnightConnectionSnapshot,
  type MidnightWalletSummary,
  type WalletInjectionSnapshot,
} from "@/lib/midnight/wallet"

const defaultNetworkId =
  process.env.NEXT_PUBLIC_MIDNIGHT_NETWORK_ID ??
  "preprod"

type ConnectMode = "selected" | "auto"

type MidnightWalletContextValue = {
  wallets: MidnightWalletSummary[]
  selectedWallet: MidnightWalletSummary | undefined
  selectedWalletId: string
  setSelectedWalletId: (walletId: string) => void
  networkId: string
  setNetworkId: (networkId: string) => void
  connection: MidnightConnectionSnapshot | null
  injection: WalletInjectionSnapshot | null
  error: string
  isConnecting: boolean
  isAutoConnecting: boolean
  refreshWallets: () => void
  connectWallet: (mode: ConnectMode) => Promise<void>
}

const MidnightWalletContext = createContext<MidnightWalletContextValue | null>(null)

export function MidnightWalletProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<MidnightWalletSummary[]>([])
  const [selectedWalletId, setSelectedWalletId] = useState("")
  const [networkId, setNetworkId] = useState(defaultNetworkId)
  const [connection, setConnection] = useState<MidnightConnectionSnapshot | null>(null)
  const [injection, setInjection] = useState<WalletInjectionSnapshot | null>(null)
  const [error, setError] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isAutoConnecting, setIsAutoConnecting] = useState(false)

  const selectedWallet = useMemo(
    () => wallets.find((wallet) => wallet.id === selectedWalletId),
    [selectedWalletId, wallets],
  )

  function refreshWallets() {
    const discoveredWallets = discoverMidnightWallets()
    const nextInjection = inspectWalletInjection()
    setWallets(discoveredWallets)
    setSelectedWalletId((current) => current || discoveredWallets[0]?.id || "")
    setInjection(nextInjection)
    setError("")
  }

  async function connectWallet(mode: ConnectMode) {
    if (!selectedWalletId) {
      setError("No Midnight wallet was found in this browser.")
      return
    }

    if (mode === "auto") {
      setIsAutoConnecting(true)
    } else {
      setIsConnecting(true)
    }
    setError("")

    try {
      const nextConnection =
        mode === "auto"
          ? await connectAnyMidnightWalletAuto({
              walletIds: wallets.map((wallet) => wallet.id).filter((walletId, index, values) =>
                Boolean(walletId) && values.indexOf(walletId) === index,
              ),
              preferredNetworkId: networkId,
            })
          : await connectMidnightWallet({
              walletId: selectedWalletId,
              networkId,
            })

      setNetworkId(nextConnection.requestedNetworkId)
      setConnection(nextConnection)
    } catch (connectError) {
      setConnection(null)
      setError(
        connectError instanceof Error
          ? connectError.message
          : "Failed to connect Midnight wallet.",
      )
    } finally {
      setIsConnecting(false)
      setIsAutoConnecting(false)
    }
  }

  useEffect(() => {
    refreshWallets()
  }, [])

  const value = useMemo<MidnightWalletContextValue>(
    () => ({
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
    }),
    [
      wallets,
      selectedWallet,
      selectedWalletId,
      networkId,
      connection,
      injection,
      error,
      isConnecting,
      isAutoConnecting,
    ],
  )

  return (
    <MidnightWalletContext.Provider value={value}>
      {children}
    </MidnightWalletContext.Provider>
  )
}

export function useMidnightWallet() {
  const context = useContext(MidnightWalletContext)

  if (!context) {
    throw new Error("useMidnightWallet must be used inside MidnightWalletProvider.")
  }

  return context
}
