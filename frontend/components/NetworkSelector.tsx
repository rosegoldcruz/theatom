'use client';

import React from 'react';
import { ChevronDown, Wifi, WifiOff } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useAccount } from 'wagmi';
import { NETWORKS } from '@/constants/networks';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface NetworkSelectorProps {
  className?: string;
  variant?: 'dropdown' | 'card';
}

export function NetworkSelector({ className = '', variant = 'dropdown' }: NetworkSelectorProps) {
  const { state, actions } = useAppContext();
  const { selectedNetwork, isDark } = state;
  const { isConnecting } = useAccount();

  const handleNetworkChange = async (networkId: string) => {
    try {
      actions.setNetwork(networkId);
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  if (variant === 'dropdown') {
    return (
      <Select value={selectedNetwork} onValueChange={handleNetworkChange}>
        <SelectTrigger className={`w-40 ${isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'} ${className}`}>
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
                <Badge variant="outline" className="ml-2 text-xs">
                  {network.gasPrice}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Network Configuration</span>
          <Wifi className="w-4 h-4 text-green-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(NETWORKS).map(([key, network]) => {
          const isSelected = selectedNetwork === key;
          
          return (
            <div 
              key={key} 
              className={`
                flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all
                ${isSelected 
                  ? `border-blue-500 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}` 
                  : `${isDark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'}`
                }
              `}
              onClick={() => handleNetworkChange(key)}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 ${network.color} rounded-full`}></div>
                <div>
                  <div className="font-medium">{network.name}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {network.rpc}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{network.gasPrice}</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Gas Price
                </div>
              </div>
            </div>
          );
        })}

        {/* Network Status */}
        <div className={`mt-6 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h4 className="font-medium mb-3">Connection Status</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Wallet
              </span>
              <Badge variant="default">
                Connected
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Network
              </span>
              <Badge variant="default">
                {NETWORKS[selectedNetwork]?.name || 'Unknown'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Chain ID
              </span>
              <span className="text-sm font-mono">
                {NETWORKS[selectedNetwork]?.chainId || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
