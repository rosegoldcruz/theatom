import { useState, useEffect, useCallback, useRef } from 'react'
import { api, BotStatus, ArbitrageOpportunity, Trade } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'

export function useBotStatus() {
  const [status, setStatus] = useState<BotStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const wsRef = useRef<WebSocket | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      const data = await api.getBotStatus()
      setStatus(data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch bot status')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Initial fetch
    fetchStatus()

    // Set up WebSocket for real-time updates
    wsRef.current = api.connectWebSocket({
      onStatus: (newStatus) => {
        setStatus(newStatus)
      },
    })

    // Fallback polling every 5 seconds
    const interval = setInterval(fetchStatus, 5000)

    return () => {
      clearInterval(interval)
      wsRef.current?.close()
    }
  }, [fetchStatus])

  const startBot = useCallback(async (config?: any) => {
    try {
      setLoading(true)
      const result = await api.startBot(config)
      
      if (result.success) {
        toast({
          title: 'Bot Started',
          description: 'ATOM arbitrage bot is now running',
        })
        // Fetch updated status
        await fetchStatus()
      } else {
        throw new Error(result.message)
      }
    } catch (err: any) {
      toast({
        title: 'Failed to start bot',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [fetchStatus, toast])

  const stopBot = useCallback(async () => {
    try {
      setLoading(true)
      const result = await api.stopBot()
      
      if (result.success) {
        toast({
          title: 'Bot Stopped',
          description: 'ATOM arbitrage bot has been stopped',
        })
        // Fetch updated status
        await fetchStatus()
      } else {
        throw new Error(result.message)
      }
    } catch (err: any) {
      toast({
        title: 'Failed to stop bot',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [fetchStatus, toast])

  return {
    status,
    loading,
    error,
    startBot,
    stopBot,
    refetch: fetchStatus,
  }
}

export function useArbitrageOpportunities() {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const wsRef = useRef<WebSocket | null>(null)

  const fetchOpportunities = useCallback(async () => {
    try {
      const data = await api.getOpportunities()
      setOpportunities(data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch opportunities')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Initial fetch
    fetchOpportunities()

    // Set up WebSocket for real-time updates
    wsRef.current = api.connectWebSocket({
      onOpportunity: (opportunity) => {
        setOpportunities((prev) => {
          // Add new opportunity to the beginning
          const updated = [opportunity, ...prev]
          // Keep only the latest 50 opportunities
          return updated.slice(0, 50)
        })
      },
    })

    // Refresh every 2 seconds
    const interval = setInterval(fetchOpportunities, 2000)

    return () => {
      clearInterval(interval)
      wsRef.current?.close()
    }
  }, [fetchOpportunities])

  const executeTrade = useCallback(async (opportunityId: string) => {
    try {
      const result = await api.executeTrade(opportunityId)
      
      if (result.success) {
        toast({
          title: 'Trade Executed',
          description: `Transaction hash: ${result.txHash?.slice(0, 10)}...`,
        })
        
        // Remove executed opportunity
        setOpportunities((prev) => prev.filter((o) => o.id !== opportunityId))
        
        return result
      } else {
        throw new Error(result.error || 'Trade execution failed')
      }
    } catch (err: any) {
      toast({
        title: 'Trade Failed',
        description: err.message,
        variant: 'destructive',
      })
      throw err
    }
  }, [toast])

  return {
    opportunities,
    loading,
    error,
    executeTrade,
    refetch: fetchOpportunities,
  }
}

export function useTradeHistory(limit = 50) {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const fetchTrades = useCallback(async () => {
    try {
      const data = await api.getTradeHistory(limit)
      setTrades(data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch trade history')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    // Initial fetch
    fetchTrades()

    // Set up WebSocket for real-time updates
    wsRef.current = api.connectWebSocket({
      onTrade: (trade) => {
        setTrades((prev) => {
          // Add new trade to the beginning
          const updated = [trade, ...prev]
          // Keep only the specified limit
          return updated.slice(0, limit)
        })
      },
    })

    // Refresh every 10 seconds
    const interval = setInterval(fetchTrades, 10000)

    return () => {
      clearInterval(interval)
      wsRef.current?.close()
    }
  }, [fetchTrades, limit])

  return {
    trades,
    loading,
    error,
    refetch: fetchTrades,
  }
}

export function useAnalytics(timeframe = '24h') {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const data = await api.getAnalytics(timeframe)
        setAnalytics(data)
        setError(null)
      } catch (err) {
        setError('Failed to fetch analytics')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()

    // Refresh every minute
    const interval = setInterval(fetchAnalytics, 60000)

    return () => clearInterval(interval)
  }, [timeframe])

  return {
    analytics,
    loading,
    error,
  }
}
