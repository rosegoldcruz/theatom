'use client';

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';

export function SettingsPage() {
  const { state, actions } = useAppContext();
  const { isDark, theme, showBalance } = state;

  const themes = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    pink: 'bg-pink-500'
  };

  const networks = {
    ethereum: { name: 'Ethereum', rpc: 'Mainnet', color: 'bg-blue-500', gasPrice: '23 gwei' },
    polygon: { name: 'Polygon', rpc: 'Mainnet', color: 'bg-purple-500', gasPrice: '32 gwei' },
    arbitrum: { name: 'Arbitrum', rpc: 'One', color: 'bg-blue-600', gasPrice: '0.1 gwei' },
    optimism: { name: 'Optimism', rpc: 'Mainnet', color: 'bg-red-500', gasPrice: '0.001 gwei' }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Theme Customization */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700 shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4">Theme Customization</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Color Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(themes).map(([name, color]) => (
                  <button
                    key={name}
                    onClick={() => actions.setTheme(name as any)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      theme === name ? 'border-gray-400' : 'border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className={`w-full h-6 ${color} rounded mb-2`}></div>
                    <div className="text-xs capitalize">{name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span>Dark Mode</span>
              <button
                onClick={actions.toggleDarkMode}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  isDark ? themes[theme] : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  isDark ? 'translate-x-6' : 'translate-x-0.5'
                }`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span>Show Balance</span>
              <button
                onClick={actions.toggleBalanceVisibility}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  showBalance ? themes[theme] : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  showBalance ? 'translate-x-6' : 'translate-x-0.5'
                }`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Network Settings */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700 shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4">Network Configuration</h3>
          
          <div className="space-y-4">
            {Object.entries(networks).map(([key, network]) => (
              <div key={key} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 ${network.color} rounded-full`}></div>
                  <div>
                    <div className="font-medium">{network.name}</div>
                    <div className="text-sm text-gray-500">{network.rpc}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">{network.gasPrice}</div>
                  <div className="text-xs text-gray-500">Gas Price</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}