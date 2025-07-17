import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface ArbitrageOpportunity {
  id: string;
  pair: string;
  exchange1: string;
  exchange2: string;
  price1: number;
  price2: number;
  profit_estimate: number;
  gas_cost: number;
  status: 'detected' | 'executing' | 'completed' | 'failed';
  created_at: string;
  tx_hash?: string;
  actual_profit?: number;
}

interface BotStats {
  totalProfit: number;
  successRate: number;
  activeOpportunities: number;
  totalTrades: number;
}

export const useArbitrageBot = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [stats, setStats] = useState<BotStats>({
    totalProfit: 0,
    successRate: 0,
    activeOpportunities: 0,
    totalTrades: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch real opportunities from database
  const fetchOpportunities = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('arbitrage_opportunities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setOpportunities(data || []);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    }
  }, []);

  // Calculate stats from real data
  const calculateStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('arbitrage_opportunities')
        .select('*');
      
      if (error) throw error;
      
      const totalProfit = data?.reduce((sum, opp) => sum + (opp.actual_profit || 0), 0) || 0;
      const completedTrades = data?.filter(opp => opp.status === 'completed').length || 0;
      const totalTrades = data?.length || 0;
      const successRate = totalTrades > 0 ? (completedTrades / totalTrades) * 100 : 0;
      const activeOpportunities = data?.filter(opp => opp.status === 'detected').length || 0;
      
      setStats({
        totalProfit,
        successRate,
        activeOpportunities,
        totalTrades
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  }, []);

  // Simulate real arbitrage detection
  const detectArbitrageOpportunities = useCallback(async () => {
    if (!isRunning) return;
    
    setIsLoading(true);
    try {
      // Simulate DEX price checking
      const pairs = ['ETH/USDC', 'BTC/USDT', 'UNI/ETH', 'LINK/USDC', 'AAVE/ETH'];
      const exchanges = ['Uniswap', 'SushiSwap', 'Curve', 'Balancer', 'PancakeSwap', '1inch'];
      
      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      const exchange1 = exchanges[Math.floor(Math.random() * exchanges.length)];
      let exchange2 = exchanges[Math.floor(Math.random() * exchanges.length)];
      while (exchange2 === exchange1) {
        exchange2 = exchanges[Math.floor(Math.random() * exchanges.length)];
      }
      
      const basePrice = Math.random() * 1000 + 100;
      const price1 = basePrice;
      const price2 = basePrice * (1 + (Math.random() * 0.03 - 0.015)); // ±1.5% difference
      const profitEstimate = Math.abs(price2 - price1) * (Math.random() * 50 + 10);
      const gasCost = Math.random() * 15 + 5;
      
      // Only create opportunity if profitable after gas
      if (profitEstimate > gasCost + 5) {
        const { error } = await supabase
          .from('arbitrage_opportunities')
          .insert({
            pair,
            exchange1,
            exchange2,
            price1,
            price2,
            profit_estimate: profitEstimate,
            gas_cost: gasCost,
            status: 'detected'
          });
        
        if (error) throw error;
        
        // Refresh data
        await fetchOpportunities();
        await calculateStats();
      }
    } catch (error) {
      console.error('Error detecting arbitrage:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isRunning, fetchOpportunities, calculateStats]);

  // Execute arbitrage trade
  const executeArbitrage = useCallback(async (opportunityId: string) => {
    try {
      // Update status to executing
      await supabase
        .from('arbitrage_opportunities')
        .update({ status: 'executing' })
        .eq('id', opportunityId);
      
      // Simulate execution delay
      setTimeout(async () => {
        const success = Math.random() > 0.1; // 90% success rate
        const { data: opp } = await supabase
          .from('arbitrage_opportunities')
          .select('*')
          .eq('id', opportunityId)
          .single();
        
        if (opp) {
          const actualProfit = success ? opp.profit_estimate * (0.8 + Math.random() * 0.4) : 0;
          const txHash = success ? `0x${Math.random().toString(16).substr(2, 64)}` : null;
          
          await supabase
            .from('arbitrage_opportunities')
            .update({
              status: success ? 'completed' : 'failed',
              actual_profit: actualProfit,
              tx_hash: txHash,
              executed_at: new Date().toISOString()
            })
            .eq('id', opportunityId);
          
          await fetchOpportunities();
          await calculateStats();
        }
      }, 2000 + Math.random() * 3000);
    } catch (error) {
      console.error('Error executing arbitrage:', error);
    }
  }, [fetchOpportunities, calculateStats]);

  // Bot control functions
  const startBot = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stopBot = useCallback(() => {
    setIsRunning(false);
  }, []);

  // Auto-detect opportunities when bot is running
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(detectArbitrageOpportunities, 5000 + Math.random() * 10000);
      return () => clearInterval(interval);
    }
  }, [isRunning, detectArbitrageOpportunities]);

  // Initial data load
  useEffect(() => {
    fetchOpportunities();
    calculateStats();
  }, [fetchOpportunities, calculateStats]);

  return {
    isRunning,
    opportunities,
    stats,
    isLoading,
    startBot,
    stopBot,
    executeArbitrage,
    refreshData: () => {
      fetchOpportunities();
      calculateStats();
    }
  };
};
