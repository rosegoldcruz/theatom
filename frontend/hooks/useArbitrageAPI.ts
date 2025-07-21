import { useState, useEffect, useCallback } from 'react';
import { arbitrageApi, opportunitiesApi, botApi } from '../lib/api';

// Hook for arbitrage system status
export const useArbitrageStatus = () => {
  interface ArbitrageStatus {
    // define the expected properties, e.g.:
    running: boolean;
    lastChecked: number;
    [key: string]: any;
  }
  const [status, setStatus] = useState<ArbitrageStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await arbitrageApi.getStatus();
      
      if (response.success) {
        setStatus(response.data);
      } else {
        setError(response.error || 'Failed to fetch status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    
    // Refresh status every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  interface ArbitrageResult {
    // define the expected properties, e.g.:
    txHash?: string;
    profit?: number;
    [key: string]: any;
  }
  const [lastResult, setLastResult] = useState<ArbitrageResult | null>(null);
};

// Hook for executing arbitrage trades
export const useArbitrageExecution = () => {
  const [executing, setExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const executeArbitrage = useCallback(async (params: {
    token: string;
    amount: number;
    slippage?: number;
    gasLimit?: number;
  }) => {
    try {
      setExecuting(true);
      setError(null);
      
      const response = await arbitrageApi.executeArbitrage(params);
      
      if (response.success) {
        setLastResult(response.data);
        return response.data;
      } else {
        const errorMsg = response.error || 'Failed to execute arbitrage';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      throw err;
    } finally {
      setExecuting(false);
    }
  }, []);

  const simulateTrade = useCallback(async (params: {
    token: string;
    amount: number;
    slippage?: number;
  }) => {
    try {
      const response = await arbitrageApi.simulate(params);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to simulate trade');
      }
    } catch (err) {
      throw err;
    }
  }, []);

  return {
    executing,
    lastResult,
    error,
    executeArbitrage,
    simulateTrade
  };
};

// Hook for arbitrage opportunities
export const useOpportunities = (params?: {
  network?: string;
  minProfit?: number;
}) => {
  interface Opportunity {
    id: string;
    profit: number;
    [key: string]: any;
  }
  
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<number>(0);

  const fetchOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await opportunitiesApi.getAll();
      const data = await response.json();
      
      if (data.success) {
        setOpportunities(data.data?.opportunities || []);
        setLastScan(data.data?.scanTimestamp || Date.now());
      } else {
        setError(data.error || 'Failed to fetch opportunities');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [params]);

  const triggerScan = useCallback(async (scanParams?: {
    networks?: string[];
    pairs?: string[];
  }) => {
    try {
      const response = await fetch('/api/opportunities/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scanParams || {})
      });
      const data = await response.json();
      
      if (data.success) {
        setTimeout(fetchOpportunities, 2000);
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to trigger scan');
      }
    } catch (err) {
      throw err;
    }
  }, [fetchOpportunities]);

  useEffect(() => {
    fetchOpportunities();
    
    const interval = setInterval(fetchOpportunities, 15000);
    return () => clearInterval(interval);
  }, [fetchOpportunities]);

  return {
    opportunities,
    loading,
    error,
    lastScan,
    refetch: fetchOpportunities,
    triggerScan
  };
};

// Hook for bot control
export const useBotControl = () => {
  const [botStatus, setBotStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBotStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await botApi.getStatus();
      const data = await response.json();
      
      if (data.success) {
        setBotStatus(data.data);
      } else {
        setError(data.error || 'Failed to fetch bot status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const startBot = useCallback(async (config?: any) => {
    try {
      const response = await botApi.start();
      const data = await response.json();
      
      if (data.success) {
        await fetchBotStatus(); // Refresh status
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to start bot');
      }
    } catch (err) {
      throw err;
    }
  }, [fetchBotStatus]);

  const stopBot = useCallback(async () => {
    try {
      const response = await botApi.stop();
      const data = await response.json();

      if (data.success) {
        await fetchBotStatus(); // Refresh status
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to stop bot');
      }
    } catch (err) {
      throw err;
    }
  }, [fetchBotStatus]);

  const updateConfig = useCallback(async (config: any) => {
    try {
      const response = await botApi.updateConfig(config);
      const data = await response.json();

      if (data.success) {
        await fetchBotStatus(); // Refresh status
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to update config');
      }
    } catch (err) {
      throw err;
    }
  }, [fetchBotStatus]);

  useEffect(() => {
    fetchBotStatus();

    // Refresh bot status every 10 seconds
    const interval = setInterval(fetchBotStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchBotStatus]);

  return {
    botStatus,
    loading,
    error,
    startBot,
    stopBot,
    updateConfig,
    refetch: fetchBotStatus
  };
};

// Hook for trade history
export const useTradeHistory = (params?: {
  page?: number;
  limit?: number;
}) => {
  const [trades, setTrades] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await arbitrageApi.getStatus(); // Using available API method
      const data = await response.json();
      
      if (data.success) {
        setTrades(data.data?.trades || []);
        setPagination(data.data?.pagination);
      } else {
        setError(data.error || 'Failed to fetch trade history');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    trades,
    pagination,
    loading,
    error,
    refetch: fetchHistory
  };
};














