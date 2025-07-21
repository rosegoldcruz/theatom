// Backend API client for ATOM v2
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export interface BotStatus {
  status: 'running' | 'stopped' | 'error'
  uptime: number
  totalTrades: number
  successfulTrades: number
  totalProfit: number
  profit24h: number
  successRate: number
  gasSpent: number
  lastUpdate: number
}

export interface ArbitrageOpportunity {
  id: string
  tokenA: {
    address: string
    symbol: string
    decimals: number
  }
  tokenB: {
    address: string
    symbol: string
    decimals: number
  }
  buyDex: string
  sellDex: string
  profitUSD: number
  profitPercentage: number
  gasEstimate: number
  netProfitUSD: number
  confidence: number
  timestamp: number
  route: string[]
}

export interface Trade {
  id: string
  timestamp: number
  tokenIn: string
  tokenOut: string
  amountIn: string
  amountOut: string
  profit: number
  gasUsed: number
  txHash: string
  status: 'success' | 'failed' | 'pending'
  dexPath: string[]
}

export interface Analytics {
  totalVolume: number
  totalProfit: number
  totalGasSpent: number
  averageProfit: number
  bestTrade: Trade | null
  profitByHour: { hour: number; profit: number }[]
  profitByToken: { token: string; profit: number }[]
  successRateByDex: { dex: string; rate: number }[]
}

class APIClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  // Bot control endpoints
  async startBot(config?: any): Promise<{ success: boolean; message: string }> {
    return this.request('/start', {
      method: 'POST',
      body: JSON.stringify(config || {}),
    })
  }

  async stopBot(): Promise<{ success: boolean; message: string }> {
    return this.request('/stop', {
      method: 'POST',
    })
  }

  async getBotStatus(): Promise<BotStatus> {
    return this.request('/status')
  }

  // Trading endpoints
  async getOpportunities(): Promise<ArbitrageOpportunity[]> {
    return this.request('/opportunities')
  }

  async executeTrade(opportunityId: string): Promise<{
    success: boolean
    txHash?: string
    error?: string
  }> {
    return this.request('/execute', {
      method: 'POST',
      body: JSON.stringify({ opportunityId }),
    })
  }

  // Analytics endpoints
  async getTradeHistory(limit = 50): Promise<Trade[]> {
    return this.request(`/trades?limit=${limit}`)
  }

  async getAnalytics(timeframe = '24h'): Promise<Analytics> {
    return this.request(`/analytics?timeframe=${timeframe}`)
  }

  // Configuration endpoints
  async getConfig(): Promise<any> {
    return this.request('/config')
  }

  async updateConfig(config: any): Promise<{ success: boolean }> {
    return this.request('/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    })
  }

  // WebSocket connection for real-time updates
  connectWebSocket(handlers: {
    onStatus?: (status: BotStatus) => void
    onOpportunity?: (opportunity: ArbitrageOpportunity) => void
    onTrade?: (trade: Trade) => void
  }) {
    const ws = new WebSocket(`${API_BASE_URL.replace('http', 'ws')}/ws`)

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      switch (data.type) {
        case 'status':
          handlers.onStatus?.(data.payload)
          break
        case 'opportunity':
          handlers.onOpportunity?.(data.payload)
          break
        case 'trade':
          handlers.onTrade?.(data.payload)
          break
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return ws
  }
}

export const api = new APIClient()

export const arbitrageApi = {
  getOpportunities: () => fetch('/api/opportunities').then(res => res.json()),
  executeArbitrage: (data: any) => fetch('/api/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  simulate: (data: any) => fetch('/api/arbitrage/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  getStatus: () => fetch('/api/status').then(res => res.json()),
};

export const opportunitiesApi = {
  getAll: () => fetch('/api/opportunities'),
  getById: (id: string) => fetch(`/api/opportunities/${id}`)
};

export const botApi = {
  getStatus: () => fetch('/api/bot/status'),
  start: () => fetch('/api/bot/start', { method: 'POST' }),
  stop: () => fetch('/api/bot/stop', { method: 'POST' }),
  updateConfig: (config: any) => fetch('/api/bot/config', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  })
};













