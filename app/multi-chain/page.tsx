"use client"

import React from 'react'
import { AppLayout } from '@/components/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Network,
  Zap,
  Activity,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

const chains = [
  {
    name: 'Ethereum',
    status: 'active',
    tvl: '$45.2B',
    gasPrice: '25 gwei',
    opportunities: 8,
    color: 'from-blue-400 to-blue-600'
  },
  {
    name: 'Polygon',
    status: 'active',
    tvl: '$12.8B',
    gasPrice: '0.02 MATIC',
    opportunities: 5,
    color: 'from-purple-400 to-purple-600'
  },
  {
    name: 'Arbitrum',
    status: 'active',
    tvl: '$8.9B',
    gasPrice: '0.1 gwei',
    opportunities: 12,
    color: 'from-cyan-400 to-cyan-600'
  },
  {
    name: 'Base',
    status: 'active',
    tvl: '$3.2B',
    gasPrice: '0.05 gwei',
    opportunities: 7,
    color: 'from-green-400 to-green-600'
  },
  {
    name: 'Optimism',
    status: 'maintenance',
    tvl: '$6.1B',
    gasPrice: '0.08 gwei',
    opportunities: 0,
    color: 'from-red-400 to-red-600'
  }
]

export default function MultiChainPage() {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6 relative">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
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
          <h1 className="text-4xl font-bold gradient-text">Multi-Dimensional Chains</h1>
          <p className="text-muted-foreground mt-2">Cross-chain arbitrage opportunities across parallel networks</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
          <Card className="glass-dark border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Network className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Chains</p>
                  <p className="text-2xl font-bold text-primary">4/5</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-dark border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-sm text-muted-foreground">Cross-Chain Ops</p>
                  <p className="text-2xl font-bold text-green-400">32</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-dark border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm text-muted-foreground">Total TVL</p>
                  <p className="text-2xl font-bold text-blue-400">$76.2B</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-dark border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Gas</p>
                  <p className="text-2xl font-bold text-yellow-400">$2.45</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chain Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {chains.map((chain, index) => (
            <Card key={index} className="glass-dark border-primary/20 relative overflow-hidden group hover:border-primary/40 transition-all duration-300">
              <div className={`absolute inset-0 bg-gradient-to-br ${chain.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
              
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center justify-between">
                  <span className="gradient-text">{chain.name}</span>
                  <div className="flex items-center space-x-2">
                    {chain.status === 'active' ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-orange-400" />
                    )}
                    <Badge variant={chain.status === 'active' ? 'default' : 'secondary'}>
                      {chain.status}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">TVL</p>
                    <p className="font-semibold">{chain.tvl}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gas Price</p>
                    <p className="font-semibold">{chain.gasPrice}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <span className="text-sm font-medium">Opportunities</span>
                  <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                    {chain.opportunities}
                  </Badge>
                </div>
                
                {chain.status === 'active' && (
                  <div className="flex items-center space-x-2 text-xs text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span>Real-time monitoring active</span>
                  </div>
                )}
                
                {chain.status === 'maintenance' && (
                  <div className="flex items-center space-x-2 text-xs text-orange-400">
                    <Clock className="h-3 w-3" />
                    <span>Scheduled maintenance</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cross-Chain Bridge Status */}
        <Card className="glass-dark border-primary/20 relative overflow-hidden">
          <div className="absolute inset-0 holographic opacity-10" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center space-x-2">
              <Network className="h-5 w-5 text-primary" />
              <span className="gradient-text">Cross-Chain Bridge Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="font-semibold text-green-400">ETH ↔ POLY</span>
                </div>
                <p className="text-sm text-muted-foreground">Bridge operational</p>
                <p className="text-xs text-green-400 mt-1">~2 min transfer</p>
              </div>
              
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="font-semibold text-green-400">ETH ↔ ARB</span>
                </div>
                <p className="text-sm text-muted-foreground">Bridge operational</p>
                <p className="text-xs text-green-400 mt-1">~1 min transfer</p>
              </div>
              
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="font-semibold text-green-400">ETH ↔ BASE</span>
                </div>
                <p className="text-sm text-muted-foreground">Bridge operational</p>
                <p className="text-xs text-green-400 mt-1">~30 sec transfer</p>
              </div>
              
              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                  <span className="font-semibold text-orange-400">ETH ↔ OP</span>
                </div>
                <p className="text-sm text-muted-foreground">Maintenance mode</p>
                <p className="text-xs text-orange-400 mt-1">ETA: 2 hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
