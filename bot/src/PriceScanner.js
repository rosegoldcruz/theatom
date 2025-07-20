const axios = require('axios');
const { ethers } = require('ethers');
const Logger = require('./Logger');

class PriceScanner {
  constructor(config) {
    this.config = config;
    this.logger = new Logger('PriceScanner');
    this.provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL);
    
    // DEX configurations
    this.dexConfigs = {
      uniswap: {
        name: 'Uniswap V3',
        quoterAddress: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6', // Base Sepolia
        factoryAddress: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24'
      },
      sushiswap: {
        name: 'SushiSwap',
        routerAddress: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506' // Base Sepolia
      },
      // Add more DEXes as needed
    };

    // Token configurations
    this.tokens = this.config.get('tokens', {
      WETH: '0x4200000000000000000000000000000000000006', // Base WETH
      USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
      // Add more tokens as configured
    });

    this.priceCache = new Map();
    this.lastUpdate = 0;
    this.cacheTimeout = 5000; // 5 seconds
  }

  async initialize() {
    this.logger.info('🔄 Initializing Price Scanner...');
    
    try {
      // Test connection to provider
      const blockNumber = await this.provider.getBlockNumber();
      this.logger.info(`📡 Connected to Base Sepolia, block: ${blockNumber}`);
      
      // Initialize DEX contracts
      await this.initializeDexContracts();
      
      this.logger.info('✅ Price Scanner initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Price Scanner:', error);
      throw error;
    }
  }

  async initializeDexContracts() {
    // Initialize Uniswap V3 Quoter
    const quoterABI = [
      'function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)'
    ];
    
    this.uniswapQuoter = new ethers.Contract(
      this.dexConfigs.uniswap.quoterAddress,
      quoterABI,
      this.provider
    );

    this.logger.info('📊 DEX contracts initialized');
  }

  async getAllPrices() {
    try {
      // Check cache first
      if (Date.now() - this.lastUpdate < this.cacheTimeout && this.priceCache.size > 0) {
        this.logger.debug('📋 Using cached prices');
        return Object.fromEntries(this.priceCache);
      }

      this.logger.debug('🔍 Fetching fresh prices from all DEXes...');
      
      const prices = {};
      const tokenPairs = this.getTokenPairs();

      // Fetch prices from all DEXes in parallel
      const pricePromises = [];
      
      for (const pair of tokenPairs) {
        pricePromises.push(this.getPricesForPair(pair));
      }

      const results = await Promise.allSettled(pricePromises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const pair = tokenPairs[index];
          const pairKey = `${pair.tokenA}/${pair.tokenB}`;
          prices[pairKey] = result.value;
        } else {
          this.logger.warn(`Failed to get prices for pair ${tokenPairs[index].tokenA}/${tokenPairs[index].tokenB}:`, result.reason);
        }
      });

      // Update cache
      this.priceCache.clear();
      Object.entries(prices).forEach(([key, value]) => {
        this.priceCache.set(key, value);
      });
      this.lastUpdate = Date.now();

      this.logger.debug(`📊 Fetched prices for ${Object.keys(prices).length} pairs`);
      return prices;

    } catch (error) {
      this.logger.error('Error fetching prices:', error);
      return {};
    }
  }

  async getPricesForPair(pair) {
    const { tokenA, tokenB, amount } = pair;
    const amountWei = ethers.parseEther(amount.toString());
    
    const prices = {
      tokenA,
      tokenB,
      amount,
      dexPrices: {}
    };

    try {
      // Get Uniswap price
      const uniswapPrice = await this.getUniswapPrice(tokenA, tokenB, amountWei);
      if (uniswapPrice) {
        prices.dexPrices.uniswap = uniswapPrice;
      }

      // Get SushiSwap price (mock for now - implement actual SushiSwap integration)
      const sushiPrice = await this.getSushiSwapPrice(tokenA, tokenB, amountWei);
      if (sushiPrice) {
        prices.dexPrices.sushiswap = sushiPrice;
      }

      // Add more DEXes as needed
      
    } catch (error) {
      this.logger.error(`Error getting prices for ${tokenA}/${tokenB}:`, error);
    }

    return prices;
  }

  async getUniswapPrice(tokenIn, tokenOut, amountIn) {
    try {
      // Use multiple fee tiers for Uniswap V3
      const feeTiers = [500, 3000, 10000]; // 0.05%, 0.3%, 1%
      let bestPrice = null;
      let bestAmountOut = BigInt(0);

      for (const fee of feeTiers) {
        try {
          const amountOut = await this.uniswapQuoter.quoteExactInputSingle(
            tokenIn,
            tokenOut,
            fee,
            amountIn,
            0 // sqrtPriceLimitX96 = 0 (no limit)
          );

          if (amountOut > bestAmountOut) {
            bestAmountOut = amountOut;
            bestPrice = {
              amountIn: ethers.formatEther(amountIn),
              amountOut: ethers.formatEther(amountOut),
              price: parseFloat(ethers.formatEther(amountOut)) / parseFloat(ethers.formatEther(amountIn)),
              fee: fee,
              dex: 'uniswap'
            };
          }
        } catch (feeError) {
          // This fee tier might not have a pool, continue to next
          continue;
        }
      }

      return bestPrice;
    } catch (error) {
      this.logger.error('Error getting Uniswap price:', error);
      return null;
    }
  }

  async getSushiSwapPrice(tokenIn, tokenOut, amountIn) {
    try {
      // Mock SushiSwap price for now - implement actual SushiSwap integration
      // This would typically use SushiSwap's router or API
      
      // For demo purposes, return a slightly different price than Uniswap
      const mockPrice = {
        amountIn: ethers.formatEther(amountIn),
        amountOut: ethers.formatEther(amountIn * BigInt(95) / BigInt(100)), // Mock 5% difference
        price: 0.95,
        dex: 'sushiswap'
      };

      return mockPrice;
    } catch (error) {
      this.logger.error('Error getting SushiSwap price:', error);
      return null;
    }
  }

  getTokenPairs() {
    // Get configured token pairs
    const pairs = this.config.get('tokenPairs', [
      {
        tokenA: this.tokens.WETH,
        tokenB: this.tokens.USDC,
        amount: 0.1 // Amount to trade
      }
    ]);

    return pairs;
  }

  // Get price from external APIs (CoinGecko, etc.) for validation
  async getExternalPrice(tokenA, tokenB) {
    try {
      // This would integrate with CoinGecko, CoinMarketCap, etc.
      // For now, return null
      return null;
    } catch (error) {
      this.logger.error('Error getting external price:', error);
      return null;
    }
  }

  // Validate prices against external sources
  async validatePrices(prices) {
    // Implement price validation logic
    return true;
  }
}

module.exports = PriceScanner;
