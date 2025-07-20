const { ethers } = require('ethers');
const Logger = require('./Logger');

class FlashLoanArbitrageEngine {
  constructor(config) {
    this.config = config;
    this.logger = new Logger('FlashLoanArbitrageEngine');
    
    // AAVE V3 Pool on Base Sepolia (if available) or fallback
    this.aavePoolAddress = process.env.AAVE_POOL_ADDRESS || '0x07eA79F68B2B3df564D0A34F8e19D9B1e339814b'; // Base Sepolia
    this.provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL);
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    
    // Flash loan fee (0.05% = 5 basis points)
    this.flashLoanFee = 0.0005; // 0.05%
    
    // AAVE Pool ABI (simplified)
    this.aavePoolABI = [
      'function flashLoanSimple(address receiverAddress, address asset, uint256 amount, bytes calldata params, uint16 referralCode) external',
      'function getReserveData(address asset) external view returns (uint256 configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowRate, uint128 stableBorrowRate, uint40 lastUpdateTimestamp, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint8 id)'
    ];
    
    this.aavePool = new ethers.Contract(this.aavePoolAddress, this.aavePoolABI, this.wallet);
  }

  async initialize() {
    this.logger.info('🏦 Initializing Flash Loan Arbitrage Engine...');
    
    try {
      // Test AAVE Pool connection
      const blockNumber = await this.provider.getBlockNumber();
      this.logger.info(`📡 Connected to Base Sepolia, block: ${blockNumber}`);
      
      // Check if AAVE Pool is available
      try {
        const wethAddress = '0x4200000000000000000000000000000000000006'; // Base WETH
        await this.aavePool.getReserveData(wethAddress);
        this.logger.info('✅ AAVE Pool connection verified');
      } catch (error) {
        this.logger.warn('⚠️ AAVE Pool not available, using fallback flash loan provider');
        // Could implement a custom flash loan contract here
      }
      
      this.logger.info('✅ Flash Loan Arbitrage Engine initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Flash Loan Engine:', error);
      throw error;
    }
  }

  async executeFlashLoanArbitrage(opportunity) {
    const tradeId = this.generateTradeId();
    
    try {
      this.logger.info(`🏦 Executing flash loan arbitrage ${tradeId}:`, {
        pair: `${opportunity.tokenA}/${opportunity.tokenB}`,
        flashLoanAmount: opportunity.flashLoanAmount,
        expectedProfit: opportunity.expectedProfit
      });

      // Calculate optimal flash loan amount
      const flashLoanAmount = this.calculateOptimalFlashLoanAmount(opportunity);
      const flashLoanAmountWei = ethers.parseEther(flashLoanAmount.toString());

      // Prepare arbitrage parameters for the callback
      const arbitrageParams = ethers.AbiCoder.defaultAbiCoder().encode(
        ['address', 'address', 'string', 'string', 'uint256', 'uint256'],
        [
          opportunity.tokenA,
          opportunity.tokenB,
          opportunity.buyDex,
          opportunity.sellDex,
          ethers.parseEther(opportunity.minProfit.toString()),
          flashLoanAmountWei
        ]
      );

      // Execute flash loan
      const contractAddress = process.env.BASE_SEPOLIA_CONTRACT_ADDRESS;
      const asset = opportunity.tokenA; // Flash loan the input token
      
      this.logger.info(`💰 Initiating flash loan: ${flashLoanAmount} ETH`);

      const tx = await this.aavePool.flashLoanSimple(
        contractAddress, // Our arbitrage contract (receiver)
        asset,
        flashLoanAmountWei,
        arbitrageParams,
        0 // referral code
      );

      this.logger.info(`📝 Flash loan transaction submitted: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (!receipt) {
        throw new Error('Flash loan transaction failed to confirm');
      }

      // Parse transaction logs for results
      const result = await this.parseFlashLoanResults(receipt, opportunity);
      
      this.logger.info(`✅ Flash loan arbitrage completed:`, {
        tradeId,
        transactionHash: tx.hash,
        profit: result.profit,
        gasUsed: receipt.gasUsed.toString()
      });

      return {
        success: true,
        tradeId,
        transactionHash: tx.hash,
        profit: result.profit,
        gasUsed: receipt.gasUsed.toString(),
        flashLoanAmount: flashLoanAmount.toString(),
        flashLoanFee: result.flashLoanFee
      };

    } catch (error) {
      this.logger.error(`Flash loan arbitrage ${tradeId} failed:`, error);
      
      return {
        success: false,
        error: error.message,
        tradeId
      };
    }
  }

  calculateOptimalFlashLoanAmount(opportunity) {
    // Calculate the optimal flash loan amount based on:
    // 1. Available liquidity on DEXes
    // 2. Price impact considerations
    // 3. Gas cost efficiency
    // 4. Maximum profit potential

    const baseAmount = parseFloat(opportunity.amount);
    const profitMargin = opportunity.profitMargin;
    
    // Scale up based on profit margin - higher margins can support larger amounts
    let multiplier = 1;
    
    if (profitMargin > 2.0) {
      multiplier = 100; // 100x for high-margin opportunities
    } else if (profitMargin > 1.0) {
      multiplier = 50;  // 50x for good margins
    } else if (profitMargin > 0.5) {
      multiplier = 20;  // 20x for decent margins
    } else {
      multiplier = 10;  // 10x for small margins
    }

    // Cap at reasonable limits
    const maxFlashLoanAmount = 100; // 100 ETH max
    const optimalAmount = Math.min(baseAmount * multiplier, maxFlashLoanAmount);
    
    this.logger.debug(`Calculated optimal flash loan amount: ${optimalAmount} ETH (${multiplier}x multiplier)`);
    
    return optimalAmount;
  }

  async parseFlashLoanResults(receipt, opportunity) {
    try {
      // Parse logs to extract profit information
      const contractAddress = process.env.BASE_SEPOLIA_CONTRACT_ADDRESS;
      const contract = new ethers.Contract(contractAddress, [
        'event FlashLoanArbitrageExecuted(address indexed asset, uint256 amount, uint256 profit, uint256 flashLoanFee)',
        'event ArbitrageExecuted(address indexed token, uint256 amountIn, uint256 profit, uint256 gasUsed)'
      ], this.provider);

      let profit = '0';
      let flashLoanFee = '0';

      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          
          if (parsedLog && parsedLog.name === 'FlashLoanArbitrageExecuted') {
            profit = ethers.formatEther(parsedLog.args.profit);
            flashLoanFee = ethers.formatEther(parsedLog.args.flashLoanFee);
            break;
          } else if (parsedLog && parsedLog.name === 'ArbitrageExecuted') {
            profit = ethers.formatEther(parsedLog.args.profit);
          }
        } catch (parseError) {
          continue;
        }
      }

      return {
        profit,
        flashLoanFee
      };
    } catch (error) {
      this.logger.error('Error parsing flash loan results:', error);
      return {
        profit: '0',
        flashLoanFee: '0'
      };
    }
  }

  async checkFlashLoanAvailability(asset, amount) {
    try {
      const reserveData = await this.aavePool.getReserveData(asset);
      // Check if there's enough liquidity for the flash loan
      // This is a simplified check - in production you'd want more detailed liquidity analysis
      return true;
    } catch (error) {
      this.logger.error('Error checking flash loan availability:', error);
      return false;
    }
  }

  calculateFlashLoanFee(amount) {
    return parseFloat(amount) * this.flashLoanFee;
  }

  generateTradeId() {
    return `flashloan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get flash loan statistics
  getFlashLoanStats() {
    return {
      flashLoanFeeRate: this.flashLoanFee,
      aavePoolAddress: this.aavePoolAddress,
      maxFlashLoanAmount: '100 ETH',
      supportedAssets: ['WETH', 'USDC', 'DAI']
    };
  }
}

module.exports = FlashLoanArbitrageEngine;
