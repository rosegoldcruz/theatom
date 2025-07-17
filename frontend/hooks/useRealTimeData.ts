'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { UseRealTimeDataReturn, ArbitrageOpportunity, WebSocketMessage } from '@/types';
import { MOCK_OPPORTUNITIES } from '@/constants/networks';
import { useOpportunities } from './useArbitrageAPI';

export const useRealTimeData = (): UseRealTimeDataReturn => {
  const { opportunities: apiOpportunities } = useOpportunities();
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>(MOCK_OPPORTUNITIES);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const subscribersRef = useRef<Set<(data: WebSocketMessage) => void>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate WebSocket connection
  useEffect(() => {
    // Simulate connection delay
    const connectTimeout = setTimeout(() => {
      setIsConnected(true);
    }, 1000);

    return () => clearTimeout(connectTimeout);
  }, []);

  // Update opportunities from API
  useEffect(() => {
    if (apiOpportunities && apiOpportunities.length > 0) {
      const formattedOpportunities: ArbitrageOpportunity[] = apiOpportunities.map((opp, index) => ({
        id: opp.id || index + 1,
        pair: opp.pair || `TOKEN${index + 1}/USDC`,
        dex1: opp.dex1 || 'Uniswap V3',
        dex2: opp.dex2 || 'Curve',
        spread: opp.spread || Math.random() * 2,
        profit: opp.estimatedProfit || Math.random() * 1000 + 100,
        gas: opp.estimatedGas || Math.random() * 0.1 + 0.01,
        status: opp.status || 'monitoring',
        timestamp: opp.timestamp || Date.now(),
        volume: opp.volume || Math.random() * 100000 + 10000
      }));
      
      setOpportunities(formattedOpportunities);
      setLastUpdate(Date.now());
    }
  }, [apiOpportunities]);

  // Simulate real-time updates
  useEffect(() => {
    if (!isConnected) return;

    const updateOpportunities = () => {
      setOpportunities(prev => {
        const updated = prev.map(opp => {
          // Simulate spread changes
          const spreadChange = (Math.random() - 0.5) * 0.2;
          const newSpread = Math.max(0.1, opp.spread + spreadChange);
          
          // Calculate new profit based on spread
          const profitChange = spreadChange * 1000;
          const newProfit = Math.max(100, opp.profit + profitChange);
          
          // Occasionally change status
          let newStatus = opp.status;
          if (Math.random() < 0.1) {
            const statuses: Array<'executing' | 'pending' | 'monitoring'> = ['executing', 'pending', 'monitoring'];
            newStatus = statuses[Math.floor(Math.random() * statuses.length)];
          }

          return {
            ...opp,
            spread: newSpread,
            profit: newProfit,
            status: newStatus,
            timestamp: Date.now()
          };
        });

        // Notify subscribers of updates
        const message: WebSocketMessage = {
          type: 'opportunity_update',
          data: { opportunities: updated },
          timestamp: Date.now()
        };

        subscribersRef.current.forEach(callback => {
          try {
            callback(message);
          } catch (error) {
            console.error('Error in WebSocket subscriber:', error);
          }
        });

        return updated;
      });

      setLastUpdate(Date.now());
    };

    // Update every 3 seconds
    intervalRef.current = setInterval(updateOpportunities, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isConnected]);

  // Simulate occasional trade execution notifications
  useEffect(() => {
    if (!isConnected) return;

    const simulateTradeExecution = () => {
      if (Math.random() < 0.3) { // 30% chance every 10 seconds
        const randomOpp = opportunities[Math.floor(Math.random() * opportunities.length)];
        
        const message: WebSocketMessage = {
          type: 'trade_executed',
          data: {
            id: `trade_${Date.now()}`,
            pair: randomOpp.pair,
            profit: randomOpp.profit,
            status: 'success',
            timestamp: Date.now()
          },
          timestamp: Date.now()
        };

        subscribersRef.current.forEach(callback => {
          try {
            callback(message);
          } catch (error) {
            console.error('Error in WebSocket subscriber:', error);
          }
        });
      }
    };

    const tradeInterval = setInterval(simulateTradeExecution, 10000);
    return () => clearInterval(tradeInterval);
  }, [isConnected, opportunities]);

  const subscribe = useCallback((callback: (data: WebSocketMessage) => void) => {
    subscribersRef.current.add(callback);
    
    // Return unsubscribe function
    return () => {
      subscribersRef.current.delete(callback);
    };
  }, []);

  // Simulate bot status changes
  useEffect(() => {
    if (!isConnected) return;

    const simulateBotStatusChange = () => {
      if (Math.random() < 0.1) { // 10% chance every 15 seconds
        const statuses = ['running', 'stopped', 'paused'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        const message: WebSocketMessage = {
          type: 'bot_status_change',
          data: {
            status: randomStatus,
            timestamp: Date.now()
          },
          timestamp: Date.now()
        };

        subscribersRef.current.forEach(callback => {
          try {
            callback(message);
          } catch (error) {
            console.error('Error in WebSocket subscriber:', error);
          }
        });
      }
    };

    const statusInterval = setInterval(simulateBotStatusChange, 15000);
    return () => clearInterval(statusInterval);
  }, [isConnected]);

  // Simulate network status updates
  useEffect(() => {
    if (!isConnected) return;

    const simulateNetworkStatus = () => {
      const message: WebSocketMessage = {
        type: 'network_status',
        data: {
          network: 'connected',
          gasPrice: `${Math.floor(Math.random() * 50 + 10)} gwei`,
          blockNumber: Math.floor(Math.random() * 1000000 + 18000000),
          timestamp: Date.now()
        },
        timestamp: Date.now()
      };

      subscribersRef.current.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error('Error in WebSocket subscriber:', error);
        }
      });
    };

    const networkInterval = setInterval(simulateNetworkStatus, 30000);
    return () => clearInterval(networkInterval);
  }, [isConnected]);

  return {
    opportunities,
    isConnected,
    lastUpdate,
    subscribe
  };
};
