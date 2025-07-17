// 🔄 REAL-TIME DATA INTEGRATION HOOK
// Day 5 - WebSocket connections and live data streaming

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface ArbitrageOpportunity {
  id: string;
  pair: string;
  tokenA: string;
  tokenB: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  profitUSD: number;
  profitPercent: number;
  volume: number;
  gasEstimate: number;
  confidence: number;
  timestamp: number;
  network: string;
}

interface BotStatus {
  isRunning: boolean;
  lastUpdate: number;
  totalTrades: number;
  successfulTrades: number;
  totalProfit: number;
  currentNetwork: string;
  errors: string[];
}

interface RealTimeData {
  opportunities: ArbitrageOpportunity[];
  botStatus: BotStatus;
  networkStats: Record<string, any>;
  priceUpdates: Record<string, number>;
}

interface UseRealTimeDataOptions {
  network?: string;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  enableHeartbeat?: boolean;
  heartbeatInterval?: number;
}

interface UseRealTimeDataReturn {
  data: RealTimeData;
  connected: boolean;
  connecting: boolean;
  error: string | null;
  lastUpdate: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
  reconnect: () => void;
  disconnect: () => void;
}

export function useRealTimeData(options: UseRealTimeDataOptions = {}): UseRealTimeDataReturn {
  const {
    network = 'base',
    autoReconnect = true,
    maxReconnectAttempts = 5,
    reconnectDelay = 3000,
    enableHeartbeat = true,
    heartbeatInterval = 30000
  } = options;

  // State management
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'disconnected'>('disconnected');

  // Data state
  const [data, setData] = useState<RealTimeData>({
    opportunities: [],
    botStatus: {
      isRunning: false,
      lastUpdate: 0,
      totalTrades: 0,
      successfulTrades: 0,
      totalProfit: 0,
      currentNetwork: network,
      errors: []
    },
    networkStats: {},
    priceUpdates: {}
  });

  // Refs for cleanup and reconnection logic
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimer = useRef<NodeJS.Timeout | null>(null);
  const latencyHistory = useRef<number[]>([]);
  const subscriptions = useRef<Set<string>>(new Set());

  // WebSocket URL configuration
  const getWebSocketUrl = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      return process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    }
    return process.env.NEXT_PUBLIC_WS_URL || 'wss://api.theatom.com';
  }, []);

  // Connection quality assessment
  const assessConnectionQuality = useCallback(() => {
    if (!connected) {
      setConnectionQuality('disconnected');
      return;
    }

    const avgLatency = latencyHistory.current.reduce((a, b) => a + b, 0) / latencyHistory.current.length;
    
    if (avgLatency < 100) {
      setConnectionQuality('excellent');
    } else if (avgLatency < 300) {
      setConnectionQuality('good');
    } else {
      setConnectionQuality('poor');
    }
  }, [connected]);

  // Heartbeat mechanism
  const startHeartbeat = useCallback((socket: Socket) => {
    if (!enableHeartbeat) return;

    heartbeatTimer.current = setInterval(() => {
      const pingTime = Date.now();
      socket.emit('ping', pingTime);
    }, heartbeatInterval);
  }, [enableHeartbeat, heartbeatInterval]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimer.current) {
      clearInterval(heartbeatTimer.current);
      heartbeatTimer.current = null;
    }
  }, []);

  // Connection management
  const connect = useCallback(() => {
    if (socket?.connected || connecting) return;

    setConnecting(true);
    setError(null);

    try {
      const newSocket = io(getWebSocketUrl(), {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
        reconnection: false // We handle reconnection manually
      });

      // Connection events
      newSocket.on('connect', () => {
        console.log('🔗 Connected to real-time server');
        setConnected(true);
        setConnecting(false);
        setError(null);
        reconnectAttempts.current = 0;

        // Subscribe to network updates
        newSocket.emit('subscribe', { 
          network,
          channels: Array.from(subscriptions.current)
        });

        startHeartbeat(newSocket);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected from real-time server:', reason);
        setConnected(false);
        setConnecting(false);
        stopHeartbeat();

        if (autoReconnect && reconnectAttempts.current < maxReconnectAttempts) {
          scheduleReconnect();
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
        setError(error.message);
        setConnecting(false);
        
        if (autoReconnect && reconnectAttempts.current < maxReconnectAttempts) {
          scheduleReconnect();
        }
      });

      // Data events
      newSocket.on('opportunities_update', (opportunities: ArbitrageOpportunity[]) => {
        setData(prev => ({
          ...prev,
          opportunities: opportunities.filter(opp => opp.network === network)
        }));
        setLastUpdate(Date.now());
      });

      newSocket.on('bot_status_update', (status: BotStatus) => {
        setData(prev => ({
          ...prev,
          botStatus: status
        }));
        setLastUpdate(Date.now());
      });

      newSocket.on('network_stats_update', (stats: Record<string, any>) => {
        setData(prev => ({
          ...prev,
          networkStats: stats
        }));
        setLastUpdate(Date.now());
      });

      newSocket.on('price_update', (priceData: Record<string, number>) => {
        setData(prev => ({
          ...prev,
          priceUpdates: { ...prev.priceUpdates, ...priceData }
        }));
        setLastUpdate(Date.now());
      });

      // Heartbeat response
      newSocket.on('pong', (pingTime: number) => {
        const latency = Date.now() - pingTime;
        latencyHistory.current.push(latency);
        
        // Keep only last 10 latency measurements
        if (latencyHistory.current.length > 10) {
          latencyHistory.current.shift();
        }
        
        assessConnectionQuality();
      });

      setSocket(newSocket);

    } catch (error) {
      console.error('Failed to create socket connection:', error);
      setError(error instanceof Error ? error.message : 'Connection failed');
      setConnecting(false);
    }
  }, [network, getWebSocketUrl, autoReconnect, maxReconnectAttempts, startHeartbeat, stopHeartbeat, assessConnectionQuality]);

  // Reconnection logic
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimer.current) return;

    reconnectAttempts.current++;
    const delay = reconnectDelay * Math.pow(2, reconnectAttempts.current - 1); // Exponential backoff

    console.log(`🔄 Scheduling reconnect attempt ${reconnectAttempts.current}/${maxReconnectAttempts} in ${delay}ms`);

    reconnectTimer.current = setTimeout(() => {
      reconnectTimer.current = null;
      connect();
    }, delay);
  }, [reconnectDelay, maxReconnectAttempts, connect]);

  // Public methods
  const subscribe = useCallback((channel: string) => {
    subscriptions.current.add(channel);
    if (socket?.connected) {
      socket.emit('subscribe_channel', { channel, network });
    }
  }, [socket, network]);

  const unsubscribe = useCallback((channel: string) => {
    subscriptions.current.delete(channel);
    if (socket?.connected) {
      socket.emit('unsubscribe_channel', { channel, network });
    }
  }, [socket, network]);

  const reconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    reconnectAttempts.current = 0;
    
    if (socket) {
      socket.disconnect();
    }
    
    setTimeout(connect, 1000);
  }, [socket, connect]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    
    stopHeartbeat();
    
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    
    setConnected(false);
    setConnecting(false);
  }, [socket, stopHeartbeat]);

  // Initialize connection
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [network]); // Reconnect when network changes

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    data,
    connected,
    connecting,
    error,
    lastUpdate,
    connectionQuality,
    subscribe,
    unsubscribe,
    reconnect,
    disconnect
  };
}

// 🔧 UTILITY HOOKS

export function useOpportunityStream(network: string) {
  const { data, connected, error } = useRealTimeData({ network });
  return {
    opportunities: data.opportunities,
    connected,
    error
  };
}

export function useBotStatusStream(network: string) {
  const { data, connected, error } = useRealTimeData({ network });
  return {
    botStatus: data.botStatus,
    connected,
    error
  };
}

export function usePriceStream(tokens: string[], network: string) {
  const { data, connected, error, subscribe, unsubscribe } = useRealTimeData({ network });
  
  useEffect(() => {
    tokens.forEach(token => subscribe(`price_${token}`));
    return () => {
      tokens.forEach(token => unsubscribe(`price_${token}`));
    };
  }, [tokens, subscribe, unsubscribe]);

  return {
    prices: data.priceUpdates,
    connected,
    error
  };
}

export default useRealTimeData;
