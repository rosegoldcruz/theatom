const blockchainService = require('./blockchainService');
const priceService = require('./priceService');
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
    new winston.transports.File({ filename: 'logs/arbitrage.log' })
  ]
});

class ArbitrageService {
  constructor() {
    this.isRunning = false;
    this.config = {
      minProfitThreshold: 0.01,
      maxGasPrice: 50,
      autoExecute: false,
      networks: ['base_sepolia'],
      pairs: ['ETH/USDC', 'USDC/DAI'],
      maxTradeAmount: 1.0,
      slippageTolerance: 1.0
    };
    this.stats = {
      opportunitiesScanned: 0,
      tradesExecuted: 0,
      totalProfit: 0,
      successfulTrades: 0,
      failedTrades: 0
    };
  }

  /**
   * Start the arbitrage monitoring system
   */
  async start(config = {}) {
    try {
      if (this.isRunning) {
        throw new Error('Arbitrage service is already running');
      }

      // Update configuration
      this.config = { ...this.config, ...config };
      this.isRunning = true;

      logger.info('Starting arbitrage service with config:', this.config);

      // Start monitoring opportunities
      this.monitoringInterval = setInterval(async () => {
        await this.scanForOpportunities();
      }, 10000); // Scan every 10 seconds

      // Start blockchain event listening
      blockchainService.startEventListening((event) => {
        this.handleBlockchainEvent(event);
      });

      return {
        success: true,
        message: 'Arbitrage service started successfully',
        config: this.config
      };
    } catch (error) {
      logger.error('Error starting arbitrage service:', error);
      throw error;
    }
  }

  /**
   * Stop the arbitrage monitoring system
   */
  async stop() {
    try {
      if (!this.isRunning) {
        throw new Error('Arbitrage service is not running');
      }

      this.isRunning = false;

      // Clear monitoring interval
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
        this.monitoringInterval = null;
      }

      // Stop blockchain event listening
      blockchainService.stopEventListening();

      logger.info('Arbitrage service stopped');

      return {
        success: true,
        message: 'Arbitrage service stopped successfully',
        stats: this.stats
      };
    } catch (error) {
      logger.error('Error stopping arbitrage service:', error);
      throw error;
    }
  }

  /**
   * Scan for arbitrage opportunities
   */
  async scanForOpportunities() {
    try {
      if (!this.isRunning) return;

      logger.info('Scanning for arbitrage opportunities...');
      
      const allOpportunities = [];

      // Scan each configured pair
      for (const pair of this.config.pairs) {
        const opportunities = await priceService.calculateArbitrageOpportunities(
          pair,
          this.config.minProfitThreshold
        );
        
        allOpportunities.push(...opportunities);
        this.stats.opportunitiesScanned += opportunities.length;
      }

      // Filter opportunities by profitability and gas costs
      const viableOpportunities = allOpportunities.filter(opp => 
        opp.netProfit >= this.config.minProfitThreshold &&
        opp.confidence >= 70
      );

      logger.info(`Found ${viableOpportunities.length} viable opportunities`);

      // Auto-execute if enabled
      if (this.config.autoExecute && viableOpportunities.length > 0) {
        const bestOpportunity = viableOpportunities[0]; // Already sorted by profit
        await this.executeArbitrage(bestOpportunity);
      }

      return viableOpportunities;
    } catch (error) {
      logger.error('Error scanning for opportunities:', error);
      return [];
    }
  }

  /**
   * Execute an arbitrage trade
   */
  async executeArbitrage(opportunity) {
    try {
      logger.info('Executing arbitrage trade:', opportunity);

      // Validate opportunity is still valid
      if (Date.now() > opportunity.expiresAt) {
        throw new Error('Opportunity has expired');
      }

      // Check gas price
      const contractData = await blockchainService.getContractData();
      const currentGasPrice = parseFloat(contractData.gasPrice);
      
      if (currentGasPrice > this.config.maxGasPrice) {
        throw new Error(`Gas price too high: ${currentGasPrice} > ${this.config.maxGasPrice}`);
      }

      // Calculate trade amount (use smaller of liquidity or max trade amount)
      const tradeAmount = Math.min(
        opportunity.liquidity * 0.1, // Use 10% of available liquidity
        this.config.maxTradeAmount
      );

      // Execute the trade via blockchain service
      const result = await blockchainService.executeArbitrage({
        token: this.getTokenAddress(opportunity.pair),
        amount: tradeAmount,
        slippage: this.config.slippageTolerance
      });

      // Update stats
      this.stats.tradesExecuted++;
      if (result.success) {
        this.stats.successfulTrades++;
        this.stats.totalProfit += opportunity.netProfit;
      } else {
        this.stats.failedTrades++;
      }

      logger.info('Arbitrage trade executed:', result);
      return result;
    } catch (error) {
      logger.error('Error executing arbitrage:', error);
      this.stats.failedTrades++;
      throw error;
    }
  }

  /**
   * Simulate an arbitrage trade
   */
  async simulateTrade(params) {
    try {
      const { token, amount, slippage = 1.0 } = params;

      // Get current market data
      const tokenPair = this.getTokenPair(token);
      const opportunities = await priceService.calculateArbitrageOpportunities(tokenPair);
      
      if (opportunities.length === 0) {
        return {
          estimatedProfit: 0,
          estimatedGasCost: 0.008,
          netProfit: -0.008,
          successProbability: 0,
          risks: ['No arbitrage opportunities found']
        };
      }

      const bestOpportunity = opportunities[0];
      
      // Calculate estimated costs and profits
      const estimatedProfit = (bestOpportunity.profitPercentage / 100) * amount;
      const estimatedGasCost = 0.008; // Mock gas cost
      const slippageCost = (slippage / 100) * amount;
      const netProfit = estimatedProfit - estimatedGasCost - slippageCost;

      // Calculate success probability based on various factors
      let successProbability = bestOpportunity.confidence;
      
      // Adjust for trade size
      if (amount > bestOpportunity.liquidity * 0.1) {
        successProbability -= 20; // Large trades are riskier
      }
      
      // Adjust for market volatility
      successProbability = Math.max(0, Math.min(100, successProbability));

      // Identify risks
      const risks = [];
      if (netProfit < 0.01) risks.push('Low profit margin');
      if (amount > bestOpportunity.liquidity * 0.05) risks.push('High slippage risk');
      if (successProbability < 80) risks.push('Low success probability');

      return {
        estimatedProfit,
        estimatedGasCost,
        netProfit,
        successProbability,
        risks,
        opportunity: bestOpportunity
      };
    } catch (error) {
      logger.error('Error simulating trade:', error);
      throw error;
    }
  }

  /**
   * Handle blockchain events
   */
  handleBlockchainEvent(event) {
    try {
      logger.info('Handling blockchain event:', event);

      switch (event.type) {
        case 'trade_executed':
          // Update stats when a trade is executed
          this.stats.tradesExecuted++;
          if (event.data.profit > 0) {
            this.stats.successfulTrades++;
            this.stats.totalProfit += parseFloat(event.data.profit);
          } else {
            this.stats.failedTrades++;
          }
          break;

        case 'opportunity_detected':
          // Log opportunity detection
          logger.info('New opportunity detected:', event.data);
          break;

        case 'new_block':
          // Trigger opportunity scan on new blocks
          if (this.isRunning) {
            this.scanForOpportunities();
          }
          break;
      }
    } catch (error) {
      logger.error('Error handling blockchain event:', error);
    }
  }

  /**
   * Get token address from pair
   */
  getTokenAddress(pair) {
    // Mock token addresses - in production, use a proper token registry
    const tokenAddresses = {
      'ETH/USDC': '0x0000000000000000000000000000000000000000', // ETH
      'USDC/DAI': '0xA0b86a33E6441b8C4505B6B8C0C4C0C4C0C4C0C4' // USDC
    };
    
    return tokenAddresses[pair] || '0x0000000000000000000000000000000000000000';
  }

  /**
   * Get token pair from address
   */
  getTokenPair(tokenAddress) {
    // Mock reverse lookup - in production, use a proper token registry
    const addressToPair = {
      '0x0000000000000000000000000000000000000000': 'ETH/USDC',
      '0xA0b86a33E6441b8C4505B6B8C0C4C0C4C0C4C0C4': 'USDC/DAI'
    };
    
    return addressToPair[tokenAddress] || 'ETH/USDC';
  }

  /**
   * Get current service status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      config: this.config,
      stats: this.stats,
      timestamp: Date.now()
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    logger.info('Configuration updated:', this.config);
    return this.config;
  }
}

// Export singleton instance
const arbitrageService = new ArbitrageService();
module.exports = arbitrageService;
