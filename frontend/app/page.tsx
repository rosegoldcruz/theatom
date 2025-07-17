'use client';

import React, { useState, useEffect } from 'react';
import {
  Play, Pause, Settings, TrendingUp, DollarSign, Zap, Activity,
  Wallet, ChevronDown, Moon, Sun, BarChart3, CheckCircle,
  Copy, Menu, Home, Bot, History, LogOut
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

  const networks: { [key: string]: { name: string; rpc: string; color: string; gasPrice: string } } = {
    ethereum: { name: 'Ethereum', rpc: 'Mainnet', color: 'bg-blue-500', gasPrice: '23 gwei' },
    polygon: { name: 'Polygon', rpc: 'Mainnet', color: 'bg-purple-500', gasPrice: '32 gwei' },
    arbitrum: { name: 'Arbitrum', rpc: 'One', color: 'bg-blue-600', gasPrice: '0.1 gwei' },
    optimism: { name: 'Optimism', rpc: 'Mainnet', color: 'bg-red-500', gasPrice: '0.001 gwei' }
  };

  const themes: { [key: string]: string } = {
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

  // Simple placeholder pages for other sections
  const BotControlPage = () => <div className="p-6"><h2 className="text-2xl font-bold">Bot Control</h2><p>Bot control interface coming soon...</p></div>;
  const OpportunitiesPage = () => <div className="p-6"><h2 className="text-2xl font-bold">Opportunities</h2><p>Live opportunities feed coming soon...</p></div>;
  const AnalyticsPage = () => <div className="p-6"><h2 className="text-2xl font-bold">Analytics</h2><p>Advanced analytics coming soon...</p></div>;
  const HistoryPage = () => <div className="p-6"><h2 className="text-2xl font-bold">Trade History</h2><p>Trade history coming soon...</p></div>;
  const SettingsPage = () => <div className="p-6"><h2 className="text-2xl font-bold">Settings</h2><p>Settings panel coming soon...</p></div>;

  const pages: { [key: string]: React.ReactElement } = {
    dashboard: <DashboardPage />,
    bot: <BotControlPage />,
    opportunities: <OpportunitiesPage />,
    analytics: <AnalyticsPage />,
    history: <HistoryPage />,
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


