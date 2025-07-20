'use client';

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { DollarSign, TrendingUp, Activity, Zap } from 'lucide-react';

export function TradingMetrics() {
  const { state } = useAppContext();
  const { isDark, showBalance, tradingMetrics } = state;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700 shadow-sm`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Profit</p>
            <p className="text-2xl font-bold text-green-500">
              ${showBalance ? tradingMetrics.totalProfit.toLocaleString() : '****'}
            </p>
          </div>
          <DollarSign className="w-8 h-8 text-green-500" />
        </div>
      </div>

      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700 shadow-sm`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Today's Profit</p>
            <p className="text-2xl font-bold text-blue-500">
              ${showBalance ? tradingMetrics.todayProfit.toFixed(2) : '****'}
            </p>
          </div>
          <TrendingUp className="w-8 h-8 text-blue-500" />
        </div>
      </div>

      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700 shadow-sm`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Success Rate</p>
            <p className="text-2xl font-bold">{tradingMetrics.successRate}%</p>
          </div>
          <Activity className="w-8 h-8 text-purple-500" />
        </div>
      </div>

      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700 shadow-sm`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Active Trades</p>
            <p className="text-2xl font-bold">{tradingMetrics.activeTrades}</p>
          </div>
          <Zap className="w-8 h-8 text-orange-500" />
        </div>
      </div>
    </div>
  );
}