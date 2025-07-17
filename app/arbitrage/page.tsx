"use client"

import React from 'react'
import { AppLayout } from '@/components/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  Activity,
  DollarSign,
  Clock,
  Target,
  Zap,
  Brain,
  Network
} from 'lucide-react'

const mockOpportunities = [
  {
    id: '1',
    pair: 'ETH/USDC',
    exchange1: 'Uniswap V3',
    exchange2: 'Curve',
    profit: 0.025,
    confidence: 0.95,
    volume: 50000,
    timeLeft: 45
  },
  {
    id: '2',
    pair: 'BTC/USDT',
    exchange1: 'Balancer',
    exchange2: 'Uniswap V2',
    profit: 0.018,
    confidence: 0.87,
    volume: 75000,
    timeLeft: 32
  },
  {
    id: '3',
    pair: 'LINK/ETH',
    exchange1: 'Curve',
    exchange2: 'Balancer',
    profit: 0.031,
    confidence: 0.92,
    volume: 25000,
    timeLeft: 28
  }
]

export default function ArbitragePage() {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6 relative">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Header */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold gradient-text">Neural Arbitrage</h1>
          <p className="text-muted-foreground mt-2">AI-powered cross-exchange opportunities</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
          <Card className="glass-dark border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Opportunities</p>
                  <p className="text-2xl font-bold text-green-400">12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-dark border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm text-muted-foreground">Potential Profit</p>
                  <p className="text-2xl font-bold text-blue-400">$2,847</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-dark border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-sm text-muted-foreground">AI Confidence</p>
                  <p className="text-2xl font-bold text-purple-400">91.2%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-dark border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Network className="h-5 w-5 text-orange-400" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Chains</p>
                  <p className="text-2xl font-bold text-orange-400">5</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Opportunities Table */}
        <Card className="glass-dark border-primary/20 relative z-10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="gradient-text">Live Arbitrage Opportunities</span>
              <Badge className="ml-auto animate-pulse">LIVE</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockOpportunities.map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="p-4 rounded-lg bg-primary/5 border border-primary/10 hover:border-primary/20 transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center relative z-10">
                    <div>
                      <p className="font-semibold text-lg">{opportunity.pair}</p>
                      <p className="text-sm text-muted-foreground">Trading Pair</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">{opportunity.exchange1}</p>
                      <p className="text-xs text-muted-foreground">↓</p>
                      <p className="text-sm font-medium">{opportunity.exchange2}</p>
                    </div>
                    
                    <div>
                      <p className="text-lg font-bold text-green-400">
                        +{(opportunity.profit * 100).toFixed(2)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Profit</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">
                        {(opportunity.confidence * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Confidence</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">${opportunity.volume.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Volume</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        className="glass hover:animate-glow-pulse relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-transparent animate-data-flow" />
                        <Zap className="h-4 w-4 mr-1" />
                        Execute
                      </Button>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{opportunity.timeLeft}s</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis */}
        <Card className="glass-dark border-primary/20 relative overflow-hidden">
          <div className="absolute inset-0 holographic opacity-10" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-primary" />
              <span className="gradient-text">AI Market Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <h3 className="font-semibold text-green-400 mb-2">Market Sentiment</h3>
                <p className="text-sm text-muted-foreground">
                  Bullish conditions detected across major DEXs. High liquidity and favorable spreads.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <h3 className="font-semibold text-blue-400 mb-2">Risk Assessment</h3>
                <p className="text-sm text-muted-foreground">
                  Low to moderate risk. Gas prices stable. Network congestion minimal.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <h3 className="font-semibold text-purple-400 mb-2">Prediction</h3>
                <p className="text-sm text-muted-foreground">
                  Optimal trading window for the next 2-3 hours. Expected profit margins: 1.5-3.2%.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
