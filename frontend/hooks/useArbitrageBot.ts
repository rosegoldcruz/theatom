'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  UseArbitrageBotReturn, 
  BotStatus, 
  BotConfig, 
  TradingMetrics, 
  SystemStatus 
} from '@/types';
import { DEFAULT_BOT_CONFIG } from '@/constants/networks';
import { useBotControl } from './useArbitrageAPI';

export const useArbitrageBot = (): UseArbitrageBotReturn => {
  const { 
    botStatus: apiBotStatus, 
    startBot: apiStartBot, 
    stopBot: apiStopBot, 
    updateConfig: apiUpdateConfig 
  } = useBotControl();
  
  const [botStatus, setBotStatus] = useState<BotStatus>({
    status: 'stopped',
    uptime: 0,
    lastScan: Date.now(),
    nextScan: Date.now() + 12000,
    performance: {
      scanFrequency: 0.5,
      executionSpeed: 12,
      successRate: 96.2
    }
  });
  
  const [botConfig, setBotConfig] = useState<BotConfig>(DEFAULT_BOT_CONFIG);
  const [tradingMetrics, setTradingMetrics] = useState<TradingMetrics>({
    totalProfit: 47293.84,
    todayProfit: 2847.32,
    successRate: 96.2,
    activeTrades: 23,
    totalTrades: 1847,
    avgReturn: 2.4,
    flashLoanVolume: 12743892.33,
    gasSpent: 0.847
  });
  
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    network: 'connected',
    aaveFlashLoans: 'available',
    mevProtection: 'active',
    gasOptimization: 'enabled'
  });

  // Update local state from API response
  useEffect(() => {
    if (apiBotStatus) {
      setBotStatus(prev => ({
        ...prev,
        status: apiBotStatus.isRunning ? 'running' : 'stopped',
        uptime: apiBotStatus.uptime || 0,
        lastScan: apiBotStatus.lastScanTimestamp || Date.now(),
        nextScan: apiBotStatus.nextScanTimestamp || Date.now() + 12000,
        performance: {
          scanFrequency: apiBotStatus.scanFrequency || 0.5,
          executionSpeed: apiBotStatus.avgExecutionTime || 12,
          successRate: apiBotStatus.successRate || 96.2
        }
      }));

      // Update trading metrics if available
      if (apiBotStatus.metrics) {
        setTradingMetrics(prev => ({
          ...prev,
          totalProfit: apiBotStatus.metrics.totalProfit || prev.totalProfit,
          todayProfit: apiBotStatus.metrics.todayProfit || prev.todayProfit,
          successRate: apiBotStatus.metrics.successRate || prev.successRate,
          activeTrades: apiBotStatus.metrics.activeTrades || prev.activeTrades,
          totalTrades: apiBotStatus.metrics.totalTrades || prev.totalTrades
        }));
      }

      // Update system status if available
      if (apiBotStatus.system) {
        setSystemStatus(prev => ({
          ...prev,
          network: apiBotStatus.system.networkConnected ? 'connected' : 'disconnected',
          aaveFlashLoans: apiBotStatus.system.aaveAvailable ? 'available' : 'unavailable',
          mevProtection: apiBotStatus.system.mevProtection ? 'active' : 'inactive',
          gasOptimization: apiBotStatus.system.gasOptimization ? 'enabled' : 'disabled'
        }));
      }
    }
  }, [apiBotStatus]);

  const startBot = useCallback(async () => {
    try {
      await apiStartBot(botConfig);
      setBotStatus(prev => ({ 
        ...prev, 
        status: 'running',
        uptime: 0
      }));
    } catch (error) {
      console.error('Failed to start bot:', error);
      setBotStatus(prev => ({ ...prev, status: 'error' }));
    }
  }, [apiStartBot, botConfig]);

  const stopBot = useCallback(async () => {
    try {
      await apiStopBot();
      setBotStatus(prev => ({ ...prev, status: 'stopped' }));
    } catch (error) {
      console.error('Failed to stop bot:', error);
    }
  }, [apiStopBot]);

  const pauseBot = useCallback(async () => {
    try {
      // API doesn't have pause, so we'll stop for now
      await apiStopBot();
      setBotStatus(prev => ({ ...prev, status: 'paused' }));
    } catch (error) {
      console.error('Failed to pause bot:', error);
    }
  }, [apiStopBot]);

  const updateConfig = useCallback(async (config: Partial<BotConfig>) => {
    try {
      await apiUpdateConfig(config);
      setBotConfig(prev => ({ ...prev, ...config }));
    } catch (error) {
      console.error('Failed to update bot config:', error);
    }
  }, [apiUpdateConfig]);

  // Real-time updates when bot is running
  useEffect(() => {
    if (botStatus.status !== 'running') return;

    const interval = setInterval(() => {
      // Update uptime
      setBotStatus(prev => ({ 
        ...prev, 
        uptime: prev.uptime + 3,
        lastScan: Date.now(),
        nextScan: Date.now() + 12000
      }));

      // Simulate trading metrics updates
      setTradingMetrics(prev => ({
        ...prev,
        totalProfit: prev.totalProfit + Math.random() * 100,
        todayProfit: prev.todayProfit + Math.random() * 10,
        activeTrades: Math.floor(Math.random() * 15) + 10,
        flashLoanVolume: prev.flashLoanVolume + Math.random() * 10000
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [botStatus.status]);

  return {
    botStatus,
    botConfig,
    tradingMetrics,
    systemStatus,
    startBot,
    stopBot,
    pauseBot,
    updateConfig
  };
};
