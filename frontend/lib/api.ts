/**
 * Frontend API service layer
 * All blockchain interactions are handled by the backend API
 * This file contains only fetch calls to the backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3001';

// API response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

import { getAuthToken as getSupabaseAuthToken } from './supabase';

// Helper function to get auth token from Supabase
async function getAuthToken(): Promise<string | null> {
  return await getSupabaseAuthToken();
}

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Arbitrage API calls
export const arbitrageApi = {
  // Get arbitrage system status
  getStatus: () => apiCall<{
    isActive: boolean;
    totalTrades: number;
    totalProfit: number;
    successRate: number;
    contractBalance: number;
    networkStatus: string;
    lastBlockNumber: number;
    gasPrice: string;
  }>('/api/arbitrage/status'),

  // Execute arbitrage trade
  execute: (params: {
    token: string;
    amount: number;
    slippage?: number;
    gasLimit?: number;
  }) => apiCall<{
    success: boolean;
    transactionHash: string;
    blockNumber: number;
    gasUsed: string;
    timestamp: number;
  }>('/api/arbitrage/execute', {
    method: 'POST',
    body: JSON.stringify(params),
  }),

  // Get trade history
  getHistory: (params?: {
    page?: number;
    limit?: number;
  }) => apiCall<{
    trades: Array<{
      id: string;
      timestamp: number;
      token: string;
      amount: number;
      profit: number;
      status: string;
      transactionHash: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>(`/api/arbitrage/history${params ? `?${new URLSearchParams(params as any)}` : ''}`),

  // Get detailed statistics
  getStats: () => apiCall<{
    overview: {
      totalTrades: number;
      successfulTrades: number;
      totalProfit: number;
      successRate: number;
    };
    performance: {
      avgProfitPerTrade: number;
      bestTrade: number;
      worstTrade: number;
      profitToday: number;
    };
    network: {
      currentGasPrice: string;
      lastBlockNumber: number;
      contractBalance: number;
      networkStatus: string;
    };
  }>('/api/arbitrage/stats'),

  // Simulate trade
  simulate: (params: {
    token: string;
    amount: number;
    slippage?: number;
  }) => apiCall<{
    estimatedProfit: number;
    estimatedGasCost: number;
    netProfit: number;
    successProbability: number;
    risks: string[];
  }>('/api/arbitrage/simulate', {
    method: 'POST',
    body: JSON.stringify(params),
  }),
};

// Opportunities API calls
export const opportunitiesApi = {
  // Get current opportunities
  getOpportunities: (params?: {
    network?: string;
    minProfit?: number;
  }) => apiCall<{
    opportunities: Array<{
      id: string;
      pair: string;
      dexA: string;
      dexB: string;
      priceA: number;
      priceB: number;
      profitEstimate: number;
      profitAmount: number;
      liquidity: number;
      gasEstimate: number;
      netProfit: number;
      confidence: number;
      timestamp: number;
      expiresAt: number;
    }>;
    network: string;
    scanTimestamp: number;
    nextScanIn: number;
  }>(`/api/opportunities${params ? `?${new URLSearchParams(params as any)}` : ''}`),

  // Get opportunity details
  getOpportunityDetails: (id: string) => apiCall<{
    id: string;
    pair: string;
    dexA: {
      name: string;
      address: string;
      price: number;
      liquidity: number;
      fee: number;
    };
    dexB: {
      name: string;
      address: string;
      price: number;
      liquidity: number;
      fee: number;
    };
    profitAnalysis: {
      grossProfit: number;
      gasCost: number;
      dexFees: number;
      netProfit: number;
      profitMargin: number;
      roi: number;
    };
    risks: Array<{
      type: string;
      level: string;
      description: string;
    }>;
    executionPlan: {
      steps: string[];
      estimatedTime: string;
      gasLimit: number;
    };
    timestamp: number;
    expiresAt: number;
  }>(`/api/opportunities/${id}`),

  // Trigger manual scan
  triggerScan: (params: {
    networks?: string[];
    pairs?: string[];
  }) => apiCall<{
    scanId: string;
    networks: string[];
    pairs: string[];
    status: string;
    estimatedCompletion: number;
  }>('/api/opportunities/scan', {
    method: 'POST',
    body: JSON.stringify(params),
  }),

  // Get opportunity history
  getHistory: (params?: {
    page?: number;
    limit?: number;
    timeframe?: string;
    pair?: string;
    minProfit?: number;
  }) => apiCall<{
    opportunities: Array<{
      id: string;
      pair: string;
      timestamp: number;
      profitEstimate: number;
      executed: boolean;
      actualProfit?: number;
      executedBy?: string;
      reason?: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    filters: {
      timeframe?: string;
      pair?: string;
      minProfit?: number;
    };
  }>(`/api/opportunities/history${params ? `?${new URLSearchParams(params as any)}` : ''}`),
};

// Bot API calls
export const botApi = {
  // Get bot status
  getStatus: () => apiCall<{
    isRunning: boolean;
    startedAt: number | null;
    stoppedAt: number | null;
    config: {
      minProfitThreshold: number;
      maxGasPrice: number;
      autoExecute: boolean;
      networks: string[];
      pairs: string[];
    };
    stats: {
      opportunitiesScanned: number;
      tradesExecuted: number;
      totalProfit: number;
      uptime: number;
    };
    timestamp: number;
  }>('/api/bot/status'),

  // Start bot
  start: (config?: {
    minProfitThreshold?: number;
    maxGasPrice?: number;
    autoExecute?: boolean;
    networks?: string[];
    pairs?: string[];
  }) => apiCall<{
    message: string;
    startedAt: number;
    config: any;
  }>('/api/bot/start', {
    method: 'POST',
    body: JSON.stringify({ config }),
  }),

  // Stop bot
  stop: () => apiCall<{
    message: string;
    stoppedAt: number;
    totalUptime: number;
  }>('/api/bot/stop', {
    method: 'POST',
  }),

  // Update configuration
  updateConfig: (config: {
    minProfitThreshold?: number;
    maxGasPrice?: number;
    autoExecute?: boolean;
    networks?: string[];
    pairs?: string[];
  }) => apiCall<{
    message: string;
    config: any;
  }>('/api/bot/config', {
    method: 'PUT',
    body: JSON.stringify({ config }),
  }),

  // Get bot logs
  getLogs: (params?: {
    limit?: number;
    level?: string;
  }) => apiCall<{
    logs: Array<{
      timestamp: number;
      level: string;
      message: string;
      data?: any;
    }>;
    total: number;
    level: string;
  }>(`/api/bot/logs${params ? `?${new URLSearchParams(params as any)}` : ''}`),
};

// Health check
export const healthApi = {
  check: () => apiCall<{
    status: string;
    timestamp: string;
    uptime: number;
    environment: string;
    version: string;
    services: {
      database: string;
      blockchain: string;
      memory: {
        used: string;
        total: string;
      };
    };
  }>('/api/health'),
};
