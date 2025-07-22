import { useState, useEffect, useCallback } from 'react';
import blockchainService, { RealArbitrageData, RealTradeData } from '../services/blockchainService';

export interface RealDashboardData {
  stats: RealArbitrageData;
  recentTrades: RealTradeData[];
  walletBalance: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;
}

export const useRealData = (walletAddress?: string) => {
  const [data, setData] = useState<RealDashboardData>({
    stats: {
      totalProfit: 0,
      activeOpportunities: 0,
      successRate: 0,
      contractBalance: 0,
      isContractActive: false,
      lastBlockNumber: 0,
      gasPrice: '0',
      networkStatus: 'disconnected'
    },
    recentTrades: [],
    walletBalance: 0,
    isLoading: true,
    error: null,
    lastUpdated: 0
  });

  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);

  const fetchAllData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      const [stats, recentTrades, walletBalance] = await Promise.all([
        blockchainService.getContractData(),
        blockchainService.getRecentTrades(20),
        walletAddress ? blockchainService.getWalletBalance(walletAddress) : Promise.resolve(0)
      ]);

      setData({
        stats,
        recentTrades,
        walletBalance,
        isLoading: false,
        error: null,
        lastUpdated: Date.now()
      });

      console.log('🔥 REAL DATA LOADED:', {
        totalProfit: stats.totalProfit,
        activeOpportunities: stats.activeOpportunities,
        contractBalance: stats.contractBalance,
        recentTradesCount: recentTrades.length,
        walletBalance
      });

    } catch (error) {
      console.error('❌ Error fetching real data:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch blockchain data'
      }));
    }
  }, [walletAddress]);

  const enableRealTimeUpdates = useCallback(() => {
    if (isRealTimeEnabled) return;

    setIsRealTimeEnabled(true);
    
    blockchainService.startEventListening((event) => {
      console.log('🚀 Real-time blockchain event:', event);
      
      if (event.type === 'trade_executed') {
        setData(prev => ({
          ...prev,
          recentTrades: [
            {
              txHash: event.data.txHash,
              timestamp: event.data.timestamp,
              tokenPair: event.data.token,
              profit: parseFloat(event.data.profit),
              gasUsed: 0,
              status: 'success',
              blockNumber: 0
            },
            ...prev.recentTrades.slice(0, 19)
          ],
          lastUpdated: Date.now()
        }));
      }
      
      if (event.type === 'opportunity_detected') {
        setData(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            activeOpportunities: prev.stats.activeOpportunities + 1
          },
          lastUpdated: Date.now()
        }));
      }
    });

    // Refresh data every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    
    return () => {
      clearInterval(interval);
      blockchainService.stopEventListening();
      setIsRealTimeEnabled(false);
    };
  }, [isRealTimeEnabled, fetchAllData]);

  const disableRealTimeUpdates = useCallback(() => {
    blockchainService.stopEventListening();
    setIsRealTimeEnabled(false);
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Auto-refresh every 2 minutes when not in real-time mode
  useEffect(() => {
    if (!isRealTimeEnabled) {
      const interval = setInterval(fetchAllData, 120000);
      return () => clearInterval(interval);
    }
  }, [isRealTimeEnabled, fetchAllData]);

  return {
    ...data,
    refreshData: fetchAllData,
    enableRealTimeUpdates,
    disableRealTimeUpdates,
    isRealTimeEnabled
  };
};

// Hook for individual network stats
export const useNetworkStats = (network: string) => {
  const [stats, setStats] = useState({
    blockNumber: 0,
    gasPrice: '0',
    networkLoad: 'Unknown',
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const fetchNetworkStats = async () => {
      try {
        const networkInfo = await blockchainService.getNetworkInfo();
        setStats({
          blockNumber: networkInfo.blockNumber,
          gasPrice: networkInfo.gasPrice,
          networkLoad: parseFloat(networkInfo.gasPrice) > 20 ? 'High' : 
                      parseFloat(networkInfo.gasPrice) > 10 ? 'Medium' : 'Low',
          isLoading: false,
          error: null
        });
      } catch (error) {
        setStats(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Network error'
        }));
      }
    };

    fetchNetworkStats();
    const interval = setInterval(fetchNetworkStats, 15000); // Update every 15 seconds
    
    return () => clearInterval(interval);
  }, [network]);

  return stats;
};

export default useRealData;
