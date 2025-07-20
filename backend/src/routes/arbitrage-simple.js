const express = require('express');
const { ethers } = require('ethers');
const { createClient } = require('@supabase/supabase-js');
const { z } = require('zod');
const crypto = require('crypto');
const winston = require('winston');

const router = express.Router();

// Environment variables
const BASE_SEPOLIA_RPC = process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.BASE_SEPOLIA_CONTRACT_ADDRESS;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Initialize Supabase client (optional)
const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Logger setup
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

// Contract ABI with all critical functions
const CONTRACT_ABI = [
  "function executeArbitrage(address asset, uint256 amount, bytes calldata params) external returns (uint256 profit)",
  "function owner() external view returns (address)",
  "function paused() external view returns (bool)",
  "function getBalance(address token) external view returns (uint256)",
  "event ArbitrageExecuted(address indexed token, uint256 amountIn, uint256 profit, uint256 gasUsed)",
  "event ArbitrageFailed(address indexed token, uint256 amountIn, string reason)"
];

// Validation schemas
const executeArbitrageSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  tokenA: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid token A address'),
  tokenB: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid token B address'),
  amountIn: z.string().refine(val => {
    const num = parseFloat(val);
    return num > 0 && num <= 1;
  }, 'Amount must be between 0 and 1 ETH'),
  buyDex: z.enum(['uniswap', 'sushiswap', 'balancer', 'curve']),
  sellDex: z.enum(['uniswap', 'sushiswap', 'balancer', 'curve']),
  minProfit: z.string().refine(val => {
    const num = parseFloat(val);
    return num >= 0 && num <= 0.1;
  }, 'Min profit must be between 0 and 0.1 ETH')
}).refine(data => data.buyDex !== data.sellDex, {
  message: "Buy and sell DEX must be different"
});

// Initialize provider and wallet with Ethers v6 syntax
const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
const wallet = PRIVATE_KEY ? new ethers.Wallet(PRIVATE_KEY, provider) : null;

/**
 * POST /api/arbitrage/execute
 * Execute an arbitrage trade with proper error handling and logging
 */
router.post('/execute', async (req, res) => {
  try {
    // Validate request body
    const validatedData = executeArbitrageSchema.parse(req.body);
    const { walletAddress, tokenA, tokenB, amountIn, buyDex, sellDex, minProfit } = validatedData;

    // Check if wallet is available
    if (!wallet) {
      return res.status(500).json({
        success: false,
        error: 'Wallet not configured'
      });
    }

    // Check if contract address is configured
    if (!CONTRACT_ADDRESS) {
      return res.status(500).json({
        success: false,
        error: 'Contract address not configured'
      });
    }

    // Convert amounts using Ethers v6 syntax
    const amountWei = ethers.parseEther(amountIn);
    const minProfitWei = ethers.parseEther(minProfit);

    // Generate execution ID for tracking
    const executionId = crypto.randomUUID();
    
    // Log execution attempt to Supabase
    if (supabase) {
      const { error: logError } = await supabase
        .from('arbitrage_executions')
        .insert({
          id: executionId,
          wallet_address: walletAddress,
          token_a: tokenA,
          token_b: tokenB,
          amount_in: amountIn,
          buy_dex: buyDex,
          sell_dex: sellDex,
          min_profit: minProfit,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (logError) {
        logger.error('Failed to log execution attempt', logError);
      }
    }

    // Initialize contract
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

    // Prepare arbitrage parameters
    const arbitrageParams = ethers.AbiCoder.defaultAbiCoder().encode(
      ['address', 'address', 'string', 'string', 'uint256'],
      [tokenA, tokenB, buyDex, sellDex, minProfitWei]
    );

    // Gas estimation with fallback
    let gasEstimate;
    try {
      gasEstimate = await contract.executeArbitrage.estimateGas(
        tokenA,
        amountWei,
        arbitrageParams
      );
    } catch (gasError) {
      logger.warn('Gas estimation failed, using default', gasError);
      gasEstimate = BigInt(500000); // Fallback gas limit
    }

    const gasLimit = gasEstimate * 120n / 100n; // 20% buffer

    // Execute transaction with proper gas pricing
    const tx = await contract.executeArbitrage(
      tokenA,
      amountWei,
      arbitrageParams,
      {
        gasLimit,
        maxFeePerGas: ethers.parseUnits('2', 'gwei'),
        maxPriorityFeePerGas: ethers.parseUnits('1', 'gwei')
      }
    );

    logger.info(`Transaction submitted: ${tx.hash}`);

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    
    if (!receipt) {
      throw new Error('Transaction failed to confirm');
    }

    // Parse transaction logs for profit calculation
    let profit = '0';
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog({
          topics: log.topics,
          data: log.data
        });
        
        if (parsedLog && parsedLog.name === 'ArbitrageExecuted') {
          profit = ethers.formatEther(parsedLog.args.profit);
          break;
        }
      } catch (parseError) {
        // Continue to next log if parsing fails
        continue;
      }
    }

    // Update execution status in Supabase
    if (supabase) {
      await supabase
        .from('arbitrage_executions')
        .update({
          status: 'completed',
          transaction_hash: tx.hash,
          profit: profit,
          gas_used: receipt.gasUsed.toString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', executionId);
    }

    logger.info(`Arbitrage executed successfully. Profit: ${profit} ETH`);

    res.json({
      success: true,
      data: {
        executionId,
        transactionHash: tx.hash,
        profit,
        gasUsed: receipt.gasUsed.toString(),
        status: 'completed'
      }
    });

  } catch (error) {
    logger.error('Arbitrage execution failed:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to execute arbitrage',
      message: error.message || 'Unknown error'
    });
  }
});

/**
 * GET /api/arbitrage/status
 * Get current arbitrage system status
 */
router.get('/status', async (req, res) => {
  try {
    if (!CONTRACT_ADDRESS) {
      return res.json({
        success: true,
        data: {
          isActive: false,
          contractBalance: '0',
          networkStatus: 'not configured',
          lastBlockNumber: 0,
          gasPrice: '0',
          maxFeePerGas: '0'
        }
      });
    }

    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    // Get contract status
    const [isPaused, contractBalance] = await Promise.all([
      contract.paused().catch(() => false),
      provider.getBalance(CONTRACT_ADDRESS)
    ]);

    // Get latest block info
    const latestBlock = await provider.getBlock('latest');
    const gasPrice = await provider.getFeeData();

    res.json({
      success: true,
      data: {
        isActive: !isPaused,
        contractBalance: ethers.formatEther(contractBalance),
        networkStatus: 'connected',
        lastBlockNumber: latestBlock?.number || 0,
        gasPrice: gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, 'gwei') : '0',
        maxFeePerGas: gasPrice.maxFeePerGas ? ethers.formatUnits(gasPrice.maxFeePerGas, 'gwei') : '0'
      }
    });
  } catch (error) {
    logger.error('Failed to get arbitrage status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get arbitrage status',
      message: error.message || 'Unknown error'
    });
  }
});

/**
 * POST /api/arbitrage/simulate
 * Simulate an arbitrage trade without executing
 */
router.post('/simulate', async (req, res) => {
  try {
    const { tokenA, tokenB, amountIn, buyDex, sellDex } = req.body;
    
    // Basic validation
    if (!tokenA || !tokenB || !amountIn || !buyDex || !sellDex) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }

    // Mock simulation results
    const simulation = {
      estimatedProfit: '0.05',
      estimatedGasCost: '0.002',
      netProfit: '0.048',
      successProbability: 85,
      risks: [
        'Price slippage risk: Medium',
        'Gas price volatility: Low',
        'Liquidity risk: Low'
      ]
    };

    res.json({
      success: true,
      data: simulation
    });
  } catch (error) {
    logger.error('Failed to simulate trade:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to simulate trade',
      message: error.message || 'Unknown error'
    });
  }
});

module.exports = router;
