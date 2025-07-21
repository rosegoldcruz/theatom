"use client"

import { useAccount, useBalance, useNetwork } from 'wagmi'
import { WalletButton } from './WalletButton'

export function UserNav() {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  const { data: balance } = useBalance({
    address: address,
  })

  return (
    <div className="flex items-center space-x-4">
      {isConnected && address && (
        <div className="text-sm">
          <div className="font-medium">
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
          <div className="text-muted-foreground">
            {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '0.0000 ETH'} • {chain?.name || 'Unknown'}
          </div>
        </div>
      )}
      <WalletButton />
    </div>
  )
}
