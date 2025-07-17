'use client';

import React from 'react';
import { Menu, Sun, Moon, Wallet, Copy, ChevronDown } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useWeb3 } from '@/hooks/useWeb3';
import { NETWORKS, THEME_COLORS } from '@/constants/networks';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface HeaderProps {
  className?: string;
}

export function Header({ className = '' }: HeaderProps) {
  const { state, actions } = useAppContext();
  const { currentPage, theme, isDark, selectedNetwork, isMobile } = state;
  const { isConnected, address, connect, disconnect } = useWeb3();

  const handleNetworkChange = (networkId: string) => {
    actions.setNetwork(networkId);
  };

  const handleWalletConnect = async () => {
    if (isConnected) {
      disconnect();
      actions.disconnectWallet();
    } else {
      try {
        await connect();
        if (address) {
          actions.connectWallet(address);
        }
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const headerClasses = `
    ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} 
    border-b px-6 py-4 ${className}
  `.trim();

  return (
    <header className={headerClasses}>
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={actions.toggleSidebar}
            >
              <Menu className="w-6 h-6" />
            </Button>
          )}
          
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold capitalize">{currentPage}</h2>
            
            {/* Live Indicator - only show when bot is running */}
            <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live</span>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Network Selector */}
          <Select value={selectedNetwork} onValueChange={handleNetworkChange}>
            <SelectTrigger className={`w-40 ${isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'}`}>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 ${NETWORKS[selectedNetwork]?.color || 'bg-gray-500'} rounded-full`}></div>
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(NETWORKS).map(([key, network]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 ${network.color} rounded-full`}></div>
                    <span>{network.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Wallet Connection */}
          {isConnected && address ? (
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <Wallet className="w-4 h-4 text-green-500" />
              <span className="text-sm">{formatAddress(address)}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={copyAddress}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <Button 
              onClick={handleWalletConnect}
              className={`${THEME_COLORS[theme]} text-white hover:opacity-90`}
            >
              Connect Wallet
            </Button>
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={actions.toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
