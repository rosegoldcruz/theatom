'use client';

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { 
  DollarSign, TrendingUp, Activity, Zap, Play, Pause, 
  CheckCircle, Clock, Shield 
} from 'lucide-react';

export function DashboardPage() {
  const { state, actions } = useAppContext();
  const { isDark, showBalance, tradingMetrics, opportunities, botStatus } = state;

  const toggleBot = () => {
    const newStatus = botStatus === 'running' ? 'stopped' : 'running';
    actions.setBotStatus(newStatus);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Profit</p>
              <p className="text-2xl font-bold text-green-500">
                ${showBalance ? tradingMetrics.totalProfit.toLocaleString() : '****'}
              </p>
              <p className="text-sm text-gray-500">+12.4% this month</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Profit</p>
              <p className="text-2xl font-bold text-blue-500">
                ${showBalance ? tradingMetrics.todayProfit.toFixed(2) : '****'}
              </p>
              <p className="text-sm text-gray-500">+{tradingMetrics.avgReturn}% avg return</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Success Rate</p>
              <p className="text-2xl font-bold">{tradingMetrics.successRate}%</p>
              <p className="text-sm text-gray-500">{tradingMetrics.totalTrades} total trades</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Trades</p>
              <p className="text-2xl font-bold">{tradingMetrics.activeTrades}</p>
              <p className="text-sm text-gray-500">Flash loan volume: ${tradingMetrics.flashLoanVolume.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bot Status Card */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700 shadow-sm`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Bot Status</h3>
            <button 
              onClick={toggleBot}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                botStatus === 'running' 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {botStatus === 'running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{botStatus === 'running' ? 'Stop Bot' : 'Start Bot'}</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className={`font-medium capitalize ${
                botStatus === 'running' ? 'text-green-500' : 
                botStatus === 'paused' ? 'text-yellow-500' : 'text-gray-500'
              }`}>
                {botStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Uptime</span>
              <span>4h 23m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Next Scan</span>
              <span>12s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Gas Price</span>
              <span>23 gwei</span>
            </div>
          </div>
        </div>

        {/* Live Opportunities */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700 shadow-sm`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Live Opportunities</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-500">Live</span>
            </div>
          </div>

          <div className="space-y-3">
            {opportunities.slice(0, 4).map(opp => (
              <div key={opp.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{opp.pair}</p>
                    <p className="text-sm text-gray-500">{opp.dex1} → {opp.dex2}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-500 font-semibold">+{opp.spread.toFixed(2)}%</p>
                    <p className="text-sm text-gray-500">${opp.profit.toFixed(0)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}