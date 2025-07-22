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

      // DEMO MODE - Use mock data
      const mockStats: DashboardStats = {
        overview: {
          total_trades: 1247,
          successful_trades: 1059,
          total_profit: 12.5678,
          success_rate: 84.9,
          avg_profit_per_trade: 0.0101,
          total_gas_used: 187500000,
          avg_gas_per_trade: 150000
        },
        profit_by_token: [
          { token_in: 'WETH', total_profit: 8.1234, trade_count: 750, avg_profit: 0.0108 },
          { token_in: 'USDC', total_profit: 3.2456, trade_count: 350, avg_profit: 0.0093 },
          { token_in: 'WBTC', total_profit: 1.1988, trade_count: 147, avg_profit: 0.0082 }
        ],
        profit_by_dex: [
          { dex_path: 'Uniswap V2 → Balancer', total_profit: 5.6789, trade_count: 500, avg_profit: 0.0114, success_rate: 88.2 },
          { dex_path: 'Uniswap V3 → Curve', total_profit: 4.2345, trade_count: 400, avg_profit: 0.0106, success_rate: 85.5 },
          { dex_path: 'Balancer → Uniswap V2', total_profit: 2.6544, trade_count: 347, avg_profit: 0.0076, success_rate: 82.1 }
        ],
        daily_summary: [
          { date: '2024-07-14', total_profit: 0.8567, trade_count: 85, success_count: 72, avg_profit: 0.0101 },
          { date: '2024-07-13', total_profit: 0.7234, trade_count: 78, success_count: 66, avg_profit: 0.0093 },
          { date: '2024-07-12', total_profit: 0.9123, trade_count: 92, success_count: 79, avg_profit: 0.0099 },
          { date: '2024-07-11', total_profit: 0.6789, trade_count: 71, success_count: 60, avg_profit: 0.0096 },
          { date: '2024-07-10', total_profit: 0.8901, trade_count: 89, success_count: 76, avg_profit: 0.0100 }
        ],
        recent_activity: [
          { activity_type: 'trade', activity_id: '1', description: 'Successful arbitrage: WETH/USDC', value: 0.0125, status: 'success', timestamp: new Date().toISOString(), metadata: { gas_used: 145000 } },
          { activity_type: 'opportunity', activity_id: '2', description: 'Opportunity detected: WBTC/WETH', value: 0.0089, status: 'detected', timestamp: new Date(Date.now() - 30000).toISOString(), metadata: { profit_basis_points: 89 } },
          { activity_type: 'trade', activity_id: '3', description: 'Arbitrage executed: USDC/WETH', value: 0.0067, status: 'success', timestamp: new Date(Date.now() - 120000).toISOString(), metadata: { gas_used: 152000 } }
        ]
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStats(mockStats);
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
