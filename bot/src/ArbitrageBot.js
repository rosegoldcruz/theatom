const express = require('express');
const cron = require('node-cron');
const dotenv = require('dotenv');
const PriceScanner = require('./PriceScanner');
const OpportunityFinder = require('./OpportunityFinder');
const ExecutionEngine = require('./ExecutionEngine');
const FlashLoanArbitrageEngine = require('./FlashLoanArbitrageEngine');
const ConfigManager = require('./ConfigManager');
const Logger = require('./Logger');
const HealthMonitor = require('./HealthMonitor');

// Load environment variables
dotenv.config();

class ArbitrageBot {
  constructor() {
    this.logger = new Logger('ArbitrageBot');
    this.config = new ConfigManager();
    this.priceScanner = new PriceScanner(this.config);
    this.opportunityFinder = new OpportunityFinder(this.config);
    this.executionEngine = new ExecutionEngine(this.config);
    this.flashLoanEngine = new FlashLoanArbitrageEngine(this.config);
    this.healthMonitor = new HealthMonitor();
    
    this.isRunning = false;
    this.stats = {
      startTime: Date.now(),
      totalScans: 0,
      opportunitiesFound: 0,
      tradesExecuted: 0,
      successfulTrades: 0,
      totalProfit: 0,
      totalGasSpent: 0,
      errors: 0
    };

    // Health check server
    this.app = express();
    this.setupHealthEndpoints();
  }

  async start() {
    try {
      this.logger.info('🚀 Starting ATOM Arbitrage Bot...');
      
      // Initialize all components
      await this.priceScanner.initialize();
      await this.executionEngine.initialize();
      await this.flashLoanEngine.initialize();
      
      this.isRunning = true;
      
      // Start health monitor
      this.healthMonitor.start();
      
      // Start health check server
      const port = process.env.BOT_PORT || 3002;
      this.app.listen(port, () => {
        this.logger.info(`🏥 Health check server running on port ${port}`);
      });

      // Schedule main scanning loop
      const scanInterval = this.config.get('scanInterval', '*/10 * * * * *'); // Every 10 seconds
      cron.schedule(scanInterval, () => {
        if (this.isRunning) {
          this.scanAndExecute().catch(error => {
            this.logger.error('Error in scan cycle:', error);
            this.stats.errors++;
          });
        }
      });

      // Schedule periodic reporting
      cron.schedule('0 */5 * * * *', () => { // Every 5 minutes
        this.reportStats();
      });

      // Schedule heartbeat to backend
      cron.schedule('*/30 * * * * *', () => { // Every 30 seconds
        this.sendHeartbeat().catch(error => {
          this.logger.error('Failed to send heartbeat:', error);
        });
      });

      this.logger.info('✅ ATOM Arbitrage Bot started successfully!');
      this.logger.info(`📊 Scanning every ${this.config.get('scanInterval', '10 seconds')}`);
      this.logger.info(`💰 Min profit threshold: ${this.config.get('minProfitThreshold', 0.01)} ETH`);
      this.logger.info(`⛽ Max gas price: ${this.config.get('maxGasPrice', 50)} gwei`);

    } catch (error) {
      this.logger.error('Failed to start bot:', error);
      process.exit(1);
    }
  }

  async scanAndExecute() {
    const startTime = Date.now();
    this.stats.totalScans++;

    try {
      this.logger.debug('🔍 Scanning for arbitrage opportunities...');

      // 1. Get latest prices from all DEXes
      const prices = await this.priceScanner.getAllPrices();
      
      if (!prices || Object.keys(prices).length === 0) {
        this.logger.warn('No price data available, skipping scan');
        return;
      }

      // 2. Find arbitrage opportunities
      const opportunities = await this.opportunityFinder.findOpportunities(prices);
      
      if (opportunities.length === 0) {
        this.logger.debug('No profitable opportunities found');
        return;
      }

      this.stats.opportunitiesFound += opportunities.length;
      this.logger.info(`💡 Found ${opportunities.length} arbitrage opportunities`);

      // 3. Execute the most profitable opportunity
      const bestOpportunity = opportunities[0]; // Already sorted by profitability

      this.logger.info(`🎯 Executing best opportunity:`, {
        pair: `${bestOpportunity.tokenA}/${bestOpportunity.tokenB}`,
        buyDex: bestOpportunity.buyDex,
        sellDex: bestOpportunity.sellDex,
        expectedProfit: bestOpportunity.expectedProfit,
        profitMargin: bestOpportunity.profitMargin,
        useFlashLoan: bestOpportunity.useFlashLoan,
        flashLoanAmount: bestOpportunity.flashLoanAmount
      });

      // Choose execution method based on opportunity
      let result;
      if (bestOpportunity.useFlashLoan && bestOpportunity.flashLoanAmount > bestOpportunity.amount) {
        this.logger.info(`💰 Using flash loan: ${bestOpportunity.flashLoanAmount} ETH`);
        result = await this.flashLoanEngine.executeFlashLoanArbitrage(bestOpportunity);
      } else {
        this.logger.info(`💳 Using regular execution: ${bestOpportunity.amount} ETH`);
        result = await this.executionEngine.execute(bestOpportunity);
      }
      
      this.stats.tradesExecuted++;
      
      if (result.success) {
        this.stats.successfulTrades++;
        this.stats.totalProfit += parseFloat(result.profit || 0);
        this.stats.totalGasSpent += parseFloat(result.gasSpent || 0);
        
        this.logger.info('✅ Trade executed successfully!', {
          txHash: result.transactionHash,
          profit: result.profit,
          gasUsed: result.gasUsed
        });
      } else {
        this.logger.error('❌ Trade execution failed:', result.error);
      }

    } catch (error) {
      this.logger.error('Error in scan and execute cycle:', error);
      this.stats.errors++;
    }

    const duration = Date.now() - startTime;
    this.logger.debug(`⏱️ Scan cycle completed in ${duration}ms`);
  }

  setupHealthEndpoints() {
    this.app.get('/health', (req, res) => {
      const uptime = Date.now() - this.stats.startTime;
      const successRate = this.stats.tradesExecuted > 0 
        ? (this.stats.successfulTrades / this.stats.tradesExecuted * 100).toFixed(2)
        : 0;

      res.json({
        status: 'healthy',
        uptime: uptime,
        isRunning: this.isRunning,
        stats: {
          ...this.stats,
          successRate: `${successRate}%`,
          avgProfitPerTrade: this.stats.successfulTrades > 0 
            ? (this.stats.totalProfit / this.stats.successfulTrades).toFixed(4)
            : 0
        },
        timestamp: new Date().toISOString()
      });
    });

    this.app.get('/stats', (req, res) => {
      res.json(this.stats);
    });

    this.app.post('/stop', (req, res) => {
      this.stop();
      res.json({ message: 'Bot stopped' });
    });

    this.app.post('/start', (req, res) => {
      if (!this.isRunning) {
        this.isRunning = true;
        res.json({ message: 'Bot started' });
      } else {
        res.json({ message: 'Bot already running' });
      }
    });
  }

  async sendHeartbeat() {
    try {
      const axios = require('axios');
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

      const heartbeatData = {
        stats: this.stats,
        health: this.healthMonitor.getHealthStatus(),
        timestamp: new Date().toISOString()
      };

      await axios.post(`${backendUrl}/api/bot/heartbeat`, heartbeatData, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      this.logger.debug('Heartbeat sent successfully');
    } catch (error) {
      this.logger.error('Failed to send heartbeat:', error.message);
    }
  }

  reportStats() {
    const uptime = Date.now() - this.stats.startTime;
    const uptimeHours = (uptime / (1000 * 60 * 60)).toFixed(2);
    const successRate = this.stats.tradesExecuted > 0
      ? (this.stats.successfulTrades / this.stats.tradesExecuted * 100).toFixed(2)
      : 0;

    this.logger.info('📊 Bot Performance Report:', {
      uptime: `${uptimeHours} hours`,
      totalScans: this.stats.totalScans,
      opportunitiesFound: this.stats.opportunitiesFound,
      tradesExecuted: this.stats.tradesExecuted,
      successRate: `${successRate}%`,
      totalProfit: `${this.stats.totalProfit.toFixed(4)} ETH`,
      totalGasSpent: `${this.stats.totalGasSpent.toFixed(4)} ETH`,
      netProfit: `${(this.stats.totalProfit - this.stats.totalGasSpent).toFixed(4)} ETH`,
      errors: this.stats.errors
    });
  }

  stop() {
    this.logger.info('🛑 Stopping ATOM Arbitrage Bot...');
    this.isRunning = false;
    this.healthMonitor.stop();
    this.reportStats();
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  if (global.bot) {
    global.bot.stop();
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  if (global.bot) {
    global.bot.stop();
  }
  process.exit(0);
});

// Start the bot if this file is run directly
if (require.main === module) {
  const bot = new ArbitrageBot();
  global.bot = bot;
  bot.start().catch(error => {
    console.error('Failed to start bot:', error);
    process.exit(1);
  });
}

module.exports = ArbitrageBot;
