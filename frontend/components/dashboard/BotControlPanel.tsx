'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/components/ui/use-toast'
import { Play, Square, RotateCcw, Activity, AlertTriangle, CheckCircle } from 'lucide-react'

interface BotStatus {
  isRunning: boolean
  pid: number | null
  startTime: string | null
  lastHeartbeat: string | null
  stats: {
    totalTrades: number
    successfulTrades: number
    totalProfit: number
    totalGasSpent: number
    uptime: number
  }
  health: {
    status: string
    lastCheck: string | null
    errors: string[]
  }
}

export default function BotControlPanel() {
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Poll bot status every 5 seconds
  useEffect(() => {
    const fetchBotStatus = async () => {
      try {
        const response = await fetch('/api/bot/status')
        const data = await response.json()
        
        if (data.success) {
          setBotStatus(data.status)
          setError(null)
        } else {
          setError(data.error || 'Failed to fetch bot status')
        }
      } catch (err) {
        setError('Network error: Unable to fetch bot status')
      }
    }

    fetchBotStatus()
    const interval = setInterval(fetchBotStatus, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleBotAction = async (action: 'start' | 'stop' | 'restart') => {
    setLoading(true)
    
    try {
      const response = await fetch(`/api/bot/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setBotStatus(data.status)
        toast({
          title: "Success",
          description: data.message,
        })
      } else {
        toast({
          title: "Error",
          description: data.error || `Failed to ${action} bot`,
          variant: "destructive"
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: `Network error: Unable to ${action} bot`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = () => {
    if (!botStatus) {
      return <Badge variant="secondary">Unknown</Badge>
    }

    if (botStatus.isRunning) {
      const isHealthy = botStatus.health.status === 'healthy'
      return (
        <Badge variant={isHealthy ? "default" : "destructive"} className="flex items-center gap-1">
          {isHealthy ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
          {isHealthy ? 'Running' : 'Running (Issues)'}
        </Badge>
      )
    } else {
      return <Badge variant="secondary">Stopped</Badge>
    }
  }

  const formatUptime = (uptime: number) => {
    const hours = Math.floor(uptime / (1000 * 60 * 60))
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const formatLastHeartbeat = (heartbeat: string | null) => {
    if (!heartbeat) return 'Never'
    
    const diff = Date.now() - new Date(heartbeat).getTime()
    const seconds = Math.floor(diff / 1000)
    
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }

  const getSuccessRate = () => {
    if (!botStatus || botStatus.stats.totalTrades === 0) return '0%'
    return `${((botStatus.stats.successfulTrades / botStatus.stats.totalTrades) * 100).toFixed(1)}%`
  }

  const getNetProfit = () => {
    if (!botStatus) return '0.0000'
    return (botStatus.stats.totalProfit - botStatus.stats.totalGasSpent).toFixed(4)
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Bot Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Arbitrage Bot Status
              </CardTitle>
              <CardDescription>
                Monitor and control your autonomous arbitrage bot
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {botStatus?.stats.totalTrades || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Trades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {getSuccessRate()}
              </div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {getNetProfit()} ETH
              </div>
              <div className="text-sm text-muted-foreground">Net Profit</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <span className="font-medium">Process ID:</span> {botStatus?.pid || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Uptime:</span> {
                botStatus?.stats.uptime ? formatUptime(botStatus.stats.uptime) : 'N/A'
              }
            </div>
            <div>
              <span className="font-medium">Last Heartbeat:</span> {
                formatLastHeartbeat(botStatus?.lastHeartbeat)
              }
            </div>
            <div>
              <span className="font-medium">Health Status:</span> {
                botStatus?.health.status || 'Unknown'
              }
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => handleBotAction('start')}
              disabled={loading || botStatus?.isRunning}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start Bot
            </Button>
            
            <Button
              variant="destructive"
              onClick={() => handleBotAction('stop')}
              disabled={loading || !botStatus?.isRunning}
              className="flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              Stop Bot
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleBotAction('restart')}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Restart Bot
            </Button>
          </div>

          {/* Health Alerts */}
          {botStatus?.health.errors && botStatus.health.errors.length > 0 && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-1">Health Issues Detected:</div>
                <ul className="list-disc list-inside text-sm">
                  {botStatus.health.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
