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

      const response = await axios.get('/api/bot/control');
      
      if (response.data.success) {
        setBotStatus(response.data.data);
      } else {
        setError(response.data.error || 'Failed to fetch bot status');
      }
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
