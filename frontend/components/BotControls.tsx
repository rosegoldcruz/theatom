'use client';

import React, { useState } from 'react';
import { Play, Pause, RefreshCw, CheckCircle, Shield, Zap } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useArbitrageBot } from '@/hooks/useArbitrageBot';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { DEX_OPTIONS } from '@/constants/networks';
import { BotConfig } from '@/types';

interface BotControlsProps {
  className?: string;
}

export function BotControls({ className = '' }: BotControlsProps) {
  const { state } = useAppContext();
  const { isDark } = state;
  const { botStatus, botConfig, systemStatus, startBot, stopBot, pauseBot, updateConfig } = useArbitrageBot();
  
  const [localConfig, setLocalConfig] = useState<BotConfig>(botConfig);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleConfigChange = (field: keyof BotConfig, value: any) => {
    setLocalConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleDEXToggle = (dex: string, checked: boolean) => {
    const newDEXs = checked 
      ? [...localConfig.enabledDEXs, dex]
      : localConfig.enabledDEXs.filter(d => d !== dex);
    
    handleConfigChange('enabledDEXs', newDEXs);
  };

  const handleSaveConfig = async () => {
    setIsUpdating(true);
    try {
      await updateConfig(localConfig);
    } catch (error) {
      console.error('Failed to update config:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-500';
      case 'paused': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'running': return 'border-green-500 bg-green-50 text-green-700';
      case 'paused': return 'border-yellow-500 bg-yellow-50 text-yellow-700';
      case 'error': return 'border-red-500 bg-red-50 text-red-700';
      default: return 'border-gray-500 bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Controls */}
        <div className="lg:col-span-2">
          <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle>Bot Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Control Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={botStatus.status === 'running' ? stopBot : startBot}
                  className={`p-4 h-auto flex-col space-y-2 border-2 transition-all ${
                    botStatus.status === 'running' 
                      ? getStatusBgColor('error')
                      : getStatusBgColor('running')
                  }`}
                  variant="outline"
                >
                  {botStatus.status === 'running' ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8" />
                  )}
                  <span className="font-medium">
                    {botStatus.status === 'running' ? 'Stop Bot' : 'Start Bot'}
                  </span>
                </Button>

                <Button
                  onClick={pauseBot}
                  className={`p-4 h-auto flex-col space-y-2 border-2 ${getStatusBgColor('paused')}`}
                  variant="outline"
                >
                  <Pause className="w-8 h-8" />
                  <span className="font-medium">Pause Bot</span>
                </Button>

                <Button
                  onClick={() => {
                    stopBot().then(() => startBot());
                  }}
                  className="p-4 h-auto flex-col space-y-2 border-2 border-blue-500 bg-blue-50 text-blue-700"
                  variant="outline"
                >
                  <RefreshCw className="w-8 h-8" />
                  <span className="font-medium">Restart Bot</span>
                </Button>
              </div>

              {/* Configuration */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Maximum Flash Loan Amount
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={localConfig.maxFlashLoanAmount}
                      onChange={(e) => handleConfigChange('maxFlashLoanAmount', Number(e.target.value))}
                      className={`pr-16 ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}
                    />
                    <span className={`absolute right-3 top-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      USDC
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Minimum Profit Threshold
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      value={localConfig.minProfitThreshold}
                      onChange={(e) => handleConfigChange('minProfitThreshold', Number(e.target.value))}
                      className={`pr-16 ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}
                    />
                    <span className={`absolute right-3 top-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      USD
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Max Gas Price
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={localConfig.maxGasPrice}
                      onChange={(e) => handleConfigChange('maxGasPrice', Number(e.target.value))}
                      className={`pr-16 ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}
                    />
                    <span className={`absolute right-3 top-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      gwei
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Enabled DEXs
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {DEX_OPTIONS.map(dex => (
                      <label key={dex} className="flex items-center space-x-2">
                        <Checkbox
                          checked={localConfig.enabledDEXs.includes(dex)}
                          onCheckedChange={(checked) => handleDEXToggle(dex, checked as boolean)}
                        />
                        <span className="text-sm">{dex}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleSaveConfig}
                  disabled={isUpdating}
                  className="w-full"
                >
                  {isUpdating ? 'Updating...' : 'Save Configuration'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Panel */}
        <div>
          <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Bot Status
                </span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    botStatus.status === 'running' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <span className={`capitalize text-sm ${getStatusColor(botStatus.status)}`}>
                    {botStatus.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Network
                </span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    systemStatus.network === 'connected' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm capitalize">{systemStatus.network}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  AAVE Flash Loans
                </span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className={`w-4 h-4 ${
                    systemStatus.aaveFlashLoans === 'available' ? 'text-green-500' : 'text-red-500'
                  }`} />
                  <span className="text-sm capitalize">{systemStatus.aaveFlashLoans}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  MEV Protection
                </span>
                <div className="flex items-center space-x-2">
                  <Shield className={`w-4 h-4 ${
                    systemStatus.mevProtection === 'active' ? 'text-blue-500' : 'text-gray-500'
                  }`} />
                  <span className="text-sm capitalize">{systemStatus.mevProtection}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Gas Optimization
                </span>
                <div className="flex items-center space-x-2">
                  <Zap className={`w-4 h-4 ${
                    systemStatus.gasOptimization === 'enabled' ? 'text-orange-500' : 'text-gray-500'
                  }`} />
                  <span className="text-sm capitalize">{systemStatus.gasOptimization}</span>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className={`mt-6 pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h4 className="font-medium mb-3">Performance</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Uptime</span>
                    <span>{Math.floor(botStatus.uptime / 3600)}h {Math.floor((botStatus.uptime % 3600) / 60)}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Scan Frequency</span>
                    <span>{botStatus.performance.scanFrequency}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Execution Speed</span>
                    <span>{botStatus.performance.executionSpeed}ms avg</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
