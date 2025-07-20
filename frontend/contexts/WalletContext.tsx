'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAccount, useConnect, useDisconnect, useNetwork, useSwitchNetwork } from 'wagmi'
import { useBalance } from 'wagmi'
import { formatEther } from 'viem'

interface WalletContextType {
  address: string | undefined
  isConnected: boolean
  isConnecting: boolean
  balance: string
  network: string
  connect: () => void
  disconnect: () => void
  switchNetwork: (chainId: number) => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

const NETWORK_NAMES: { [key: number]: string } = {
  1: 'Ethereum',
  137: 'Polygon',
  42161: 'Arbitrum',
  8453: 'Base',
  10: 'Optimism',
  84532: 'Base Sepolia', // Base Sepolia testnet
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected: wagmiIsConnected } = useAccount()
  const { connect: wagmiConnect, connectors, isLoading: isConnecting } = useConnect()
  const { disconnect: wagmiDisconnect } = useDisconnect()
  const { chain } = useNetwork()
  const { switchNetwork: wagmiSwitchNetwork } = useSwitchNetwork()
  
  const { data: balanceData } = useBalance({
    address: address,
    watch: true,
  })

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const connect = useCallback(() => {
    // Try MetaMask first, then other connectors
    const metamask = connectors.find(c => c.id === 'metaMask')
    const injected = connectors.find(c => c.id === 'injected')
    const walletConnect = connectors.find(c => c.id === 'walletConnect')
    
    if (metamask?.ready) {
      wagmiConnect({ connector: metamask })
    } else if (injected?.ready) {
      wagmiConnect({ connector: injected })
    } else if (walletConnect) {
      wagmiConnect({ connector: walletConnect })
    } else {
      // Use first available connector
      const connector = connectors[0]
      if (connector) {
        wagmiConnect({ connector })
      }
    }
  }, [connectors, wagmiConnect])

  const disconnect = useCallback(() => {
    wagmiDisconnect()
  }, [wagmiDisconnect])

  const switchNetwork = useCallback((chainId: number) => {
    if (wagmiSwitchNetwork) {
      wagmiSwitchNetwork(chainId)
    }
  }, [wagmiSwitchNetwork])

  // Format balance
  const balance = balanceData ? formatEther(balanceData.value) : '0'
  
  // Get network name
  const network = chain ? NETWORK_NAMES[chain.id] || chain.name : 'Unknown'

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <WalletContext.Provider
        value={{
          address: undefined,
          isConnected: false,
          isConnecting: false,
          balance: '0',
          network: 'Unknown',
          connect: () => {},
          disconnect: () => {},
          switchNetwork: () => {},
        }}
      >
        {children}
      </WalletContext.Provider>
    )
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: wagmiIsConnected,
        isConnecting,
        balance,
        network,
        connect,
        disconnect,
        switchNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
