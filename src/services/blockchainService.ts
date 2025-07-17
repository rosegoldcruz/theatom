import { ethers } from 'ethers';

// Environment configuration - QuickNode Base Sepolia
const BASE_SEPOLIA_RPC = import.meta.env.VITE_BASE_SEPOLIA_RPC_URL || 'https://nameless-misty-pool.base-sepolia.quiknode.pro/6d60e9cd97d2fc31ceade73f41dd089d507fb19b/';
const BASE_SEPOLIA_WSS = import.meta.env.VITE_BASE_SEPOLIA_WSS_URL || 'wss://nameless-misty-pool.base-sepolia.quiknode.pro/6d60e9cd97d2fc31ceade73f41dd089d507fb19b/';
const CONTRACT_ADDRESS = import.meta.env.VITE_BASE_SEPOLIA_CONTRACT_ADDRESS || '0xb3800E6bC7847E5d5a71a03887EDc5829DF4133b';
const PRIVATE_KEY = import.meta.env.VITE_PRIVATE_KEY;
const ENABLE_REAL_DATA = import.meta.env.VITE_ENABLE_REAL_DATA === 'true';

// Contract ABI (simplified for arbitrage operations)
const ARBITRAGE_ABI = [
  "function getBalance() view returns (uint256)",
  "function getTotalProfit() view returns (uint256)",
  "function getActiveOpportunities() view returns (uint256)",
  "function getSuccessRate() view returns (uint256)",
  "function owner() view returns (address)",
  "function paused() view returns (bool)",
  "event ArbitrageExecuted(address indexed token, uint256 profit, uint256 timestamp)",
  "event OpportunityDetected(string pair, uint256 profitEstimate, uint256 timestamp)"
];

export interface RealArbitrageData {
  totalProfit: number;
  activeOpportunities: number;
  successRate: number;
  contractBalance: number;
  isContractActive: boolean;
  lastBlockNumber: number;
  gasPrice: string;
  networkStatus: 'connected' | 'disconnected' | 'error';
}

export interface RealTradeData {
  txHash: string;
  timestamp: number;
  tokenPair: string;
  profit: number;
  gasUsed: number;
  status: 'success' | 'failed';
  blockNumber: number;
}

class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private wsProvider?: ethers.WebSocketProvider;
  private contract: ethers.Contract;
  private wsContract?: ethers.Contract;
  private wallet?: ethers.Wallet;

  constructor() {
    // HTTP Provider for regular calls
    this.provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, ARBITRAGE_ABI, this.provider);

    // WebSocket Provider for real-time events
    if (ENABLE_REAL_DATA) {
      try {
        this.wsProvider = new ethers.WebSocketProvider(BASE_SEPOLIA_WSS);
        this.wsContract = new ethers.Contract(CONTRACT_ADDRESS, ARBITRAGE_ABI, this.wsProvider);
      } catch (error) {
        console.warn('WebSocket connection failed, using HTTP only:', error);
      }
    }

    if (PRIVATE_KEY) {
      this.wallet = new ethers.Wallet(PRIVATE_KEY, this.provider);
      this.contract = this.contract.connect(this.wallet);
    }
  }

  async getNetworkInfo() {
    try {
      const [blockNumber, gasPrice, network] = await Promise.all([
        this.provider.getBlockNumber(),
        this.provider.getFeeData(),
        this.provider.getNetwork()
      ]);

      return {
        blockNumber,
        gasPrice: ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei'),
        chainId: network.chainId.toString(),
        networkName: network.name
      };
    } catch (error) {
      console.error('Error fetching network info:', error);
      throw error;
    }
  }

  async getContractData(): Promise<RealArbitrageData> {
    try {
      const [
        totalProfit,
        activeOpportunities,
        successRate,
        contractBalance,
        isPaused,
        networkInfo
      ] = await Promise.all([
        this.contract.getTotalProfit().catch(() => 0),
        this.contract.getActiveOpportunities().catch(() => 0),
        this.contract.getSuccessRate().catch(() => 0),
        this.provider.getBalance(CONTRACT_ADDRESS),
        this.contract.paused().catch(() => false),
        this.getNetworkInfo()
      ]);

      return {
        totalProfit: parseFloat(ethers.formatEther(totalProfit)),
        activeOpportunities: Number(activeOpportunities),
        successRate: Number(successRate),
        contractBalance: parseFloat(ethers.formatEther(contractBalance)),
        isContractActive: !isPaused,
        lastBlockNumber: networkInfo.blockNumber,
        gasPrice: networkInfo.gasPrice,
        networkStatus: 'connected'
      };
    } catch (error) {
      console.error('Error fetching contract data:', error);
      return {
        totalProfit: 0,
        activeOpportunities: 0,
        successRate: 0,
        contractBalance: 0,
        isContractActive: false,
        lastBlockNumber: 0,
        gasPrice: '0',
        networkStatus: 'error'
      };
    }
  }

  async getRecentTrades(limit: number = 10): Promise<RealTradeData[]> {
    try {
      const filter = this.contract.filters.ArbitrageExecuted();
      const events = await this.contract.queryFilter(filter, -1000); // Last 1000 blocks
      
      const trades = await Promise.all(
        events.slice(-limit).map(async (event) => {
          const block = await event.getBlock();
          return {
            txHash: event.transactionHash,
            timestamp: block.timestamp * 1000,
            tokenPair: `${event.args?.[0] || 'UNKNOWN'}/ETH`,
            profit: parseFloat(ethers.formatEther(event.args?.[1] || 0)),
            gasUsed: 0, // Will be filled from transaction receipt
            status: 'success' as const,
            blockNumber: event.blockNumber
          };
        })
      );

      return trades.reverse(); // Most recent first
    } catch (error) {
      console.error('Error fetching recent trades:', error);
      return [];
    }
  }

  async getWalletBalance(address: string): Promise<number> {
    try {
      const balance = await this.provider.getBalance(address);
      return parseFloat(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      return 0;
    }
  }

  async estimateGasPrice(): Promise<string> {
    try {
      const feeData = await this.provider.getFeeData();
      return ethers.formatUnits(feeData.gasPrice || 0, 'gwei');
    } catch (error) {
      console.error('Error estimating gas price:', error);
      return '0';
    }
  }

  // Real-time monitoring with WebSocket support
  startEventListening(callback: (event: any) => void) {
    const contractToUse = this.wsContract || this.contract;

    // Listen for arbitrage execution events
    contractToUse.on('ArbitrageExecuted', (token, profit, timestamp, event) => {
      callback({
        type: 'trade_executed',
        data: {
          token,
          profit: ethers.formatEther(profit),
          timestamp: Number(timestamp) * 1000,
          txHash: event.transactionHash,
          blockNumber: event.blockNumber
        }
      });
    });

    // Listen for opportunity detection events
    contractToUse.on('OpportunityDetected', (pair, profitEstimate, timestamp, event) => {
      callback({
        type: 'opportunity_detected',
        data: {
          pair,
          profitEstimate: ethers.formatEther(profitEstimate),
          timestamp: Number(timestamp) * 1000,
          txHash: event.transactionHash,
          blockNumber: event.blockNumber
        }
      });
    });

    // Listen for new blocks for real-time updates
    if (this.wsProvider) {
      this.wsProvider.on('block', (blockNumber) => {
        callback({
          type: 'new_block',
          data: {
            blockNumber,
            timestamp: Date.now()
          }
        });
      });
    }

    console.log('🔥 Real-time event listening started on Base Sepolia');
  }

  stopEventListening() {
    this.contract.removeAllListeners();
    if (this.wsContract) {
      this.wsContract.removeAllListeners();
    }
    if (this.wsProvider) {
      this.wsProvider.removeAllListeners();
    }
    console.log('🔥 Event listening stopped');
  }

  // Test connection to Base Sepolia
  async testConnection(): Promise<boolean> {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      const network = await this.provider.getNetwork();
      console.log('🔥 Connected to Base Sepolia:', {
        blockNumber,
        chainId: network.chainId.toString(),
        name: network.name
      });
      return true;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  }
}

export const blockchainService = new BlockchainService();
export default blockchainService;
