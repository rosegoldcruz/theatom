const axios = require('axios');
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
    new winston.transports.File({ filename: 'logs/price.log' })
  ]
});

class PriceService {
  constructor() {
    this.coingeckoApiKey = process.env.COINGECKO_API_KEY;
    this.baseUrl = 'https://api.coingecko.com/api/v3';
  }

  /**
   * Get current prices for multiple tokens
   */
  async getTokenPrices(tokenIds) {
    try {
      const response = await axios.get(`${this.baseUrl}/simple/price`, {
        params: {
          ids: tokenIds.join(','),
          vs_currencies: 'usd',
          include_24hr_change: true,
          include_last_updated_at: true
        },
        headers: this.coingeckoApiKey ? {
          'X-CG-Demo-API-Key': this.coingeckoApiKey
        } : {}
      });

      return response.data;
    } catch (error) {
      logger.error('Error fetching token prices:', error);
      throw error;
    }
  }

  /**
   * Get DEX prices for arbitrage opportunities
   * This is a mock implementation - in production, you'd integrate with actual DEX APIs
   */
  async getDexPrices(tokenPair, dexes = ['uniswap', 'curve', 'balancer']) {
    try {
      // Mock DEX price data
      const mockPrices = {
        uniswap: {
          'ETH/USDC': { price: 2450.50, liquidity: 150000, fee: 0.3 },
          'USDC/DAI': { price: 1.0005, liquidity: 75000, fee: 0.05 }
        },
        curve: {
          'ETH/USDC': { price: 2455.75, liquidity: 200000, fee: 0.04 },
          'USDC/DAI': { price: 1.0015, liquidity: 100000, fee: 0.04 }
        },
        balancer: {
          'ETH/USDC': { price: 2448.25, liquidity: 80000, fee: 0.25 },
          'USDC/DAI': { price: 1.0008, liquidity: 60000, fee: 0.1 }
        }
      };

      const prices = {};
      for (const dex of dexes) {
        if (mockPrices[dex] && mockPrices[dex][tokenPair]) {
          prices[dex] = {
            ...mockPrices[dex][tokenPair],
            timestamp: Date.now()
          };
        }
      }

      return prices;
    } catch (error) {
      logger.error('Error fetching DEX prices:', error);
      throw error;
    }
  }

  /**
   * Calculate arbitrage opportunities
   */
  async calculateArbitrageOpportunities(tokenPair, minProfitThreshold = 0.01) {
    try {
      const dexPrices = await this.getDexPrices(tokenPair);
      const opportunities = [];

      const dexNames = Object.keys(dexPrices);
      
      // Compare all DEX pairs
      for (let i = 0; i < dexNames.length; i++) {
        for (let j = i + 1; j < dexNames.length; j++) {
          const dexA = dexNames[i];
          const dexB = dexNames[j];
          
          const priceA = dexPrices[dexA].price;
          const priceB = dexPrices[dexB].price;
          
          // Calculate profit in both directions
          const profitAtoB = ((priceB - priceA) / priceA) * 100;
          const profitBtoA = ((priceA - priceB) / priceB) * 100;
          
          if (Math.abs(profitAtoB) >= minProfitThreshold) {
            const buyDex = profitAtoB > 0 ? dexA : dexB;
            const sellDex = profitAtoB > 0 ? dexB : dexA;
            const profit = Math.abs(profitAtoB);
            
            opportunities.push({
              id: `${tokenPair}_${buyDex}_${sellDex}_${Date.now()}`,
              pair: tokenPair,
              buyDex,
              sellDex,
              buyPrice: dexPrices[buyDex].price,
              sellPrice: dexPrices[sellDex].price,
              profitPercentage: profit,
              estimatedGasCost: 0.008, // Mock gas cost
              netProfit: profit - 0.008,
              liquidity: Math.min(dexPrices[buyDex].liquidity, dexPrices[sellDex].liquidity),
              confidence: this.calculateConfidence(profit, dexPrices[buyDex].liquidity),
              timestamp: Date.now(),
              expiresAt: Date.now() + 30000 // 30 seconds
            });
          }
        }
      }

      return opportunities.sort((a, b) => b.netProfit - a.netProfit);
    } catch (error) {
      logger.error('Error calculating arbitrage opportunities:', error);
      throw error;
    }
  }

  /**
   * Calculate confidence score for an opportunity
   */
  calculateConfidence(profitPercentage, liquidity) {
    let confidence = 50; // Base confidence
    
    // Higher profit = higher confidence (up to a point)
    if (profitPercentage > 0.5) confidence += 20;
    else if (profitPercentage > 0.2) confidence += 10;
    else if (profitPercentage > 0.1) confidence += 5;
    
    // Higher liquidity = higher confidence
    if (liquidity > 100000) confidence += 20;
    else if (liquidity > 50000) confidence += 10;
    else if (liquidity > 20000) confidence += 5;
    
    // Cap at 95%
    return Math.min(confidence, 95);
  }

  /**
   * Get network statistics
   */
  async getNetworkStats(network = 'base_sepolia') {
    try {
      // Mock network stats - in production, get from blockchain
      return {
        network,
        blockNumber: 12345678,
        gasPrice: '25.5',
        blockTime: 2.1,
        tps: 45.2,
        totalValueLocked: 1250000000,
        activeValidators: 150,
        timestamp: Date.now()
      };
    } catch (error) {
      logger.error('Error fetching network stats:', error);
      throw error;
    }
  }

  /**
   * Get historical price data
   */
  async getHistoricalPrices(tokenId, days = 7) {
    try {
      const response = await axios.get(`${this.baseUrl}/coins/${tokenId}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: days,
          interval: days <= 1 ? 'hourly' : 'daily'
        },
        headers: this.coingeckoApiKey ? {
          'X-CG-Demo-API-Key': this.coingeckoApiKey
        } : {}
      });

      return {
        prices: response.data.prices,
        volumes: response.data.total_volumes,
        marketCaps: response.data.market_caps
      };
    } catch (error) {
      logger.error('Error fetching historical prices:', error);
      throw error;
    }
  }

  /**
   * Monitor price changes and trigger alerts
   */
  async monitorPriceChanges(tokenPairs, thresholds) {
    try {
      const alerts = [];
      
      for (const pair of tokenPairs) {
        const opportunities = await this.calculateArbitrageOpportunities(pair, thresholds.minProfit);
        
        for (const opportunity of opportunities) {
          if (opportunity.netProfit >= thresholds.alertThreshold) {
            alerts.push({
              type: 'arbitrage_opportunity',
              pair: opportunity.pair,
              profit: opportunity.netProfit,
              confidence: opportunity.confidence,
              timestamp: Date.now()
            });
          }
        }
      }
      
      return alerts;
    } catch (error) {
      logger.error('Error monitoring price changes:', error);
      throw error;
    }
  }
}

// Export singleton instance
const priceService = new PriceService();
module.exports = priceService;
