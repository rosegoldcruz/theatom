const { ethers } = require('ethers');
const EventEmitter = require('events');

/**
 * SCANNER AGENT - The Eyes of the Operation
 * 
 * Responsibilities:
 * - Continuously scan multiple DEXs for price differences
 * - Calculate potential profits with gas costs
 * - Emit opportunities to other agents
 * - Maintain real-time price feeds
 */
class ScannerAgent extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.isScanning = false;
    this.priceFeeds = new Map();
    this.opportunities = [];
    this.scanCount = 0;
    this.lastScanTime = 0;
    
    // DEX configurations
    this.dexes = [
      {
        name: 'Uniswap V2',
        router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        fee: 0.003 // 0.3%
      },
      {
        name: 'SushiSwap',
        router: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
        factory: '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac',
        fee: 0.003 // 0.3%
      },
      {
        name: 'Curve',
        router: '0x8301AE4fc9c624d1D396cbDAa1ed877821D7C511',
        factory: '0x0959158b6040D32d04c301A72CBFD6b39E21c9AE',
        fee: 0.0004 // 0.04%
      }
    ];
    
    // Trading pairs to monitor
    this.pairs = [
      {
        symbol: 'ETH/USDC',
        tokenA: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        tokenB: '0xA0b86a33E6441b8435b662f0E2d0a8b0e6E6E6E6', // USDC
        decimalsA: 18,
        decimalsB: 6,
        minVolume: ethers.parseEther("1.0")
      },
      {
        symbol: 'WBTC/USDC',
        tokenA: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
        tokenB: '0xA0b86a33E6441b8435b662f0E2d0a8b0e6E6E6E6', // USDC
        decimalsA: 8,
        decimalsB: 6,
        minVolume: ethers.parseUnits("0.1", 8)
      },
      {
        symbol: 'UNI/ETH',
        tokenA: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // UNI
        tokenB: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        decimalsA: 18,
        decimalsB: 18,
        minVolume: ethers.parseEther("10.0")
      }
    ];
    
    console.log('🔍 Scanner Agent initialized');
    console.log(`📊 Monitoring ${this.pairs.length} pairs across ${this.dexes.length} DEXs`);
  }

  async start() {
    if (this.isScanning) {
      console.log('⚠️  Scanner already running');
      return;
    }

    console.log('🚀 Starting Scanner Agent...');
    this.isScanning = true;
    this.emit('started');
    
    // Start scanning loop
    this.scanLoop();
    
    console.log('✅ Scanner Agent started');
  }

  async stop() {
    console.log('🛑 Stopping Scanner Agent...');
    this.isScanning = false;
    this.emit('stopped');
    console.log('✅ Scanner Agent stopped');
  }

  async scanLoop() {
    while (this.isScanning) {
      try {
        const startTime = Date.now();
        await this.scanAllPairs();
        this.lastScanTime = Date.now() - startTime;
        this.scanCount++;
        
        // Emit scan statistics
        this.emit('scanComplete', {
          scanCount: this.scanCount,
          scanTime: this.lastScanTime,
          opportunitiesFound: this.opportunities.length
        });
        
        // Wait before next scan
        await this.sleep(this.config.scanInterval || 3000);
        
      } catch (error) {
        console.error('❌ Scanner error:', error.message);
        this.emit('error', error);
        await this.sleep(5000); // Wait longer on error
      }
    }
  }

  async scanAllPairs() {
    const scanPromises = this.pairs.map(pair => this.scanPair(pair));
    const results = await Promise.allSettled(scanPromises);
    
    // Process results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        this.processOpportunity(result.value);
      } else if (result.status === 'rejected') {
        console.error(`❌ Failed to scan ${this.pairs[index].symbol}:`, result.reason.message);
      }
    });
  }

  async scanPair(pair) {
    // Get prices from all DEXs for this pair
    const pricePromises = this.dexes.map(dex => this.getPriceFromDex(pair, dex));
    const prices = await Promise.allSettled(pricePromises);
    
    const validPrices = prices
      .filter(p => p.status === 'fulfilled')
      .map((p, index) => ({
        dex: this.dexes[index],
        price: p.value,
        timestamp: Date.now()
      }));

    if (validPrices.length < 2) {
      return null; // Need at least 2 prices to compare
    }

    // Find best arbitrage opportunity
    return this.findBestArbitrage(pair, validPrices);
  }

  async getPriceFromDex(pair, dex) {
    // Simulate price fetching - in production, use actual DEX APIs
    const basePrice = 2000 + Math.random() * 100; // ETH price around $2000-2100
    const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
    const price = basePrice * (1 + variation);
    
    return {
      buy: price,
      sell: price * (1 - dex.fee), // Account for DEX fees
      liquidity: ethers.parseEther("1000"), // Mock liquidity
      gasEstimate: 150000 // Estimated gas for swap
    };
  }

  findBestArbitrage(pair, prices) {
    let bestOpportunity = null;
    let maxProfit = 0;

    // Compare all price combinations
    for (let i = 0; i < prices.length; i++) {
      for (let j = 0; j < prices.length; j++) {
        if (i === j) continue;

        const buyDex = prices[i];
        const sellDex = prices[j];
        
        // Calculate potential profit
        const buyPrice = buyDex.price.buy;
        const sellPrice = sellDex.price.sell;
        
        if (sellPrice > buyPrice) {
          const volume = pair.minVolume;
          const grossProfit = (sellPrice - buyPrice) * parseFloat(ethers.formatEther(volume));
          const gasCost = this.estimateGasCost(buyDex.price.gasEstimate + sellDex.price.gasEstimate);
          const netProfit = grossProfit - gasCore;
          
          if (netProfit > maxProfit && netProfit > this.config.minProfitThreshold) {
            maxProfit = netProfit;
            bestOpportunity = {
              pair: pair.symbol,
              tokenA: pair.tokenA,
              tokenB: pair.tokenB,
              buyDex: buyDex.dex.name,
              sellDex: sellDex.dex.name,
              buyPrice,
              sellPrice,
              volume,
              grossProfit,
              gasCore,
              netProfit,
              profitPercentage: (netProfit / (buyPrice * parseFloat(ethers.formatEther(volume)))) * 100,
              timestamp: Date.now(),
              confidence: this.calculateConfidence(buyDex, sellDex)
            };
          }
        }
      }
    }

    return bestOpportunity;
  }

  estimateGasCost(gasUnits) {
    const gasPrice = 20; // 20 gwei
    const ethPrice = 2000; // $2000 per ETH
    return (gasUnits * gasPrice * 1e-9) * ethPrice;
  }

  calculateConfidence(buyDex, sellDex) {
    // Calculate confidence based on liquidity and price stability
    const liquidityScore = Math.min(
      parseFloat(ethers.formatEther(buyDex.price.liquidity)) / 1000,
      1
    );
    
    return Math.min(liquidityScore * 100, 95); // Max 95% confidence
  }

  processOpportunity(opportunity) {
    if (!opportunity) return;

    // Add to opportunities list
    this.opportunities.unshift(opportunity);
    
    // Keep only last 100 opportunities
    if (this.opportunities.length > 100) {
      this.opportunities = this.opportunities.slice(0, 100);
    }

    // Emit opportunity to other agents
    this.emit('opportunityFound', opportunity);
    
    console.log(`💰 Opportunity: ${opportunity.pair} - Profit: $${opportunity.netProfit.toFixed(2)} (${opportunity.profitPercentage.toFixed(2)}%)`);
  }

  getStats() {
    return {
      isScanning: this.isScanning,
      scanCount: this.scanCount,
      lastScanTime: this.lastScanTime,
      opportunitiesFound: this.opportunities.length,
      avgScanTime: this.scanCount > 0 ? this.lastScanTime : 0,
      pairsMonitored: this.pairs.length,
      dexesMonitored: this.dexes.length
    };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = ScannerAgent;
