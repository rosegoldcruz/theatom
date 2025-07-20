const { ethers } = require('ethers');
const Logger = require('./Logger');

class OpportunityFinder {
  constructor(config) {
    this.config = config;
    this.logger = new Logger('OpportunityFinder');
    
    // Configuration
    this.minProfitThreshold = parseFloat(this.config.get('minProfitThreshold', 0.01)); // 0.01 ETH
    this.minProfitMargin = parseFloat(this.config.get('minProfitMargin', 0.5)); // 0.5%
    this.maxGasPrice = parseFloat(this.config.get('maxGasPrice', 50)); // 50 gwei
    this.estimatedGasUsed = parseInt(this.config.get('estimatedGasUsed', 300000)); // 300k gas
  }

  async findOpportunities(priceData) {
    const opportunities = [];

    try {
      this.logger.debug('🔍 Analyzing price data for arbitrage opportunities...');

      for (const [pairKey, pairData] of Object.entries(priceData)) {
        const pairOpportunities = await this.analyzePair(pairKey, pairData);
        opportunities.push(...pairOpportunities);
      }

      // Sort by profitability (highest first)
      opportunities.sort((a, b) => b.expectedProfit - a.expectedProfit);

      // Filter by minimum thresholds
      const viableOpportunities = opportunities.filter(opp => 
        opp.expectedProfit >= this.minProfitThreshold &&
        opp.profitMargin >= this.minProfitMargin
      );

      if (viableOpportunities.length > 0) {
        this.logger.info(`💰 Found ${viableOpportunities.length} viable opportunities`);
        viableOpportunities.forEach((opp, index) => {
          this.logger.info(`  ${index + 1}. ${opp.tokenA}/${opp.tokenB}: ${opp.expectedProfit.toFixed(4)} ETH (${opp.profitMargin.toFixed(2)}%)`);
        });
      }

      return viableOpportunities;

    } catch (error) {
      this.logger.error('Error finding opportunities:', error);
      return [];
    }
  }

  async analyzePair(pairKey, pairData) {
    const opportunities = [];
    const { tokenA, tokenB, amount, dexPrices } = pairData;

    if (!dexPrices || Object.keys(dexPrices).length < 2) {
      return opportunities; // Need at least 2 DEXes for arbitrage
    }

    const dexNames = Object.keys(dexPrices);
    
    // Compare all DEX combinations
    for (let i = 0; i < dexNames.length; i++) {
      for (let j = i + 1; j < dexNames.length; j++) {
        const buyDex = dexNames[i];
        const sellDex = dexNames[j];
        
        const buyPrice = dexPrices[buyDex];
        const sellPrice = dexPrices[sellDex];

        if (!buyPrice || !sellPrice) continue;

        // Calculate arbitrage in both directions
        const opp1 = await this.calculateArbitrage(
          tokenA, tokenB, amount, buyDex, sellDex, buyPrice, sellPrice
        );
        
        const opp2 = await this.calculateArbitrage(
          tokenA, tokenB, amount, sellDex, buyDex, sellPrice, buyPrice
        );

        if (opp1) opportunities.push(opp1);
        if (opp2) opportunities.push(opp2);
      }
    }

    return opportunities;
  }

  async calculateArbitrage(tokenA, tokenB, amount, buyDex, sellDex, buyPrice, sellPrice) {
    try {
      // Calculate potential profit
      const buyAmount = parseFloat(buyPrice.amountOut);
      const sellAmount = parseFloat(sellPrice.amountOut);

      // Simple arbitrage calculation
      // Buy on buyDex, sell on sellDex
      const grossProfit = sellAmount - buyAmount;

      if (grossProfit <= 0) {
        return null; // No profit opportunity
      }

      // Estimate gas costs
      const gasCost = await this.estimateGasCost();

      // Calculate flash loan fee (0.05% of flash loan amount)
      const flashLoanFee = this.calculateFlashLoanFee(amount);

      // Calculate net profit (subtract gas and flash loan fees)
      const netProfit = grossProfit - gasCost - flashLoanFee;

      if (netProfit <= 0) {
        return null; // Costs exceed profit
      }

      // Calculate profit margin
      const profitMargin = (netProfit / buyAmount) * 100;

      // Calculate optimal flash loan amount for this opportunity
      const flashLoanAmount = this.calculateOptimalFlashLoanAmount(amount, profitMargin);

      const opportunity = {
        tokenA,
        tokenB,
        amount,
        buyDex,
        sellDex,
        buyPrice: buyPrice.price,
        sellPrice: sellPrice.price,
        grossProfit,
        gasCost,
        flashLoanFee,
        expectedProfit: netProfit,
        profitMargin,
        flashLoanAmount, // Add flash loan amount
        useFlashLoan: flashLoanAmount > amount, // Use flash loan if beneficial
        timestamp: Date.now(),
        confidence: this.calculateConfidence(buyPrice, sellPrice)
      };

      return opportunity;

    } catch (error) {
      this.logger.error('Error calculating arbitrage:', error);
      return null;
    }
  }

  async estimateGasCost() {
    try {
      // Get current gas price
      const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL);
      const feeData = await provider.getFeeData();
      
      const gasPrice = feeData.gasPrice || ethers.parseUnits(this.maxGasPrice.toString(), 'gwei');
      const gasCostWei = gasPrice * BigInt(this.estimatedGasUsed);
      const gasCostEth = parseFloat(ethers.formatEther(gasCostWei));

      return gasCostEth;
    } catch (error) {
      this.logger.error('Error estimating gas cost:', error);
      // Return default gas cost estimate
      return 0.01; // 0.01 ETH default
    }
  }

  calculateConfidence(buyPrice, sellPrice) {
    // Calculate confidence score based on various factors
    let confidence = 100;

    // Reduce confidence if prices are stale
    const now = Date.now();
    const maxAge = 30000; // 30 seconds
    
    if (buyPrice.timestamp && (now - buyPrice.timestamp) > maxAge) {
      confidence -= 20;
    }
    
    if (sellPrice.timestamp && (now - sellPrice.timestamp) > maxAge) {
      confidence -= 20;
    }

    // Reduce confidence for very small price differences
    const priceDiff = Math.abs(buyPrice.price - sellPrice.price);
    const avgPrice = (buyPrice.price + sellPrice.price) / 2;
    const priceDiffPercent = (priceDiff / avgPrice) * 100;
    
    if (priceDiffPercent < 1) {
      confidence -= 30;
    }

    // Add more confidence factors as needed
    
    return Math.max(0, Math.min(100, confidence));
  }

  // Advanced opportunity analysis
  async analyzeMarketConditions() {
    // Implement market condition analysis
    // - Volatility
    // - Liquidity
    // - Network congestion
    // - MEV competition
    return {
      volatility: 'normal',
      liquidity: 'good',
      networkCongestion: 'low',
      mevRisk: 'medium'
    };
  }

  calculateFlashLoanFee(amount) {
    // AAVE flash loan fee is typically 0.05%
    const flashLoanFeeRate = 0.0005; // 0.05%
    return parseFloat(amount) * flashLoanFeeRate;
  }

  calculateOptimalFlashLoanAmount(baseAmount, profitMargin) {
    // Scale up based on profit margin - higher margins can support larger amounts
    let multiplier = 1;

    if (profitMargin > 2.0) {
      multiplier = 100; // 100x for high-margin opportunities (up to $10M)
    } else if (profitMargin > 1.0) {
      multiplier = 50;  // 50x for good margins
    } else if (profitMargin > 0.5) {
      multiplier = 20;  // 20x for decent margins
    } else {
      multiplier = 10;  // 10x for small margins
    }

    // Cap at reasonable limits
    const maxFlashLoanAmount = 100; // 100 ETH max (~$300K)
    const optimalAmount = Math.min(parseFloat(baseAmount) * multiplier, maxFlashLoanAmount);

    return optimalAmount;
  }

  // Risk assessment (updated for flash loans)
  assessRisk(opportunity) {
    let riskScore = 0;

    // Flash loan amount risk
    if (opportunity.flashLoanAmount > 50) {
      riskScore += 30; // Higher risk for large flash loans
    } else if (opportunity.flashLoanAmount > 10) {
      riskScore += 15;
    }

    // Slippage risk (more critical with larger amounts)
    if (opportunity.profitMargin < 1) {
      riskScore += 40; // Higher penalty for low margins with flash loans
    }

    // Flash loan fee risk
    if (opportunity.flashLoanFee > opportunity.expectedProfit * 0.3) {
      riskScore += 25;
    }

    // Gas price volatility risk
    if (opportunity.gasCost > opportunity.expectedProfit * 0.5) {
      riskScore += 25;
    }

    // Confidence risk
    if (opportunity.confidence < 70) {
      riskScore += 25;
    }

    return {
      score: riskScore,
      level: riskScore < 30 ? 'low' : riskScore < 60 ? 'medium' : 'high'
    };
  }
}

module.exports = OpportunityFinder;
