'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ExternalLink, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'

interface Trade {
  id: string
  timestamp: string
  tokenA: string
  tokenB: string
  pair: string
  buyDex: string
  sellDex: string
  amountIn: string
  profit: string
  gasUsed: string
  transactionHash: string
  status: 'success' | 'failed' | 'pending'
  useFlashLoan?: boolean
  flashLoanAmount?: string
  flashLoanFee?: string
}

export default function LiveTradesTable() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTrades = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/bot/trades?limit=50')
      const data = await response.json()
      
      if (data.success) {
        setTrades(data.trades)
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch trades')
      }
    } catch (err) {
      setError('Network error: Unable to fetch trades')
    } finally {
      setLoading(false)
    }
  }

  // Poll trades every 10 seconds
  useEffect(() => {
    fetchTrades()
    const interval = setInterval(fetchTrades, 10000)
    return () => clearInterval(interval)
  }, [])

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatProfit = (profit: string) => {
    const profitNum = parseFloat(profit)
    return profitNum.toFixed(4)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getProfitIcon = (profit: string) => {
    const profitNum = parseFloat(profit)
    if (profitNum > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />
    } else if (profitNum < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />
    }
    return null
  }

  const openTransaction = (hash: string) => {
    // Open Base Sepolia explorer
    window.open(`https://sepolia.basescan.org/tx/${hash}`, '_blank')
  }

  const formatTokenPair = (tokenA: string, tokenB: string) => {
    // Convert addresses to token symbols (you'd have a mapping for this)
    const getTokenSymbol = (address: string) => {
      const tokenMap: { [key: string]: string } = {
        '0x4200000000000000000000000000000000000006': 'WETH',
        '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': 'USDC',
        '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb': 'DAI'
      }
      return tokenMap[address] || `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    return `${getTokenSymbol(tokenA)}/${getTokenSymbol(tokenB)}`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Live Trade Activity</CardTitle>
            <CardDescription>
              Real-time arbitrage trades executed by the bot
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTrades}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Pair</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Gas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tx</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {loading ? 'Loading trades...' : 'No trades found'}
                  </TableCell>
                </TableRow>
              ) : (
                trades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell className="font-mono text-xs">
                      {formatTimestamp(trade.timestamp)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatTokenPair(trade.tokenA, trade.tokenB)}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <div className="text-green-600">Buy: {trade.buyDex}</div>
                        <div className="text-red-600">Sell: {trade.sellDex}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">
                      {trade.useFlashLoan && trade.flashLoanAmount ?
                        `${parseFloat(trade.flashLoanAmount).toFixed(2)} ETH` :
                        `${parseFloat(trade.amountIn).toFixed(4)} ETH`
                      }
                    </TableCell>
                    <TableCell>
                      {trade.useFlashLoan ? (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          Flash Loan
                        </Badge>
                      ) : (
                        <Badge variant="outline">Regular</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getProfitIcon(trade.profit)}
                        <span className={`font-mono ${
                          parseFloat(trade.profit) > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatProfit(trade.profit)} ETH
                        </span>
                        {trade.flashLoanFee && (
                          <div className="text-xs text-muted-foreground">
                            (Fee: {parseFloat(trade.flashLoanFee).toFixed(4)})
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {parseInt(trade.gasUsed).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(trade.status)}
                    </TableCell>
                    <TableCell>
                      {trade.transactionHash && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openTransaction(trade.transactionHash)}
                          className="h-6 w-6 p-0"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {trades.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Showing {trades.length} most recent trades • Updates every 10 seconds
          </div>
        )}
      </CardContent>
    </Card>
  )
}
