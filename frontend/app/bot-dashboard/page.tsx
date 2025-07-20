'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BotControlPanel from '@/components/dashboard/BotControlPanel'
import LiveTradesTable from '@/components/dashboard/LiveTradesTable'
import LiveLogsViewer from '@/components/dashboard/LiveLogsViewer'
import BotConfigPanel from '@/components/dashboard/BotConfigPanel'
import { Activity, TrendingUp, Settings, FileText, BarChart3 } from 'lucide-react'

export default function BotDashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ATOM Arbitrage Bot Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and control your autonomous arbitrage trading bot
          </p>
        </div>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="trades" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Trades
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Config
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bot Control Panel */}
            <BotControlPanel />
            
            {/* Recent Trades Summary */}
            <div className="space-y-6">
              <LiveTradesTable />
            </div>
          </div>
        </TabsContent>

        {/* Trades Tab */}
        <TabsContent value="trades" className="space-y-6">
          <LiveTradesTable />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center py-8 text-muted-foreground">
            Analytics dashboard coming soon...
          </div>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <LiveLogsViewer />
        </TabsContent>

        {/* Config Tab */}
        <TabsContent value="config" className="space-y-6">
          <BotConfigPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
