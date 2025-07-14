import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface DashboardStats {
  overview: {
    total_trades: number;
    successful_trades: number;
    total_profit: number;
    success_rate: number;
    avg_profit_per_trade: number;
    total_gas_used: number;
    avg_gas_per_trade: number;
  };
  profit_by_token: Array<{
    token_in: string;
    total_profit: number;
    trade_count: number;
    avg_profit: number;
  }>;
  profit_by_dex: Array<{
    dex_path: string;
    total_profit: number;
    trade_count: number;
    avg_profit: number;
    success_rate: number;
  }>;
  daily_summary: Array<{
    date: string;
    total_profit: number;
    trade_count: number;
    success_count: number;
    avg_profit: number;
  }>;
  recent_activity: Array<{
    activity_type: string;
    activity_id: string;
    description: string;
    value: number;
    status: string;
    timestamp: string;
    metadata: any;
  }>;
}

export const useDashboardStats = (days: number = 30) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/api/dashboard/stats?days=${days}`);
      
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        setError(response.data.error || 'Failed to fetch dashboard stats');
      }
    } catch (err: any) {
      console.error('Dashboard stats error:', err);
      setError(err.response?.data?.error || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refreshStats: fetchStats
  };
};
