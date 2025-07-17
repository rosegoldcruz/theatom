import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface BotStatus {
  contract: {
    address: string;
    paused: boolean;
    config: {
      minProfitBasisPoints: string;
      maxSlippageBasisPoints: string;
      maxGasPrice: string;
      totalTrades: string;
      successfulTrades: string;
      totalProfit: string;
      totalGasUsed: string;
    };
  };
  bots: Array<{
    id: string;
    config_id: string;
    status: 'running' | 'stopped' | 'paused' | 'error';
    last_scan_at: string;
    opportunities_found: number;
    trades_executed: number;
    total_profit: number;
    uptime_seconds: number;
    error_message?: string;
    metadata: any;
    updated_at: string;
    arbitrage_config: {
      id: string;
      name: string;
      user_id: string;
      is_active: boolean;
    };
  }>;
  recentLogs: Array<{
    id: string;
    level: string;
    component: string;
    message: string;
    details: any;
    created_at: string;
  }>;
}

export const useBotControl = () => {
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBotStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // DEMO MODE - Use mock data
      const mockBotStatus: BotStatus = {
        contract: {
          address: '0xb3800E6bC7847E5d5a71a03887EDc5829DF4133b',
          paused: false,
          config: {
            minProfitBasisPoints: '50',
            maxSlippageBasisPoints: '300',
            maxGasPrice: '50.0',
            totalTrades: '1247',
            successfulTrades: '1059',
            totalProfit: '12.5678',
            totalGasUsed: '187500000'
          }
        },
        bots: [
          {
            id: 'bot-1',
            config_id: 'config-1',
            status: 'running',
            last_scan_at: new Date().toISOString(),
            opportunities_found: 156,
            trades_executed: 89,
            total_profit: 8.1234,
            uptime_seconds: 86400,
            metadata: {},
            updated_at: new Date().toISOString(),
            arbitrage_config: {
              id: 'config-1',
              name: 'High Frequency Strategy',
              user_id: 'user-1',
              is_active: true
            }
          },
          {
            id: 'bot-2',
            config_id: 'config-2',
            status: 'running',
            last_scan_at: new Date(Date.now() - 30000).toISOString(),
            opportunities_found: 89,
            trades_executed: 52,
            total_profit: 4.4444,
            uptime_seconds: 43200,
            metadata: {},
            updated_at: new Date().toISOString(),
            arbitrage_config: {
              id: 'config-2',
              name: 'Conservative Strategy',
              user_id: 'user-1',
              is_active: true
            }
          }
        ],
        recentLogs: [
          { id: '1', level: 'info', component: 'orchestrator', message: 'Opportunity detected and executed', details: {}, created_at: new Date().toISOString() },
          { id: '2', level: 'info', component: 'scanner', message: 'Price spread found: 0.89%', details: {}, created_at: new Date(Date.now() - 60000).toISOString() },
          { id: '3', level: 'warn', component: 'executor', message: 'High gas price detected', details: {}, created_at: new Date(Date.now() - 120000).toISOString() }
        ]
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      setBotStatus(mockBotStatus);
    } catch (err: any) {
      console.error('Bot status error:', err);
      setError(err.response?.data?.error || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBotStatus();
  }, [fetchBotStatus]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchBotStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchBotStatus]);

  const startBot = useCallback(async (configId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await axios.post('/api/bot/control', {
        action: 'start',
        configId
      });

      if (response.data.success) {
        await fetchBotStatus(); // Refresh status
        return { success: true };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (err: any) {
      console.error('Start bot error:', err);
      return { success: false, error: err.response?.data?.error || 'Network error occurred' };
    }
  }, [fetchBotStatus]);

  const stopBot = useCallback(async (configId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await axios.post('/api/bot/control', {
        action: 'stop',
        configId
      });

      if (response.data.success) {
        await fetchBotStatus(); // Refresh status
        return { success: true };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (err: any) {
      console.error('Stop bot error:', err);
      return { success: false, error: err.response?.data?.error || 'Network error occurred' };
    }
  }, [fetchBotStatus]);

  const pauseContract = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await axios.post('/api/bot/control', {
        action: 'pause_contract'
      });

      if (response.data.success) {
        await fetchBotStatus(); // Refresh status
        return { success: true };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (err: any) {
      console.error('Pause contract error:', err);
      return { success: false, error: err.response?.data?.error || 'Network error occurred' };
    }
  }, [fetchBotStatus]);

  const unpauseContract = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await axios.post('/api/bot/control', {
        action: 'unpause_contract'
      });

      if (response.data.success) {
        await fetchBotStatus(); // Refresh status
        return { success: true };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (err: any) {
      console.error('Unpause contract error:', err);
      return { success: false, error: err.response?.data?.error || 'Network error occurred' };
    }
  }, [fetchBotStatus]);

  const updateContractConfig = useCallback(async (config: {
    minProfitBasisPoints: number;
    maxSlippageBasisPoints: number;
    maxGasPriceGwei: number;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await axios.post('/api/bot/control', {
        action: 'update_contract_config',
        contractConfig: config
      });

      if (response.data.success) {
        await fetchBotStatus(); // Refresh status
        return { success: true };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (err: any) {
      console.error('Update contract config error:', err);
      return { success: false, error: err.response?.data?.error || 'Network error occurred' };
    }
  }, [fetchBotStatus]);

  return {
    botStatus,
    loading,
    error,
    refreshBotStatus: fetchBotStatus,
    startBot,
    stopBot,
    pauseContract,
    unpauseContract,
    updateContractConfig
  };
};
