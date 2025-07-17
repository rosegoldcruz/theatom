'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, Settings, TrendingUp, DollarSign, Zap, Activity, 
  Wallet, Network, ChevronDown, Moon, Sun, Palette, Smartphone,
  BarChart3, ArrowUpRight, ArrowDownRight, AlertTriangle, CheckCircle,
  RefreshCw, Eye, EyeOff, Copy, ExternalLink, Menu, X, Home, Bot,
  LineChart, History, Layers, Shield, Bell, User, LogOut, Plus
} from 'lucide-react';

const ATOMArbitrageSystem = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [botStatus, setBotStatus] = useState('stopped'); // stopped, running, paused
  const [theme, setTheme] = useState('blue');
  const [isDark, setIsDark] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [showBalance, setShowBalance] = useState(true);

  // Mock real-time data
  const [tradingMetrics, setTradingMetrics] = useState({
    totalProfit: 47293.84,
    todayProfit: 2847.32,
    successRate: 96.2,
    activeTrades: 23,
    totalTrades: 1847,
    avgReturn: 2.4,
    flashLoanVolume: 12743892.33,
    gasSpent: 0.847
  });

  const [opportunities, setOpportunities] = useState([
    { id: 1, pair: 'USDC/DAI', dex1: 'Uniswap V3', dex2: 'Curve', spread: 0.34, profit: 847.32, gas: 0.024, status: 'executing' },
    { id: 2, pair: 'WETH/USDC', dex1: 'Balancer', dex2: 'Uniswap V2', spread: 0.89, profit: 2394.71, gas: 0.056, status: 'pending' },
    { id: 3, pair: 'WBTC/USDT', dex1: 'Curve', dex2: 'Sushiswap', spread: 1.23, profit: 5847.93, gas: 0.084, status: 'monitoring' },
    { id: 4, pair: 'LINK/USDC', dex1: 'Uniswap V2', dex2: 'Balancer', spread: 0.67, profit: 1247.84, gas: 0.032, status: 'monitoring' }
  ]);

  const networks = {
    ethereum: { name: 'Ethereum', rpc: 'Mainnet', color: 'bg-blue-500', gasPrice: '23 gwei' },
    polygon: { name: 'Polygon', rpc: 'Mainnet', color: 'bg-purple-500', gasPrice: '32 gwei' },
    arbitrum: { name: 'Arbitrum', rpc: 'One', color: 'bg-blue-600', gasPrice: '0.1 gwei' },
    optimism: { name: 'Optimism', rpc: 'Mainnet', color: 'bg-red-500', gasPrice: '0.001 gwei' }
  };

  const themes = {
    blue: 'bg-blue-500',
    green: 'bg-green-500', 
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    pink: 'bg-pink-500'
  };

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      if (botStatus === 'running') {
        setTradingMetrics(prev => ({
          ...prev,
          totalProfit: prev.totalProfit + Math.random() * 100,
          todayProfit: prev.todayProfit + Math.random() * 10,
          activeTrades: Math.floor(Math.random() * 15) + 10
        }));
        
        setOpportunities(prev => prev.map(opp => ({
          ...opp,
          spread: Math.max(0.1, opp.spread + (Math.random() - 0.5) * 0.2),
          profit: Math.max(100, opp.profit + (Math.random() - 0.5) * 200)
        })));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [botStatus]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const connectWallet = async () => {
    // Mock wallet connection
    setIsWalletConnected(true);
    setWalletAddress('0x742d35Cc6639C0532fCb18025C9c492E5A9534e1');
  };

  const toggleBot = () => {
    setBotStatus(prev => prev === 'running' ? 'stopped' : 'running');
  };

  // Navigation Component
  const Sidebar = () => (
    <div className={`${isMobile ? 'fixed inset-y-0 left-0 z-50 w-64' : 'w-64'} ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-r transition-transform duration-300 ${isMobile && !isSidebarOpen ? '-translate-x-full' : ''}`}>
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${themes[theme]} rounded-lg flex items-center justify-center`}>
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">ATOM</h1>
              <p className="text-sm text-gray-500">Arbitrage System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'dashboard', icon: Home, label: 'Dashboard' },
            { id: 'bot', icon: Bot, label: 'Bot Control' },
            { id: 'opportunities', icon: TrendingUp, label: 'Opportunities' },
            { id: 'analytics', icon: BarChart3, label: 'Analytics' },
            { id: 'history', icon: History, label: 'Trade History' },
            { id: 'settings', icon: Settings, label: 'Settings' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                currentPage === item.id 
                  ? `${themes[theme]} text-white` 
                  : `${isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">Trader</p>
              <p className="text-xs text-gray-500">Pro Account</p>
            </div>
          </div>
          <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Header Component
  const Header = () => (
    <header className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {isMobile && (
            <button onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
          )}
          <h2 className="text-2xl font-bold capitalize">{currentPage}</h2>
          {botStatus === 'running' && (
            <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Network Selector */}
          <div className="relative">
            <button className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'}`}>
              <div className={`w-3 h-3 ${networks[selectedNetwork].color} rounded-full`}></div>
              <span className="text-sm">{networks[selectedNetwork].name}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Wallet Connection */}
          {isWalletConnected ? (
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <Wallet className="w-4 h-4 text-green-500" />
              <span className="text-sm">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
              <button onClick={() => navigator.clipboard.writeText(walletAddress)}>
                <Copy className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={connectWallet} className={`${themes[theme]} text-white px-4 py-2 rounded-lg hover:opacity-90`}>
              Connect Wallet
            </button>
          )}

          {/* Theme Toggle */}
          <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-lg hover:bg-gray-100">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );

  // Dashboard Page
  const DashboardPage = () => (
    <div className="p-6 space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Profit</p>
              <p className="text-2xl font-bold text-green-500">
                ${showBalance ? tradingMetrics.totalProfit.toLocaleString() : '****'}
              </p>
              <p className="text-sm text-gray-500">+12.4% this month</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Profit</p>
              <p className="text-2xl font-bold text-blue-500">
                ${showBalance ? tradingMetrics.todayProfit.toFixed(2) : '****'}
              </p>
              <p className="text-sm text-gray-500">+{tradingMetrics.avgReturn}% avg return</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Success Rate</p>
              <p className="text-2xl font-bold">{tradingMetrics.successRate}%</p>
              <p className="text-sm text-gray-500">{tradingMetrics.totalTrades} total trades</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Trades</p>
              <p className="text-2xl font-bold">{tradingMetrics.activeTrades}</p>
              <p className="text-sm text-gray-500">Flash loan volume: ${tradingMetrics.flashLoanVolume.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bot Status Card */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Bot Status</h3>
            <button 
              onClick={toggleBot}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
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
              <span className={`font-medium ${
                botStatus === 'running' ? 'text-green-500' : 
                botStatus === 'paused' ? 'text-yellow-500' : 'text-gray-500'
              }`}>
                {botStatus.charAt(0).toUpperCase() + botStatus.slice(1)}
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
              <span>{networks[selectedNetwork].gasPrice}</span>
            </div>
          </div>
        </div>

        {/* Live Opportunities */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700`}>
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

  // Bot Control Page
  const BotControlPage = () => (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Controls */}
        <div className={`lg:col-span-2 p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700`}>
          <h3 className="text-xl font-semibold mb-6">Bot Controls</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button 
              onClick={toggleBot}
              className={`p-4 rounded-lg border-2 transition-all ${
                botStatus === 'running' 
                  ? 'border-red-500 bg-red-50 text-red-700' 
                  : 'border-green-500 bg-green-50 text-green-700'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                {botStatus === 'running' ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                <span className="font-medium">{botStatus === 'running' ? 'Stop Bot' : 'Start Bot'}</span>
              </div>
            </button>

            <button className="p-4 rounded-lg border-2 border-yellow-500 bg-yellow-50 text-yellow-700">
              <div className="flex flex-col items-center space-y-2">
                <Pause className="w-8 h-8" />
                <span className="font-medium">Pause Bot</span>
              </div>
            </button>

            <button className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50 text-blue-700">
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
                  className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}
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
                  className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}
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
                  className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}
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
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700`}>
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

  // Opportunities Page
  const OpportunitiesPage = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Live Opportunities</h2>
          <p className="text-gray-500">Real-time arbitrage opportunities across DEXs</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-500 font-medium">Live Data</span>
        </div>
      </div>

      <div className={`rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700 overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} border-b border-gray-200 dark:border-gray-600`}>
              <tr>
                <th className="text-left py-4 px-6 font-medium">Trading Pair</th>
                <th className="text-left py-4 px-6 font-medium">DEX Route</th>
                <th className="text-left py-4 px-6 font-medium">Spread</th>
                <th className="text-left py-4 px-6 font-medium">Est. Profit</th>
                <th className="text-left py-4 px-6 font-medium">Gas Cost</th>
                <th className="text-left py-4 px-6 font-medium">Status</th>
                <th className="text-left py-4 px-6 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map(opp => (
                <tr key={opp.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-4 px-6">
                    <div className="font-medium">{opp.pair}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <div>{opp.dex1}</div>
                      <div className="text-gray-500">→ {opp.dex2}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-green-500 font-semibold">
                      {opp.spread.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold">${opp.profit.toFixed(2)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-500">{opp.gas} ETH</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      opp.status === 'executing' ? 'bg-blue-100 text-blue-700' :
                      opp.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {opp.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button 
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        opp.status === 'executing' ? 'bg-gray-200 text-gray-500 cursor-not-allowed' :
                        'bg-green-500 text-white hover:bg-green-600'
                      }`}
                      disabled={opp.status === 'executing'}
                    >
                      {opp.status === 'executing' ? 'Executing...' : 'Execute'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Settings Page
  const SettingsPage = () => (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Theme Customization */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700`}>
          <h3 className="text-lg font-semibold mb-4">Theme Customization</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Color Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(themes).map(([name, color]) => (
                  <button
                    key={name}
                    onClick={() => setTheme(name)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      theme === name ? 'border-gray-400' : 'border-gray-200'
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
                onClick={() => setIsDark(!isDark)}
                className={`w-12 h-6 rounded-full transition-all ${
                  isDark ? themes[theme] : 'bg-gray-300'
                } relative`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  isDark ? 'translate-x-6' : 'translate-x-0.5'
                }`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span>Show Balance</span>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className={`w-12 h-6 rounded-full transition-all ${
                  showBalance ? themes[theme] : 'bg-gray-300'
                } relative`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  showBalance ? 'translate-x-6' : 'translate-x-0.5'
                }`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Network Settings */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700`}>
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

  const pages = {
    dashboard: <DashboardPage />,
    bot: <BotControlPage />,
    opportunities: <OpportunitiesPage />,
    analytics: <DashboardPage />,
    history: <DashboardPage />,
    settings: <SettingsPage />
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex">
        {!isMobile && <Sidebar />}
        
        <div className="flex-1">
          <Header />
          <main className="overflow-auto">
            {pages[currentPage] || pages.dashboard}
          </main>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsSidebarOpen(false)}>
          <Sidebar />
        </div>
      )}
    </div>
  );
};

export default function HomePage() {
  return <ATOMArbitrageSystem />;
}