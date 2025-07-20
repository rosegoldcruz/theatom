"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "@/contexts/WalletContext"

export function UserNav() {
  const { address, isConnected, connect, disconnect, balance, network } = useWallet()

  if (!isConnected) {
    return (
      <Button onClick={connect} variant="outline">
        Connect Wallet
      </Button>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="text-sm">
        <div className="font-medium">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
        <div className="text-muted-foreground">
          {parseFloat(balance).toFixed(4)} ETH • {network}
        </div>
      </div>
      <Button onClick={disconnect} variant="outline" size="sm">
        Disconnect
      </Button>
    </div>
  )
}
