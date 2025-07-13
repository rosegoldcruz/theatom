const ArbitrageBot = require('./ArbBot.cjs');
const config = require('./config.cjs');

class BotLauncher {
  constructor() {
    this.bot = null;
  }

  async start() {
    try {
      console.log('🤖 Initializing Arbitrage Bot...');
      console.log('📊 Configuration:');
      console.log(`   RPC URL: ${config.rpcUrl}`);
      console.log(`   Contract: ${config.contractAddress}`);
      console.log(`   Min Profit: $${config.minProfitThreshold}`);
      console.log(`   Scan Interval: ${config.scanInterval}ms`);
      
      this.bot = new ArbitrageBot(config);
      await this.bot.start();
      
      // Setup graceful shutdown
      this.setupShutdown();
      
      // Start status reporting
      this.startStatusReporting();
      
    } catch (error) {
      console.error('❌ Failed to start bot:', error.message);
      process.exit(1);
    }
  }

  setupShutdown() {
    const shutdown = async () => {
      console.log('\n🛑 Shutting down bot...');
      if (this.bot) {
        await this.bot.stop();
      }
      console.log('👋 Bot shutdown complete');
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }

  startStatusReporting() {
    setInterval(() => {
      if (this.bot) {
        const stats = this.bot.getStats();
        console.log('\n📈 Bot Status:');
        console.log(`   Running: ${stats.isRunning ? '✅' : '❌'}`);
        console.log(`   Total Trades: ${stats.totalTrades}`);
        console.log(`   Successful: ${stats.successfulTrades}`);
        console.log(`   Failed: ${stats.failedTrades}`);
        console.log(`   Success Rate: ${stats.successRate}`);
        console.log(`   Total Profit: $${stats.totalProfit.toFixed(2)}`);
      }
    }, 30000); // Report every 30 seconds
  }
}

// Start the bot if this file is run directly
if (require.main === module) {
  const launcher = new BotLauncher();
  launcher.start().catch(console.error);
}

module.exports = BotLauncher;
