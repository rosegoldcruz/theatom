'use client';

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { 
  Play, Pause, RefreshCw, CheckCircle, Shield, Zap 
} from 'lucide-react';

export function BotControlPage() {
  const { state, actions } = useAppContext();
  const { isDark, botStatus } = state;

  const toggleBot = () => {
    const newStatus = botStatus === 'running' ? 'stopped' : 'running';
    actions.setBotStatus(newStatus);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Controls */}
        <div className={`lg:col-span-2 p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700 shadow-sm`}>
          <h3 className="text-xl font-semibold mb-6">Bot Controls</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button 
              onClick={toggleBot}
              className={`p-4 rounded-lg border-2 transition-all ${
                botStatus === 'running' 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
                  : 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                {botStatus === 'running' ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                <span className="font-medium">{botStatus === 'running' ? 'Stop Bot' : 'Start Bot'}</span>
              </div>
            </button>

            <button className="p-4 rounded-lg border-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400">
              <div className="flex flex-col items-center space-y-2">
                <Pause className="w-8 h-8" />
                <span className="font-medium">Pause Bot</span>
              </div>
            </button>

            <button className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
              <div className="flex flex-col items-center space-y-2">
                <RefreshCw className="w-8 h-8" />
                <span className="font-medium">Restart Bot</span>
              </div>
            </button>
          </div>

          {/* Configuration */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Maximum Flash Loan Amount</label>
              <div className="relative">
                <input 
                  type="number" 
                  defaultValue="1000000"
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-300 bg-white'
                  }`}
                />
                <span className="absolute right-3 top-3 text-gray-500">USDC</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Minimum Profit Threshold</label>
              <div className="relative">
                <input 
                  type="number" 
                  defaultValue="50"
                  step="0.01"
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-300 bg-white'
                  }`}
                />
                <span className="absolute right-3 top-3 text-gray-500">USD</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Gas Price</label>
              <div className="relative">
                <input 
                  type="number" 
                  defaultValue="50"
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-300 bg-white'
                  }`}
                />
                <span className="absolute right-3 top-3 text-gray-500">gwei</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Enabled DEXs</label>
              <div className="grid grid-cols-2 gap-3">
                {['Uniswap V2', 'Uniswap V3', 'Sushiswap', 'Balancer', 'Curve', '1inch'].map(dex => (
                  <label key={dex} className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>{dex}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Status Panel */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700 shadow-sm`}>
          <h3 className="text-lg font-semibold mb-6">System Status</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Bot Status</span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  botStatus === 'running' ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                <span className="capitalize text-sm">{botStatus}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500">Network</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Connected</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500">AAVE Flash Loans</span>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Available</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500">MEV Protection</span>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Active</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500">Gas Optimization</span>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-orange-500" />
                <span className="text-sm">Enabled</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-medium mb-3">Performance</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Uptime</span>
                <span>99.7%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Scan Frequency</span>
                <span>0.5s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Execution Speed</span>
                <span>12ms avg</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}