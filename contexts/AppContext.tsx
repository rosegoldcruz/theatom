"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface AppContextType {
  theme: string
  setTheme: (theme: string) => void
  branding: string
  setBranding: (branding: string) => void
  isWalletConnected: boolean
  setIsWalletConnected: (connected: boolean) => void
  walletAddress: string | null
  setWalletAddress: (address: string | null) => void
  botActive: boolean
  setBotActive: (active: boolean) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('ai')
  const [branding, setBranding] = useState('arbitragebot')
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [botActive, setBotActive] = useState(false)

  useEffect(() => {
    // Apply theme class to document
    document.documentElement.className = `theme-${theme} dark`
  }, [theme])

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        branding,
        setBranding,
        isWalletConnected,
        setIsWalletConnected,
        walletAddress,
        setWalletAddress,
        botActive,
        setBotActive
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}