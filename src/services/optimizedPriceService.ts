// 🚀 PERFORMANCE-OPTIMIZED PRICE SERVICE
// Day 3 Afternoon - Caching, async processing, memory management

import { ethers } from 'ethers';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface ArbitrageOpportunity {
  id: string;
  pair: string;
  tokenA: string;
  tokenB: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  profitUSD: number;
  profitPercent: number;
  volume: number;
  gasEstimate: number;
  confidence: number;
  timestamp: number;
  network: string;
}

interface NetworkConfig {
  name: string;
  rpcUrl: string;
  exchanges: string[];
  scanInterval: number;
  maxConcurrentRequests: number;
}

class OptimizedPriceService {
  private cache = new Map<string, CacheEntry<any>>();
  private requestQueue = new Map<string, Promise<any>>();
  private memoryUsage = { entries: 0, sizeBytes: 0 };
  private readonly MAX_CACHE_SIZE = 1000;
  private readonly DEFAULT_TTL = 30000; // 30 seconds
  private readonly CLEANUP_INTERVAL = 300000; // 5 minutes

  private networks: Record<string, NetworkConfig> = {
    ethereum: {
      name: 'Ethereum',
      rpcUrl: 'https://mainnet.infura.io/v3/your-key',
      exchanges: ['Uniswap V2', 'Uniswap V3', 'SushiSwap', 'Balancer', 'Curve'],
      scanInterval: 30000,
      maxConcurrentRequests: 5
    },
    base: {
      name: 'Base',
      rpcUrl: process.env.VITE_BASE_SEPOLIA_RPC_URL || 'https://base-sepolia.infura.io/v3/your-key',
      exchanges: ['Uniswap V3', 'BaseSwap', 'Aerodrome'],
      scanInterval: 10000,
      maxConcurrentRequests: 10
    }
  };

  constructor() {
    // Start periodic cache cleanup
    setInterval(() => this.cleanupCache(), this.CLEANUP_INTERVAL);
    
    // Monitor memory usage
    setInterval(() => this.monitorMemory(), 60000); // Every minute
  }

  // 🔄 OPTIMIZED OPPORTUNITY FETCHING
  async getOpportunities(network: string): Promise<ArbitrageOpportunity[]> {
    const cacheKey = `opportunities_${network}`;
    
    // Check cache first
    const cached = this.getFromCache<ArbitrageOpportunity[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Check if request is already in progress
    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey)!;
    }

    // Create new request
    const request = this.fetchOpportunitiesInternal(network);
    this.requestQueue.set(cacheKey, request);

    try {
      const opportunities = await request;
      
      // Cache the result
      this.setCache(cacheKey, opportunities, this.DEFAULT_TTL);
      
      return opportunities;
    } finally {
      // Remove from request queue
      this.requestQueue.delete(cacheKey);
    }
  }

  // 🔍 INTERNAL OPPORTUNITY FETCHING WITH PARALLEL PROCESSING
  private async fetchOpportunitiesInternal(network: string): Promise<ArbitrageOpportunity[]> {
    const networkConfig = this.networks[network];
    if (!networkConfig) {
      throw new Error(`Unsupported network: ${network}`);
    }

    try {
      // Parallel scanning of different exchanges
      const scanPromises = networkConfig.exchanges.map(exchange => 
        this.scanExchange(network, exchange)
      );

      // Use Promise.allSettled to handle partial failures
      const results = await Promise.allSettled(scanPromises);
      
      // Collect successful results
      const opportunities: ArbitrageOpportunity[] = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          opportunities.push(...result.value);
        } else {
          console.warn(`Failed to scan ${networkConfig.exchanges[index]}:`, result.reason);
        }
      });

      // Sort by profit and limit results
      return opportunities
        .sort((a, b) => b.profitPercent - a.profitPercent)
        .slice(0, 20); // Limit to top 20 opportunities

    } catch (error) {
      console.error(`Error fetching opportunities for ${network}:`, error);
      return [];
    }
  }

  // 📊 EXCHANGE SCANNING WITH RATE LIMITING
  private async scanExchange(network: string, exchange: string): Promise<ArbitrageOpportunity[]> {
    const networkConfig = this.networks[network];
    
    // Simulate rate limiting
    await this.rateLimitDelay(network);

    // Generate realistic mock data based on network and exchange
    const opportunities: ArbitrageOpportunity[] = [];
    const tokenPairs = this.getTokenPairs(network);

    for (const pair of tokenPairs.slice(0, 5)) { // Limit pairs per exchange
      try {
        const opportunity = await this.calculateArbitrageOpportunity(network, exchange, pair);
        if (opportunity && opportunity.profitPercent > 0.1) {
          opportunities.push(opportunity);
        }
      } catch (error) {
        console.warn(`Error calculating opportunity for ${pair.symbol}:`, error);
      }
    }

    return opportunities;
  }

  // 💰 ARBITRAGE OPPORTUNITY CALCULATION
  private async calculateArbitrageOpportunity(
    network: string, 
    exchange: string, 
    pair: { tokenA: string; tokenB: string; symbol: string }
  ): Promise<ArbitrageOpportunity | null> {
    
    // Simulate price fetching with realistic variations
    const basePrice = Math.random() * 1000 + 100;
    const priceVariation = (Math.random() - 0.5) * 0.1; // ±5% variation
    const buyPrice = basePrice;
    const sellPrice = basePrice * (1 + priceVariation);
    
    const volume = Math.random() * 50000 + 10000; // $10k - $60k volume
    const profitUSD = Math.abs(sellPrice - buyPrice) * (volume / buyPrice);
    const profitPercent = (profitUSD / volume) * 100;
    
    // Only return profitable opportunities
    if (profitPercent < 0.1) return null;

    return {
      id: `${pair.tokenA}-${pair.tokenB}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      pair: pair.symbol,
      tokenA: pair.tokenA,
      tokenB: pair.tokenB,
      buyExchange: exchange,
      sellExchange: this.getRandomExchange(network, exchange),
      buyPrice,
      sellPrice,
      profitUSD,
      profitPercent,
      volume,
      gasEstimate: this.estimateGasCost(network),
      confidence: Math.random() * 30 + 70, // 70-100% confidence
      timestamp: Date.now(),
      network
    };
  }

  // 🔧 UTILITY METHODS

  private getTokenPairs(network: string) {
    const commonPairs = [
      { tokenA: 'ETH', tokenB: 'USDC', symbol: 'ETH/USDC' },
      { tokenA: 'ETH', tokenB: 'USDT', symbol: 'ETH/USDT' },
      { tokenA: 'WBTC', tokenB: 'ETH', symbol: 'WBTC/ETH' },
      { tokenA: 'USDC', tokenB: 'USDT', symbol: 'USDC/USDT' },
      { tokenA: 'DAI', tokenB: 'USDC', symbol: 'DAI/USDC' }
    ];
    
    return commonPairs;
  }

  private getRandomExchange(network: string, excludeExchange: string): string {
    const exchanges = this.networks[network].exchanges.filter(ex => ex !== excludeExchange);
    return exchanges[Math.floor(Math.random() * exchanges.length)];
  }

  private estimateGasCost(network: string): number {
    const baseCosts = {
      ethereum: 50, // Higher gas costs
      base: 5,      // Lower gas costs
      polygon: 10,
      arbitrum: 15
    };
    
    return baseCosts[network as keyof typeof baseCosts] || 25;
  }

  private async rateLimitDelay(network: string): Promise<void> {
    const delay = Math.random() * 1000 + 500; // 500-1500ms delay
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // 💾 CACHE MANAGEMENT

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.updateMemoryUsage();
      return null;
    }
    
    return entry.data;
  }

  private setCache<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    // Prevent cache from growing too large
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldestEntries(Math.floor(this.MAX_CACHE_SIZE * 0.1)); // Remove 10%
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    
    this.updateMemoryUsage();
  }

  private cleanupCache(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cache cleanup: removed ${cleaned} expired entries`);
      this.updateMemoryUsage();
    }
  }

  private evictOldestEntries(count: number): void {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    for (let i = 0; i < Math.min(count, entries.length); i++) {
      this.cache.delete(entries[i][0]);
    }
    
    this.updateMemoryUsage();
  }

  private updateMemoryUsage(): void {
    this.memoryUsage.entries = this.cache.size;
    // Rough estimate of memory usage
    this.memoryUsage.sizeBytes = this.cache.size * 1024; // Assume 1KB per entry
  }

  private monitorMemory(): void {
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    
    console.log(`📊 Memory Usage: ${heapUsedMB.toFixed(2)}MB heap, ${this.memoryUsage.entries} cache entries`);
    
    // Force garbage collection if memory usage is high
    if (heapUsedMB > 512 && global.gc) {
      console.log('🗑️ Forcing garbage collection...');
      global.gc();
    }
  }

  // 📈 PERFORMANCE METRICS

  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      memoryUsage: this.memoryUsage,
      activeRequests: this.requestQueue.size
    };
  }

  clearCache(): void {
    this.cache.clear();
    this.updateMemoryUsage();
    console.log('🧹 Cache cleared');
  }
}

// Export singleton instance
export const optimizedPriceService = new OptimizedPriceService();
export default optimizedPriceService;
