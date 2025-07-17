'use client';

import React from 'react';
import { Play, Pause } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useArbitrageBot } from '@/hooks/useArbitrageBot';
import { TradingMetrics } from '@/components/TradingMetrics';
import { OpportunitiesFeed } from '@/components/OpportunitiesFeed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NETWORKS } from '@/constants/networks';

export function DashboardPage() {
  const { state } = useAppContext();
  const { isDark, selectedNetwork } = state;
  const { botStatus, startBot, stopBot } = useArbitrageBot();

  const handleToggleBot = async () => {
    if (botStatus.status === 'running') {
      await stopBot();
    } else {
      await startBot();
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Trading Metrics */}
      <TradingMetrics />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bot Status Card */}
        <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Bot Status</span>
              <Button 
                onClick={handleToggleBot}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
                  botStatus.status === 'running' 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {botStatus.status === 'running' ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Stop Bot</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Start Bot</span>
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Status</span>
              <span className={`font-medium ${
                botStatus.status === 'running' ? 'text-green-500' : 
                botStatus.status === 'paused' ? 'text-yellow-500' : 'text-gray-500'
              }`}>
                {botStatus.status.charAt(0).toUpperCase() + botStatus.status.slice(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Uptime</span>
              <span>{Math.floor(botStatus.uptime / 3600)}h {Math.floor((botStatus.uptime % 3600) / 60)}m</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Next Scan</span>
              <span>{Math.floor((botStatus.nextScan - Date.now()) / 1000)}s</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Gas Price</span>
              <span>{NETWORKS[selectedNetwork]?.gasPrice || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Live Opportunities Preview */}
        <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Live Opportunities</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-500">Live</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OpportunitiesFeed showHeader={false} maxItems={4} />
          </CardContent>
        </Card>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Network Health
                </p>
                <p className="text-2xl font-bold text-green-500">99.9%</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  All systems operational
                </p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  AAVE Liquidity
                </p>
                <p className="text-2xl font-bold text-blue-500">$2.4B</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Available for flash loans
                </p>
              </div>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  MEV Protection
                </p>
                <p className="text-2xl font-bold text-purple-500">Active</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Flashbots integration
                </p>
              </div>
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
