const { ethers } = require('ethers');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/blockchain.log' })
  ]
});

// Contract ABI - This should be imported from your compiled contracts
const ARBITRAGE_ABI = [
  // TODO: Add your actual contract ABI here
  "function owner() view returns (address)",
  "function totalTrades() view returns (uint256)",
  "function totalProfit() view returns (uint256)",
  "function successfulTrades() view returns (uint256)",
  "function paused() view returns (bool)",
  "function executeArbitrage(address token, uint256 amount) external",
  "event ArbitrageExecuted(address indexed token, uint256 profit, uint256 timestamp)",
  "event OpportunityDetected(string pair, uint256 profitEstimate, uint256 timestamp)"
];

class BlockchainService {
  constructor() {
    this.provider = null;
    this.contract = null;
    this.wallet = null;
    this.wsProvider = null;
    this.wsContract = null;
    
    this.initialize();
  }

  async initialize() {
    try {
      // HTTP Provider for regular calls
      this.provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL);
      
      // WebSocket Provider for real-time events
      if (process.env.BASE_SEPOLIA_WSS_URL) {
        this.wsProvider = new ethers.WebSocketProvider(process.env.BASE_SEPOLIA_WSS_URL);
      }

      // Initialize contract
      if (process.env.CONTRACT_ADDRESS) {
        this.contract = new ethers.Contract(
          process.env.CONTRACT_ADDRESS, 
          ARBITRAGE_ABI, 
          this.provider
        );

        if (this.wsProvider) {
          this.wsContract = new ethers.Contract(
            process.env.CONTRACT_ADDRESS,
            ARBITRAGE_ABI,
            this.wsProvider
          );
        }
      }

      // Initialize wallet if private key is provided
      if (process.env.PRIVATE_KEY) {
        this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        if (this.contract) {
          this.contract = this.contract.connect(this.wallet);
        }
      }

      logger.info('Blockchain service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize blockchain service:', error);
      throw error;
    }
  }

  /**
   * Get contract data for dashboard
   */
  async getContractData() {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const [
        owner,
        totalTrades,
        totalProfit,
        successfulTrades,
        isPaused,
        blockNumber,
        gasPrice,
        contractBalance
      ] = await Promise.all([
        this.contract.owner(),
        this.contract.totalTrades().catch(() => 0),
        this.contract.totalProfit().catch(() => 0),
        this.contract.successfulTrades().catch(() => 0),
        this.contract.paused().catch(() => false),
        this.provider.getBlockNumber(),
        this.provider.getFeeData(),
        this.provider.getBalance(process.env.CONTRACT_ADDRESS)
      ]);

      return {
        owner,
        totalTrades: Number(totalTrades),
        totalProfit: parseFloat(ethers.formatEther(totalProfit)),
        successfulTrades: Number(successfulTrades),
        successRate: Number(totalTrades) > 0 ? (Number(successfulTrades) / Number(totalTrades)) * 100 : 0,
        contractBalance: parseFloat(ethers.formatEther(contractBalance)),
        isContractActive: !isPaused,
        lastBlockNumber: blockNumber,
        gasPrice: ethers.formatUnits(gasPrice.gasPrice, 'gwei'),
        networkStatus: 'connected'
      };
    } catch (error) {
      logger.error('Error fetching contract data:', error);
      return {
        owner: null,
        totalTrades: 0,
        totalProfit: 0,
        successfulTrades: 0,
        successRate: 0,
        contractBalance: 0,
        isContractActive: false,
        lastBlockNumber: 0,
        gasPrice: '0',
        networkStatus: 'error',
        error: error.message
      };
    }
  }

  /**
   * Execute arbitrage trade
   */
  async executeArbitrage(params) {
    try {
      if (!this.wallet || !this.contract) {
        throw new Error('Wallet or contract not initialized');
      }

      const { token, amount } = params;
      
      // Validate parameters
      if (!ethers.isAddress(token)) {
        throw new Error('Invalid token address');
      }

      if (!amount || amount <= 0) {
        throw new Error('Invalid amount');
      }

      logger.info('Executing arbitrage trade:', { token, amount });

      // Execute the trade
      const tx = await this.contract.executeArbitrage(token, ethers.parseEther(amount.toString()));
      
      logger.info('Transaction sent:', { hash: tx.hash });

      // Wait for confirmation
      const receipt = await tx.wait();
      
      logger.info('Transaction confirmed:', { 
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      });

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        timestamp: Date.now()
      };
    } catch (error) {
      logger.error('Error executing arbitrage:', error);
      throw error;
    }
  }

  /**
   * Start listening for blockchain events
   */
  startEventListening(callback) {
    if (!this.wsContract) {
      logger.warn('WebSocket contract not available, cannot listen for events');
      return;
    }

    try {
      this.wsContract.on('ArbitrageExecuted', (token, profit, timestamp, event) => {
        const eventData = {
          type: 'trade_executed',
          data: {
            token,
            profit: ethers.formatEther(profit),
            timestamp: Number(timestamp) * 1000,
            txHash: event.transactionHash,
            blockNumber: event.blockNumber
          }
        };
        
        logger.info('ArbitrageExecuted event:', eventData);
        callback(eventData);
      });

      this.wsContract.on('OpportunityDetected', (pair, profitEstimate, timestamp, event) => {
        const eventData = {
          type: 'opportunity_detected',
          data: {
            pair,
            profitEstimate: ethers.formatEther(profitEstimate),
            timestamp: Number(timestamp) * 1000,
            txHash: event.transactionHash,
            blockNumber: event.blockNumber
          }
        };
        
        logger.info('OpportunityDetected event:', eventData);
        callback(eventData);
      });

      logger.info('Started listening for blockchain events');
    } catch (error) {
      logger.error('Error starting event listening:', error);
    }
  }

  /**
   * Stop listening for blockchain events
   */
  stopEventListening() {
    if (this.wsContract) {
      this.wsContract.removeAllListeners();
      logger.info('Stopped listening for blockchain events');
    }
  }

  /**
   * Test blockchain connection
   */
  async testConnection() {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      const network = await this.provider.getNetwork();
      
      logger.info('Blockchain connection test successful:', {
        blockNumber,
        chainId: network.chainId.toString(),
        name: network.name
      });
      
      return {
        success: true,
        blockNumber,
        chainId: network.chainId.toString(),
        networkName: network.name
      };
    } catch (error) {
      logger.error('Blockchain connection test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
const blockchainService = new BlockchainService();
module.exports = blockchainService;
