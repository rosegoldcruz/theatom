// Trading System Types
export interface TradingMetrics {
  totalProfit: number;
  todayProfit: number;
  successRate: number;
  activeTrades: number;
  totalTrades: number;
  avgReturn: number;
  flashLoanVolume: number;
  gasSpent: number;
}

export interface ArbitrageOpportunity {
  id: number;
  pair: string;
  dex1: string;
  dex2: string;
  spread: number;
  profit: number;
  gas: number;
  status: 'executing' | 'pending' | 'monitoring';
  timestamp?: number;
  volume?: number;
}

export interface NetworkConfig {
  name: string;
  rpc: string;
  color: string;
  gasPrice: string;
  chainId: number;
  contracts?: {
    aave?: string;
    flashLoan?: string;
    router?: string;
  };
}

export interface BotConfig {
  maxFlashLoanAmount: number;
  minProfitThreshold: number;
  maxGasPrice: number;
  enabledDEXs: string[];
  slippageTolerance: number;
  maxConcurrentTrades: number;
}

export interface BotStatus {
  status: 'stopped' | 'running' | 'paused' | 'error';
  uptime: number;
  lastScan: number;
  nextScan: number;
  performance: {
    scanFrequency: number;
    executionSpeed: number;
    successRate: number;
  };
}

export interface TradeHistory {
  id: string;
  timestamp: number;
  pair: string;
  dex1: string;
  dex2: string;
  profit: number;
  gas: number;
  status: 'success' | 'failed' | 'pending';
  txHash?: string;
  flashLoanAmount: number;
}

export interface SystemStatus {
  network: 'connected' | 'disconnected' | 'error';
  aaveFlashLoans: 'available' | 'unavailable' | 'error';
  mevProtection: 'active' | 'inactive';
  gasOptimization: 'enabled' | 'disabled';
}

// UI Types
export type ThemeColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'pink';
export type PageId = 'dashboard' | 'bot' | 'opportunities' | 'analytics' | 'history' | 'settings';

export interface AppState {
  currentPage: PageId;
  theme: ThemeColor;
  isDark: boolean;
  selectedNetwork: string;
  isWalletConnected: boolean;
  walletAddress: string;
  showBalance: boolean;
  isMobile: boolean;
  isSidebarOpen: boolean;
}

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface WebSocketMessage {
  type: 'opportunity_update' | 'trade_executed' | 'bot_status_change' | 'network_status';
  data: any;
  timestamp: number;
}

// Hook Types
export interface UseArbitrageBotReturn {
  botStatus: BotStatus;
  botConfig: BotConfig;
  tradingMetrics: TradingMetrics;
  systemStatus: SystemStatus;
  startBot: () => Promise<void>;
  stopBot: () => Promise<void>;
  pauseBot: () => Promise<void>;
  updateConfig: (config: Partial<BotConfig>) => Promise<void>;
}

export interface UseWeb3Return {
  isConnected: boolean;
  address: string | null;
  network: string;
  balance: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (networkId: string) => Promise<void>;
}

export interface UseRealTimeDataReturn {
  opportunities: ArbitrageOpportunity[];
  isConnected: boolean;
  lastUpdate: number;
  subscribe: (callback: (data: WebSocketMessage) => void) => () => void;
}
