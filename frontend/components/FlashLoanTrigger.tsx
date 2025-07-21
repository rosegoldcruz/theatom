'use client'

import React, { useState } from 'react'
import { useAccount, useContractWrite, useWaitForTransaction, useNetwork } from 'wagmi'
import { calls, flashLoanABI } from '@/calls/flashLoan'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, CheckCircle, AlertCircle, Zap } from 'lucide-react'
import { WalletButton } from './WalletButton'

export default function FlashLoanTrigger() {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  const [isExecuting, setIsExecuting] = useState(false)

  const {
    data,
    error,
    isLoading: isPending,
    write: writeContract
  } = useContractWrite({
    address: calls[0].address as `0x${string}`,
    abi: flashLoanABI,
    functionName: 'requestFlashLoan',
  })

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransaction({
      hash: data?.hash,
    })

  const executeFlashLoan = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (chain?.id !== 84532) {
      toast.error('Please switch to Base Sepolia network')
      return
    }

    try {
      setIsExecuting(true)
      toast.info('Preparing flash loan transaction...')

      writeContract({
        args: calls[0].args,
      })

    } catch (err) {
      console.error('Flash loan execution error:', err)
      toast.error('Failed to execute flash loan')
      setIsExecuting(false)
    }
  }

  // Handle transaction status changes
  React.useEffect(() => {
    if (isPending) {
      toast.loading('Transaction pending...', { id: 'flash-loan-tx' })
    }

    if (isConfirming) {
      toast.loading('Confirming transaction...', { id: 'flash-loan-tx' })
    }

    if (isConfirmed) {
      toast.success('Flash loan executed successfully!', { id: 'flash-loan-tx' })
      setIsExecuting(false)
    }

    if (error) {
      toast.error(`Transaction failed: ${error.message}`, { id: 'flash-loan-tx' })
      setIsExecuting(false)
    }
  }, [isPending, isConfirming, isConfirmed, error])

  return (
    <div className="p-6 bg-card rounded-lg border">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-6 h-6 text-yellow-500" />
        <h2 className="text-2xl font-bold">Flash Loan Arbitrage</h2>
      </div>

      <p className="text-muted-foreground mb-6">
        Execute flash loan arbitrage trades directly from your wallet
      </p>

      {!isConnected ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect your wallet to execute flash loan transactions
          </p>
          <WalletButton />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Wallet Status */}
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700 dark:text-green-300">
              Wallet connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
          </div>

          {/* Network Check */}
          {chain?.id !== 84532 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-700 dark:text-yellow-300">
                Please switch to Base Sepolia network
              </span>
            </div>
          )}

          {/* Flash Loan Details */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Flash Loan Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p><strong>Asset:</strong> USDC (Base Sepolia)</p>
                <p><strong>Amount:</strong> 1 USDC</p>
                <p><strong>Network:</strong> {chain?.name || 'Unknown'}</p>
              </div>
              <div className="space-y-2">
                <p><strong>Contract:</strong> {calls[0].address.slice(0, 10)}...</p>
                <p><strong>Function:</strong> requestFlashLoan</p>
                <p><strong>Gas:</strong> ~200k units</p>
              </div>
            </div>
          </div>

          {/* Transaction Status */}
          {data?.hash && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium mb-2">Transaction Status:</p>
              <div className="flex items-center gap-2">
                {isConfirming ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : isConfirmed ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                )}
                <span className="text-sm">
                  {isConfirming ? 'Confirming...' : isConfirmed ? 'Confirmed!' : 'Pending...'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Hash: {data?.hash.slice(0, 10)}...{data?.hash.slice(-8)}
              </p>
              <a
                href={`https://base-sepolia.basescan.org/tx/${data?.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                View on BaseScan →
              </a>
            </div>
          )}

          {/* Execute Button */}
          <Button
            onClick={executeFlashLoan}
            disabled={!isConnected || chain?.id !== 84532 || isPending || isConfirming}
            className="w-full"
            size="lg"
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isPending ? 'Executing...' : 'Confirming...'}
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Execute Flash Loan
              </>
            )}
          </Button>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-700 dark:text-red-300">
                  Transaction Failed
                </span>
              </div>
              <p className="text-xs text-red-600 dark:text-red-400">
                {error.message}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
