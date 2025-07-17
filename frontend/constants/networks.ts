import { NetworkConfig } from '@/types';

export const NETWORKS: Record<string, NetworkConfig> = {
  ethereum: {
    name: 'Ethereum',
    rpc: 'Mainnet',
    color: 'bg-blue-500',
    gasPrice: '23 gwei',
    chainId: 1,
    contracts: {
      aave: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
      flashLoan: '0x398eC7346DcD622eDc5ae82352F02bE94C62d119',
      router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
    }
  },
  polygon: {
    name: 'Polygon',
    rpc: 'Mainnet',
    color: 'bg-purple-500',
    gasPrice: '32 gwei',
    chainId: 137,
    contracts: {
      aave: '0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf',
      flashLoan: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
      router: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff'
    }
  },
  arbitrum: {
    name: 'Arbitrum',
    rpc: 'One',
    color: 'bg-blue-600',
    gasPrice: '0.1 gwei',
    chainId: 42161,
    contracts: {
      aave: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      flashLoan: '0x89D976629b7055ff1ca02b927BA3e020F22A44e4',
      router: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506'
    }
  },
  optimism: {
    name: 'Optimism',
    rpc: 'Mainnet',
    color: 'bg-red-500',
    gasPrice: '0.001 gwei',
    chainId: 10,
    contracts: {
      aave: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      flashLoan: '0x89D976629b7055ff1ca02b927BA3e020F22A44e4',
      router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
    }
  }
};

export const THEME_COLORS = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  pink: 'bg-pink-500'
};

export const DEX_OPTIONS = [
  'Uniswap V2',
  'Uniswap V3',
  'Sushiswap',
  'Balancer',
  'Curve',
  '1inch'
];

export const DEFAULT_BOT_CONFIG = {
  maxFlashLoanAmount: 1000000,
  minProfitThreshold: 50,
  maxGasPrice: 50,
  enabledDEXs: ['Uniswap V2', 'Uniswap V3', 'Balancer', 'Curve'],
  slippageTolerance: 0.5,
  maxConcurrentTrades: 5
};

export const MOCK_OPPORTUNITIES = [
  {
    id: 1,
    pair: 'USDC/DAI',
    dex1: 'Uniswap V3',
    dex2: 'Curve',
    spread: 0.34,
    profit: 847.32,
    gas: 0.024,
    status: 'executing' as const,
    timestamp: Date.now(),
    volume: 50000
  },
  {
    id: 2,
    pair: 'WETH/USDC',
    dex1: 'Balancer',
    dex2: 'Uniswap V2',
    spread: 0.89,
    profit: 2394.71,
    gas: 0.056,
    status: 'pending' as const,
    timestamp: Date.now() - 30000,
    volume: 100000
  },
  {
    id: 3,
    pair: 'WBTC/USDT',
    dex1: 'Curve',
    dex2: 'Sushiswap',
    spread: 1.23,
    profit: 5847.93,
    gas: 0.084,
    status: 'monitoring' as const,
    timestamp: Date.now() - 60000,
    volume: 75000
  },
  {
    id: 4,
    pair: 'LINK/USDC',
    dex1: 'Uniswap V2',
    dex2: 'Balancer',
    spread: 0.67,
    profit: 1247.84,
    gas: 0.032,
    status: 'monitoring' as const,
    timestamp: Date.now() - 90000,
    volume: 25000
  }
];
