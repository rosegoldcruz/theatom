'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, PageId, ThemeColor, TradingMetrics, ArbitrageOpportunity } from '@/types';
import { MOCK_OPPORTUNITIES } from '@/constants/networks';

// Initial state
const initialState: AppState & {
  tradingMetrics: TradingMetrics;
  opportunities: ArbitrageOpportunity[];
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
  opportunities: MOCK_OPPORTUNITIES
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
