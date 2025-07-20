'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, PageId, ThemeColor, TradingMetrics, ArbitrageOpportunity } from '@/types';

// Initial state
const initialState: AppState & {
  tradingMetrics: TradingMetrics;
  opportunities: ArbitrageOpportunity[];
  botStatus: 'stopped' | 'running' | 'paused';
} = {
  currentPage: 'dashboard',
  theme: 'blue',
  isDark: false,
  selectedNetwork: 'ethereum',
  isWalletConnected: false,
  walletAddress: '',
  showBalance: true,
  isMobile: false,
  isSidebarOpen: false,
  botStatus: 'stopped',
  tradingMetrics: {
    totalProfit: 47293.84,
    todayProfit: 2847.32,
    successRate: 96.2,
    activeTrades: 23,
    totalTrades: 1847,
    avgReturn: 2.4,
    flashLoanVolume: 12743892.33,
    gasSpent: 0.847
  },
  opportunities: [
    { id: 1, pair: 'USDC/DAI', dex1: 'Uniswap V3', dex2: 'Curve', spread: 0.34, profit: 847.32, gas: 0.024, status: 'executing' },
    { id: 2, pair: 'WETH/USDC', dex1: 'Balancer', dex2: 'Uniswap V2', spread: 0.89, profit: 2394.71, gas: 0.056, status: 'pending' },
    { id: 3, pair: 'WBTC/USDT', dex1: 'Curve', dex2: 'Sushiswap', spread: 1.23, profit: 5847.93, gas: 0.084, status: 'monitoring' },
    { id: 4, pair: 'LINK/USDC', dex1: 'Uniswap V2', dex2: 'Balancer', spread: 0.67, profit: 1247.84, gas: 0.032, status: 'monitoring' }
  ]
};

// Action types
type AppAction =
  | { type: 'SET_PAGE'; payload: PageId }
  | { type: 'SET_THEME'; payload: ThemeColor }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_NETWORK'; payload: string }
  | { type: 'SET_WALLET_CONNECTION'; payload: { connected: boolean; address?: string } }
  | { type: 'TOGGLE_BALANCE_VISIBILITY' }
  | { type: 'SET_MOBILE'; payload: boolean }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_BOT_STATUS'; payload: 'stopped' | 'running' | 'paused' }
  | { type: 'UPDATE_TRADING_METRICS'; payload: Partial<TradingMetrics> }
  | { type: 'UPDATE_OPPORTUNITIES'; payload: ArbitrageOpportunity[] }
  | { type: 'LOAD_PERSISTED_STATE'; payload: Partial<AppState> };

// Reducer
function appReducer(state: typeof initialState, action: AppAction): typeof initialState {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload, isSidebarOpen: false };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'TOGGLE_DARK_MODE':
      return { ...state, isDark: !state.isDark };
    case 'SET_NETWORK':
      return { ...state, selectedNetwork: action.payload };
    case 'SET_WALLET_CONNECTION':
      return {
        ...state,
        isWalletConnected: action.payload.connected,
        walletAddress: action.payload.address || ''
      };
    case 'TOGGLE_BALANCE_VISIBILITY':
      return { ...state, showBalance: !state.showBalance };
    case 'SET_MOBILE':
      return { ...state, isMobile: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, isSidebarOpen: !state.isSidebarOpen };
    case 'SET_BOT_STATUS':
      return { ...state, botStatus: action.payload };
    case 'UPDATE_TRADING_METRICS':
      return {
        ...state,
        tradingMetrics: { ...state.tradingMetrics, ...action.payload }
      };
    case 'UPDATE_OPPORTUNITIES':
      return { ...state, opportunities: action.payload };
    case 'LOAD_PERSISTED_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: typeof initialState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    setPage: (page: PageId) => void;
    setTheme: (theme: ThemeColor) => void;
    toggleDarkMode: () => void;
    setNetwork: (network: string) => void;
    connectWallet: (address: string) => void;
    disconnectWallet: () => void;
    toggleBalanceVisibility: () => void;
    setMobile: (isMobile: boolean) => void;
    toggleSidebar: () => void;
    setBotStatus: (status: 'stopped' | 'running' | 'paused') => void;
    updateTradingMetrics: (metrics: Partial<TradingMetrics>) => void;
    updateOpportunities: (opportunities: ArbitrageOpportunity[]) => void;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load persisted state on mount
  useEffect(() => {
    const persistedState = localStorage.getItem('atom-app-state');
    if (persistedState) {
      try {
        const parsed = JSON.parse(persistedState);
        dispatch({ type: 'LOAD_PERSISTED_STATE', payload: parsed });
      } catch (error) {
        console.error('Failed to load persisted state:', error);
      }
    }
  }, []);

  // Persist state changes
  useEffect(() => {
    const stateToSave = {
      theme: state.theme,
      isDark: state.isDark,
      selectedNetwork: state.selectedNetwork,
      showBalance: state.showBalance
    };
    localStorage.setItem('atom-app-state', JSON.stringify(stateToSave));
  }, [state.theme, state.isDark, state.selectedNetwork, state.showBalance]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      dispatch({ type: 'SET_MOBILE', payload: window.innerWidth < 768 });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Real-time data simulation when bot is running
  useEffect(() => {
    if (state.botStatus === 'running') {
      const interval = setInterval(() => {
        dispatch({
          type: 'UPDATE_TRADING_METRICS',
          payload: {
            totalProfit: state.tradingMetrics.totalProfit + Math.random() * 100,
            todayProfit: state.tradingMetrics.todayProfit + Math.random() * 10,
            activeTrades: Math.floor(Math.random() * 15) + 10
          }
        });

        dispatch({
          type: 'UPDATE_OPPORTUNITIES',
          payload: state.opportunities.map(opp => ({
            ...opp,
            spread: Math.max(0.1, opp.spread + (Math.random() - 0.5) * 0.2),
            profit: Math.max(100, opp.profit + (Math.random() - 0.5) * 200)
          }))
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [state.botStatus, state.tradingMetrics, state.opportunities]);

  // Action creators
  const actions = {
    setPage: (page: PageId) => dispatch({ type: 'SET_PAGE', payload: page }),
    setTheme: (theme: ThemeColor) => dispatch({ type: 'SET_THEME', payload: theme }),
    toggleDarkMode: () => dispatch({ type: 'TOGGLE_DARK_MODE' }),
    setNetwork: (network: string) => dispatch({ type: 'SET_NETWORK', payload: network }),
    connectWallet: (address: string) => dispatch({
      type: 'SET_WALLET_CONNECTION',
      payload: { connected: true, address }
    }),
    disconnectWallet: () => dispatch({
      type: 'SET_WALLET_CONNECTION',
      payload: { connected: false }
    }),
    toggleBalanceVisibility: () => dispatch({ type: 'TOGGLE_BALANCE_VISIBILITY' }),
    setMobile: (isMobile: boolean) => dispatch({ type: 'SET_MOBILE', payload: isMobile }),
    toggleSidebar: () => dispatch({ type: 'TOGGLE_SIDEBAR' }),
    setBotStatus: (status: 'stopped' | 'running' | 'paused') => dispatch({ type: 'SET_BOT_STATUS', payload: status }),
    updateTradingMetrics: (metrics: Partial<TradingMetrics>) =>
      dispatch({ type: 'UPDATE_TRADING_METRICS', payload: metrics }),
    updateOpportunities: (opportunities: ArbitrageOpportunity[]) =>
      dispatch({ type: 'UPDATE_OPPORTUNITIES', payload: opportunities })
  };

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}