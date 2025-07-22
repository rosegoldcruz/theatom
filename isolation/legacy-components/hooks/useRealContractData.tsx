import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// Your REAL deployed contract
const CONTRACT_ADDRESS = '0xb3800E6bC7847E5d5a71a03887EDc5829DF4133b';
const RPC_URL = 'https://base-sepolia.g.alchemy.com/v2/ESBtk3UKjPt2rK2Yz0hnzUj0tIJGTe-d';

// Real contract ABI
const CONTRACT_ABI = [
  "function owner() external view returns (address)",
  "function totalTrades() external view returns (uint256)",
  "function totalProfit() external view returns (uint256)",
  "function successfulTrades() external view returns (uint256)",
  "function totalGasUsed() external view returns (uint256)",
  "function paused() external view returns (bool)",
  "event ArbitrageExecuted(address indexed token, uint256 amountIn, uint256 profit, uint256 gasUsed)"
];

interface RealContractData {
  owner: string;
  totalTrades: number;
  totalProfit: number;
  successfulTrades: number;
  totalGasUsed: number;
  isPaused: boolean;
  successRate: number;
  avgProfitPerTrade: number;
  recentEvents: any[];
  blockNumber: number;
  networkStatus: 'connected' | 'disconnected' | 'error';
}

export const useRealContractData = () => {
  const [data, setData] = useState<RealContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRealData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Connect to real blockchain
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      // Get current block number
      const blockNumber = await provider.getBlockNumber();

      // Fetch real contract data
      const [
        owner,
        totalTrades,
        totalProfit,
        successfulTrades,
        totalGasUsed,
        isPaused
      ] = await Promise.all([
        contract.owner(),
        contract.totalTrades().catch(() => 0),
        contract.totalProfit().catch(() => 0),
        contract.successfulTrades().catch(() => 0),
        contract.totalGasUsed().catch(() => 0),
        contract.paused().catch(() => false)
      ]);

      // Calculate metrics
      const totalTradesNum = Number(totalTrades);
      const successfulTradesNum = Number(successfulTrades);
      const totalProfitNum = Number(ethers.formatEther(totalProfit));
      const successRate = totalTradesNum > 0 ? (successfulTradesNum / totalTradesNum) * 100 : 0;
      const avgProfitPerTrade = totalTradesNum > 0 ? totalProfitNum / totalTradesNum : 0;

      // Get recent events (last 100 blocks)
      const fromBlock = Math.max(0, blockNumber - 100);
      const events = await contract.queryFilter(
        contract.filters.ArbitrageExecuted(),
        fromBlock,
        blockNumber
      ).catch(() => []);

      const realData: RealContractData = {
        owner,
        totalTrades: totalTradesNum,
        totalProfit: totalProfitNum,
        successfulTrades: successfulTradesNum,
        totalGasUsed: Number(totalGasUsed),
        isPaused,
        successRate,
        avgProfitPerTrade,
        recentEvents: events.slice(-10), // Last 10 events
        blockNumber,
        networkStatus: 'connected'
      };

      setData(realData);
      console.log('🔥 REAL CONTRACT DATA:', realData);

    } catch (err: any) {
      console.error('❌ Real data fetch error:', err);
      setError(err.message);
      setData(prev => prev ? { ...prev, networkStatus: 'error' } : null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRealData();
    
    // Refresh every 10 seconds
    const interval = setInterval(fetchRealData, 10000);
    return () => clearInterval(interval);
  }, [fetchRealData]);

  return {
    data,
    loading,
    error,
    refresh: fetchRealData
  };
};
