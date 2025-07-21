'use client';

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useConnect } from 'wagmi';
import {
  Menu, ChevronDown, Wallet, Copy, Sun, Moon,
  Network, CheckCircle
} from 'lucide-react';

export function Header() {
  const { state, actions } = useAppContext();
  const { currentPage, isDark, isMobile, selectedNetwork, isWalletConnected, walletAddress, botStatus } = state;
  const { connect, connectors } = useConnect();

  const handleConnect = () => {
    if (connectors[0]) {
      connect({ connector: connectors[0] });
    }
  };

  const networks = {
    ethereum: { name: 'Ethereum', color: 'bg-blue-500', gasPrice: '23 gwei' },
    polygon: { name: 'Polygon', color: 'bg-purple-500', gasPrice: '32 gwei' },
    arbitrum: { name: 'Arbitrum', color: 'bg-blue-600', gasPrice: '0.1 gwei' },
    optimism: { name: 'Optimism', color: 'bg-red-500', gasPrice: '0.001 gwei' }
  };

  const themes = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    pink: 'bg-pink-500'
  };

  return (
    <header className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 shadow-sm`}>
      <div className="flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center space-x-4">
          {isMobile && (
            <button 
              onClick={actions.toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
          
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold capitalize">{currentPage.replace(/([A-Z])/g, ' $1').trim()}</h2>
            
            {/* Live Status Indicator */}
            {botStatus === 'running' && (
              <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live Trading</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Network Selector */}
          <div className="relative">
            <button className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
              isDark 
                ? 'border-gray-600 bg-gray-800 hover:bg-gray-700' 
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}>
              <div className={`w-3 h-3 ${networks[selectedNetwork as keyof typeof networks].color} rounded-full`}></div>
              <span className="text-sm font-medium">{networks[selectedNetwork as keyof typeof networks].name}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Wallet Connection */}
          {isWalletConnected ? (
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              isDark ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <Wallet className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-sm font-medium">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
              <button 
                onClick={() => navigator.clipboard.writeText(walletAddress)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleConnect}
              className={`${themes[state.theme]} text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium`}
            >
              Connect Wallet
            </button>
          )}

          {/* Theme Toggle */}
          <button 
            onClick={actions.toggleDarkMode}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            }`}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}