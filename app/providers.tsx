"use client"

import type { ReactNode } from "react"
import { LanguageProvider } from "@/components/LanguageProvider"
import { MidnightWalletProvider } from "@/components/MidnightWalletProvider"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <MidnightWalletProvider>{children}</MidnightWalletProvider>
    </LanguageProvider>
  )
}
