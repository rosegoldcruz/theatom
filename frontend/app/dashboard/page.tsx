'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  Activity,
  DollarSign,
  Zap,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle
} from "lucide-react"
import { useBotStatus, useArbitrageOpportunities, useTradeHistory, useAnalytics } from '@/hooks/useBot'
import { useWallet } from '@/contexts/WalletContext'
import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'

export default function DashboardPage() {
  const { isConnected, connect } = useWallet()
  const { status, loading: statusLoading, startBot, stopBot } = useBotStatus()
  const { opportunities, executeTrade } = useArbitrageOpportunities()
  const { trades } = useTradeHistory(10)
  const { analytics } = useAnalytics('24h')

  const [isStarting, setIsStarting] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const [executingTrades, setExecutingTrades] = useState<Set<string>>(new Set())

  const handleStartBot = async () => {
    setIsStarting(true)
    try {
      await startBot()
    } finally {
      setIsStarting(false)
    }
  }

  const handleStopBot = async () => {
    setIsStopping(true)
    try {
      await stopBot()
    } finally {
      setIsStopping(false)
    }
  }

  const handleExecuteTrade = async (opportunityId: string) => {
    setExecutingTrades(prev => new Set(prev).add(opportunityId))
    try {
      await executeTrade(opportunityId)
    } finally {
      setExecutingTrades(prev => {
        const next = new Set(prev)
        next.delete(opportunityId)
        return next
      })
    }
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertTriangle className="h-12 w-12 text-yellow-500" />
        <h2 className="text-2xl font-bold">Wallet Not Connected</h2>
        <p className="text-muted-foreground">Please connect your wallet to access the dashboard</p>
        <Button onClick={connect} size="lg">
          Connect Wallet
        </Button>
      </div>
    )
  }

  const isRunning = status?.status === 'running'

  return (
    <div className="space-y-6">
      {/* Bot Control */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bot Control</CardTitle>
              <CardDescription>
                Manage your ATOM arbitrage bot
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={isRunning ? "default" : "secondary"}>
                {statusLoading ? 'Loading...' : (isRunning ? 'Running' : 'Stopped')}
              </Badge>
              {isRunning ? (
                <Button
                  onClick={handleStopBot}
                  disabled={isStopping}
                  variant="destructive"
                  size="sm"
                >
                  {isStopping ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Stopping...
                    </>
                  ) : (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Stop Bot
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleStartBot}
                  disabled={isStarting}
                  size="sm"
                >
                  {isStarting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start Bot
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        {status && (
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Uptime: {formatDistanceToNow(Date.now() - status.uptime * 1000)}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${status?.totalProfit.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              24h: ${status?.profit24h.toFixed(2) || '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {status?.successRate.toFixed(1) || '0'}%
            </div>
            <Progress value={status?.successRate || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status?.totalTrades || 0}</div>
            <p className="text-xs text-muted-foreground">
              {status?.successfulTrades || 0} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gas Spent</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${status?.gasSpent.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg per trade: ${status?.totalTrades ? (status.gasSpent / status.totalTrades).toFixed(2) : '0.00'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="opportunities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="history">Trade History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Arbitrage Opportunities</CardTitle>
              <CardDescription>
                Real-time arbitrage opportunities across DEXs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {opportunities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No opportunities available at the moment
                  </div>
                ) : (
                  opportunities.slice(0, 10).map((opp) => (
                    <div
                      key={opp.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {opp.tokenA.symbol} → {opp.tokenB.symbol}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {opp.buyDex} → {opp.sellDex}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Profit: ${opp.profitUSD.toFixed(2)} ({opp.profitPercentage.toFixed(2)}%)
                          • Gas: ${(opp.gasEstimate * 0.00003).toFixed(2)}
                          • Net: ${opp.netProfitUSD.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={opp.confidence > 0.8 ? "default" : "secondary"}
                        >
                          {(opp.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => handleExecuteTrade(opp.id)}
                          disabled={!isRunning || executingTrades.has(opp.id)}
                        >
                          {executingTrades.has(opp.id) ? (
                            <>
                              <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                              Executing...
                            </>
                          ) : (
                            'Execute'
                          )}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Trades</CardTitle>
              <CardDescription>
                Your recent arbitrage executions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {trades.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No trades executed yet
                  </div>
                ) : (
                  trades.map((trade) => (
                    <div
                      key={trade.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {trade.tokenIn} → {trade.tokenOut}
                          </span>
                          <Badge
                            variant={trade.status === 'success' ? 'default' : 'destructive'}
                          >
                            {trade.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(trade.timestamp), { addSuffix: true })}
                          • Profit: ${trade.profit.toFixed(2)}
                          • Gas: ${trade.gasUsed.toFixed(2)}
                        </div>
                      </div>
                      <a
                        href={`https://etherscan.io/tx/${trade.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline"
                      >
                        View TX
                      </a>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Profit by Hour</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add chart component here */}
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  Chart visualization (integrate recharts)
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Pairs</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.profitByToken && (
                  <div className="space-y-2">
                    {analytics?.profitByToken?.slice(0, 5).map((item: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-sm">{item.token}</span>
                        <span className="text-sm font-medium">
                          ${item.profit.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}





