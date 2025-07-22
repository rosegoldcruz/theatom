const axios = require('axios');
const { ethers } = require('ethers');
const Logger = require('./Logger');

class ExecutionEngine {
  constructor(config) {
    this.config = config;
    this.logger = new Logger('ExecutionEngine');
    
    // Backend API configuration
    this.backendUrl = process.env.BACKEND_URL || 'http://152.42.234.243:8000';
    this.walletAddress = process.env.WALLET_ADDRESS;
    
    // Execution settings
    this.maxConcurrentTrades = parseInt(this.config.get('maxConcurrentTrades', 1));
    this.executionTimeout = parseInt(this.config.get('executionTimeout', 60000)); // 60 seconds
    this.retryAttempts = parseInt(this.config.get('retryAttempts', 3));
    
    this.activeTrades = new Map();
    this.tradeHistory = [];
  }

  async initialize() {
    this.logger.info('🔧 Initializing Execution Engine...');
    
    try {
      // Test backend connection
      const healthResponse = await axios.get(`${this.backendUrl}/api/health`, {
        timeout: 5000
      });
      
      if (healthResponse.status === 200) {
        this.logger.info('✅ Backend connection established');
      } else {
        throw new Error('Backend health check failed');
      }

      // Validate wallet address
      if (!this.walletAddress || !ethers.isAddress(this.walletAddress)) {
        throw new Error('Invalid or missing wallet address');
      }

      this.logger.info(`💼 Using wallet: ${this.walletAddress}`);
      this.logger.info('✅ Execution Engine initialized successfully');

    } catch (error) {
      this.logger.error('Failed to initialize Execution Engine:', error);
      throw error;
    }
  }

  async execute(opportunity) {
    const tradeId = this.generateTradeId();
    
    try {
      this.logger.info(`🚀 Executing trade ${tradeId}:`, {
        pair: `${opportunity.tokenA}/${opportunity.tokenB}`,
        buyDex: opportunity.buyDex,
        sellDex: opportunity.sellDex,
        expectedProfit: opportunity.expectedProfit
      });

      // Check if we can execute (not too many concurrent trades)
      if (this.activeTrades.size >= this.maxConcurrentTrades) {
        this.logger.warn('Max concurrent trades reached, skipping execution');
        return {
          success: false,
          error: 'Max concurrent trades reached'
        };
      }

      // Add to active trades
      this.activeTrades.set(tradeId, {
        opportunity,
        startTime: Date.now(),
        status: 'executing'
      });

      // Execute the trade
      const result = await this.executeWithRetry(opportunity, tradeId);
      
      // Remove from active trades
      this.activeTrades.delete(tradeId);
      
      // Add to history
      this.tradeHistory.push({
        tradeId,
        opportunity,
        result,
        timestamp: Date.now()
      });

      // Keep only last 100 trades in memory
      if (this.tradeHistory.length > 100) {
        this.tradeHistory = this.tradeHistory.slice(-100);
      }

      return result;

    } catch (error) {
      this.logger.error(`Trade ${tradeId} failed:`, error);
      this.activeTrades.delete(tradeId);
      
      return {
        success: false,
        error: error.message,
        tradeId
      };
    }
  }

  async executeWithRetry(opportunity, tradeId) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        this.logger.debug(`Attempt ${attempt}/${this.retryAttempts} for trade ${tradeId}`);
        
        const result = await this.executeTrade(opportunity);
        
        if (result.success) {
          this.logger.info(`✅ Trade ${tradeId} succeeded on attempt ${attempt}`);
          return result;
        } else {
          lastError = new Error(result.error || 'Trade execution failed');
          this.logger.warn(`Attempt ${attempt} failed:`, result.error);
        }
        
      } catch (error) {
        lastError = error;
        this.logger.warn(`Attempt ${attempt} threw error:`, error.message);
      }

      // Wait before retry (exponential backoff)
      if (attempt < this.retryAttempts) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s...
        this.logger.debug(`Waiting ${delay}ms before retry...`);
        await this.sleep(delay);
      }
    }

    throw lastError || new Error('All retry attempts failed');
  }

  async executeTrade(opportunity) {
    try {
      // Prepare the execution request
      const executeRequest = {
        walletAddress: this.walletAddress,
        tokenA: opportunity.tokenA,
        tokenB: opportunity.tokenB,
        amountIn: opportunity.amount.toString(),
        buyDex: opportunity.buyDex,
        sellDex: opportunity.sellDex,
        minProfit: (opportunity.expectedProfit * 0.9).toString() // 10% slippage tolerance
      };

      this.logger.debug('Sending execution request to backend:', executeRequest);

      // Call the backend API
      const response = await axios.post(
        `${this.backendUrl}/api/arbitrage/execute`,
        executeRequest,
        {
          timeout: this.executionTimeout,
          headers: {
            'Content-Type': 'application/json',
            'X-Network-ID': '84532' // Base Sepolia
          }
        }
      );

      if (response.data.success) {
        this.logger.info('✅ Backend execution successful:', response.data.data);
        return {
          success: true,
          transactionHash: response.data.data.transactionHash,
          profit: response.data.data.profit,
          gasUsed: response.data.data.gasUsed,
          gasSpent: this.calculateGasSpent(response.data.data.gasUsed),
          executionId: response.data.data.executionId
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Unknown backend error'
        };
      }

    } catch (error) {
      if (error.response) {
        // Backend returned an error response
        const errorMsg = error.response.data?.error || error.response.statusText;
        this.logger.error('Backend error response:', {
          status: error.response.status,
          error: errorMsg,
          details: error.response.data?.details
        });
        
        return {
          success: false,
          error: errorMsg
        };
      } else if (error.request) {
        // Network error
        this.logger.error('Network error:', error.message);
        return {
          success: false,
          error: 'Network error: Unable to reach backend'
        };
      } else {
        // Other error
        this.logger.error('Execution error:', error.message);
        return {
          success: false,
          error: error.message
        };
      }
    }
  }

  calculateGasSpent(gasUsed) {
    try {
      // Estimate gas spent in ETH
      // This is a rough estimate - actual calculation would need gas price
      const avgGasPrice = ethers.parseUnits('2', 'gwei'); // 2 gwei average
      const gasSpentWei = BigInt(gasUsed) * avgGasPrice;
      return parseFloat(ethers.formatEther(gasSpentWei));
    } catch (error) {
      this.logger.error('Error calculating gas spent:', error);
      return 0.01; // Default estimate
    }
  }

  generateTradeId() {
    return `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get execution statistics
  getStats() {
    const now = Date.now();
    const recentTrades = this.tradeHistory.filter(trade => 
      now - trade.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
    );

    const successfulTrades = recentTrades.filter(trade => trade.result.success);
    const totalProfit = successfulTrades.reduce((sum, trade) => 
      sum + parseFloat(trade.result.profit || 0), 0
    );
    const totalGasSpent = successfulTrades.reduce((sum, trade) => 
      sum + parseFloat(trade.result.gasSpent || 0), 0
    );

    return {
      activeTrades: this.activeTrades.size,
      totalTrades: recentTrades.length,
      successfulTrades: successfulTrades.length,
      successRate: recentTrades.length > 0 
        ? (successfulTrades.length / recentTrades.length * 100).toFixed(2)
        : 0,
      totalProfit: totalProfit.toFixed(4),
      totalGasSpent: totalGasSpent.toFixed(4),
      netProfit: (totalProfit - totalGasSpent).toFixed(4)
    };
  }

  // Get active trades
  getActiveTrades() {
    return Array.from(this.activeTrades.entries()).map(([tradeId, trade]) => ({
      tradeId,
      opportunity: trade.opportunity,
      startTime: trade.startTime,
      duration: Date.now() - trade.startTime,
      status: trade.status
    }));
  }

  // Cancel all active trades (emergency stop)
  async cancelAllTrades() {
    this.logger.warn('🛑 Cancelling all active trades...');
    
    for (const [tradeId, trade] of this.activeTrades.entries()) {
      this.logger.info(`Cancelling trade ${tradeId}`);
      // Note: Actual cancellation would depend on the backend implementation
      this.activeTrades.delete(tradeId);
    }
    
    this.logger.info('All active trades cancelled');
  }
}

module.exports = ExecutionEngine;
