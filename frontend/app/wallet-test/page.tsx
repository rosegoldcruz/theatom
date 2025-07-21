'use client'

import { useAccount, useNetwork } from 'wagmi'
import FlashLoanTrigger from '@/components/FlashLoanTrigger'
import { WalletButton } from '@/components/WalletButton'

export default function WalletTestPage() {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Reown AppKit Integration Test</h1>
        <p className="text-muted-foreground">
          Test wallet connection and flash loan functionality
        </p>
      </div>

      {/* Wallet Connection Status */}
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-2xl font-bold mb-4">Wallet Status</h2>
        {isConnected ? (
          <div className="space-y-2">
            <p className="text-green-600">✅ Wallet Connected</p>
            <p><strong>Address:</strong> {address}</p>
            <p><strong>Network:</strong> {chain?.name} (ID: {chain?.id})</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-yellow-600">⚠️ Wallet Not Connected</p>
            <WalletButton />
          </div>
        )}
      </div>

      {/* Flash Loan Component */}
      <FlashLoanTrigger />

      {/* Instructions */}
      <div className="bg-muted p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Click "Connect Wallet" to open the Reown AppKit modal</li>
          <li>Choose your preferred wallet (MetaMask, WalletConnect, etc.)</li>
          <li>Make sure you're on Base Sepolia testnet</li>
          <li>Once connected, you can execute flash loan transactions</li>
        </ol>
      </div>
    </div>
  )
}
