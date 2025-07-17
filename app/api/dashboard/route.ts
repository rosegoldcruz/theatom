import { NextRequest, NextResponse } from 'next/server'

// Mock dashboard data - in production this would connect to your existing backend
const mockDashboardData = {
  botStatus: 'running' as const,
  totalTrades: 462,
  successfulTrades: 435,
  totalProfit: 7214.58,
  recentTrades: [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      profit: 125.50,
      status: 'success' as const,
      txHash: '0x742d35Cc6634C0532925a3b8D'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      profit: 89.25,
      status: 'success' as const,
      txHash: '0x742d35Cc6634C0532925a3b8E'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      profit: -15.75,
      status: 'failed' as const,
      txHash: '0x742d35Cc6634C0532925a3b8F'
    }
  ],
  opportunities: [
    {
      id: '1',
      pair: 'ETH/USDC',
      profit: 0.025,
      confidence: 0.95
    },
    {
      id: '2',
      pair: 'BTC/USDT',
      profit: 0.018,
      confidence: 0.87
    },
    {
      id: '3',
      pair: 'LINK/ETH',
      profit: 0.031,
      confidence: 0.92
    }
  ]
}

export async function GET(request: NextRequest) {
  try {
    // In production, this would fetch real data from your existing backend
    // For now, return mock data to maintain functionality
    
    return NextResponse.json({
      success: true,
      data: mockDashboardData
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
