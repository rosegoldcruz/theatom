"use client"

import React from 'react'
import { AppLayout } from '@/components/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, DollarSign, TrendingUp, Activity } from 'lucide-react'

export default function WalletPage() {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Quantum Wallet</h1>
          <p className="text-muted-foreground mt-2">Manage your multi-chain assets and connections</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-dark border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Balance</p>
                  <p className="text-2xl font-bold text-green-400">$12,847.32</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-dark border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm text-muted-foreground">24h Change</p>
                  <p className="text-2xl font-bold text-blue-400">+5.2%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-dark border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Positions</p>
                  <p className="text-2xl font-bold text-purple-400">8</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-dark border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-primary" />
              <span className="gradient-text">Wallet Connections</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
              <p>Connect your wallet to view balances and manage assets</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
