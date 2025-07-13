const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

class ArbitrageBot {
  constructor(config) {
    this.config = config;
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    this.isRunning = false;
    this.opportunities = [];
    this.stats = {
      totalProfit: 0,
      successfulTrades: 0,
      failedTrades: 0,
      totalTrades: 0
    };
    
    this.loadContract();
  }

  loadContract() {
    try {
      const artifactPath = path.join(__dirname, '../artifacts/contracts/AtomArbitrage.sol/AtomArbitrage.json');
      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      
      this.contract = new ethers.Contract(
        this.config.contractAddress,
        artifact.abi,
        this.wallet
      );
      
      console.log('✅ Contract loaded:', this.config.contractAddress);
    } catch (error) {
      console.error('❌ Failed to load contract:', error.message);
      throw error;
    }
  }

  async start() {
    if (this.isRunning) {
      console.log('⚠️  Bot is already running');
      return;
    }

    console.log('🚀 Starting Arbitrage Bot...');
    this.isRunning = true;
    
    // Start monitoring for opportunities
    this.monitorOpportunities();
    
    console.log('✅ Bot started successfully');
  }

  async stop() {
    console.log('🛑 Stopping Arbitrage Bot...');
    this.isRunning = false;
    console.log('✅ Bot stopped');
  }

  async monitorOpportunities() {
    while (this.isRunning) {
      try {
        await this.scanForOpportunities();
        await this.sleep(5000); // Check every 5 seconds
      } catch (error) {
        console.error('❌ Error monitoring opportunities:', error.message);
        await this.sleep(10000); // Wait longer on error
      }
    }
  }

  async scanForOpportunities() {
    // Mock opportunity detection for demo
    const pairs = [
      { tokenA: '0xA0b86a33E6441b8435b662f0E2d0a8b0e6E6E6E6', tokenB: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'ETH/USDC' },
      { tokenA: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', tokenB: '0xA0b86a33E6441b8435b662f0E2d0a8b0e6E6E6E6', symbol: 'WBTC/USDC' },
      { tokenA: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', tokenB: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'UNI/ETH' }
    ];

    for (const pair of pairs) {
      const opportunity = await this.checkArbitrageOpportunity(pair);
      if (opportunity && opportunity.profitable) {
        console.log('💰 Opportunity found:', opportunity);
        await this.executeArbitrage(opportunity);
      }
    }
  }

  async checkArbitrageOpportunity(pair) {
    try {
      // Mock price checking - in real implementation, query DEX APIs
      const basePrice = Math.random() * 1000 + 100;
      const price1 = basePrice;
      const price2 = basePrice * (1 + (Math.random() * 0.04 - 0.02)); // ±2% difference
      
      const amount = ethers.parseEther("1.0");
      const priceDiff = Math.abs(price2 - price1);
      const potentialProfit = priceDiff * 1000; // Simplified calculation
      const gasCost = 50; // Estimated gas cost in USD
      
      const profitable = potentialProfit > gasCost + 10; // Minimum $10 profit
      
      if (profitable) {
        return {
          pair: pair.symbol,
          tokenA: pair.tokenA,
          tokenB: pair.tokenB,
          amount: amount.toString(),
          price1,
          price2,
          potentialProfit,
          gasCost,
          profitable,
          timestamp: Date.now()
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error checking opportunity:', error.message);
      return null;
    }
  }

  async executeArbitrage(opportunity) {
    try {
      console.log('⚡ Executing arbitrage for:', opportunity.pair);
      
      // Prepare arbitrage parameters
      const params = {
        tokenA: opportunity.tokenA,
        tokenB: opportunity.tokenB,
        amountIn: opportunity.amount,
        pathBuy: [opportunity.tokenA, opportunity.tokenB],
        pathSell: [opportunity.tokenB, opportunity.tokenA],
        routerBuy: this.config.uniswapRouter,
        routerSell: this.config.sushiswapRouter,
        minProfit: ethers.parseEther("0.01") // Minimum 0.01 ETH profit
      };

      // Encode parameters for flash loan
      const encodedParams = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "address", "uint256", "address[]", "address[]", "address", "address", "uint256"],
        [
          params.tokenA,
          params.tokenB,
          params.amountIn,
          params.pathBuy,
          params.pathSell,
          params.routerBuy,
          params.routerSell,
          params.minProfit
        ]
      );

      // Execute flash loan arbitrage
      const tx = await this.contract.executeArbitrage(
        opportunity.tokenA,
        opportunity.amount,
        encodedParams,
        {
          gasLimit: 500000,
          gasPrice: ethers.parseUnits('20', 'gwei')
        }
      );

      console.log('📝 Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        console.log('✅ Arbitrage executed successfully');
        this.stats.successfulTrades++;
        this.stats.totalProfit += opportunity.potentialProfit;
      } else {
        console.log('❌ Arbitrage failed');
        this.stats.failedTrades++;
      }
      
      this.stats.totalTrades++;
      
    } catch (error) {
      console.error('❌ Error executing arbitrage:', error.message);
      this.stats.failedTrades++;
      this.stats.totalTrades++;
    }
  }

  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.totalTrades > 0 ? 
        (this.stats.successfulTrades / this.stats.totalTrades * 100).toFixed(2) + '%' : '0%',
      isRunning: this.isRunning
    };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = ArbitrageBot;
