import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';
import { z } from 'zod';

// Validation schemas
const arbitrageRequestSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  tokenA: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid token A address'),
  tokenB: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid token B address'),
  amountIn: z.string().refine(val => {
    try {
      const num = parseFloat(val);
      return num > 0 && num <= 1;
    } catch {
      return false;
    }
  }, 'Amount must be between 0 and 1 ETH'),
  buyDex: z.enum(['uniswap', 'sushiswap', 'balancer', 'curve'], {
    errorMap: () => ({ message: 'Invalid DEX selection' })
  }),
  sellDex: z.enum(['uniswap', 'sushiswap', 'balancer', 'curve'], {
    errorMap: () => ({ message: 'Invalid DEX selection' })
  }),
  minProfit: z.string().refine(val => {
    try {
      const num = parseFloat(val);
      return num >= 0 && num <= 0.1;
    } catch {
      return false;
    }
  }, 'Min profit must be between 0 and 0.1 ETH')
}).refine(data => data.buyDex !== data.sellDex, {
  message: "Buy and sell DEX must be different",
  path: ["sellDex"]
});

const simulateRequestSchema = z.object({
  tokenA: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid token A address'),
  tokenB: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid token B address'),
  amountIn: z.string().refine(val => {
    try {
      const num = parseFloat(val);
      return num > 0 && num <= 10; // Allow higher amounts for simulation
    } catch {
      return false;
    }
  }, 'Amount must be between 0 and 10 ETH'),
  buyDex: z.enum(['uniswap', 'sushiswap', 'balancer', 'curve']),
  sellDex: z.enum(['uniswap', 'sushiswap', 'balancer', 'curve'])
}).refine(data => data.buyDex !== data.sellDex, {
  message: "Buy and sell DEX must be different"
});

/**
 * Middleware to validate arbitrage execution requests
 */
export const validateArbitrageRequest = (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = arbitrageRequestSchema.parse(req.body);
    
    // Additional validation for Ethereum addresses
    if (!ethers.isAddress(validatedData.walletAddress)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid wallet address format' 
      });
    }
    
    if (!ethers.isAddress(validatedData.tokenA) || !ethers.isAddress(validatedData.tokenB)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid token address format' 
      });
    }

    // Check if tokens are different
    if (validatedData.tokenA.toLowerCase() === validatedData.tokenB.toLowerCase()) {
      return res.status(400).json({ 
        success: false,
        error: 'Token A and Token B must be different' 
      });
    }

    // Validate amount can be parsed by ethers
    try {
      ethers.parseEther(validatedData.amountIn);
      ethers.parseEther(validatedData.minProfit);
    } catch (error) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid amount format for Ethereum parsing' 
      });
    }

    // Add validated data to request object
    req.body = validatedData;
    return next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Validation error',
      message: error instanceof Error ? error.message : 'Unknown validation error'
    });
  }
};

/**
 * Middleware to validate simulation requests
 */
export const validateSimulateRequest = (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = simulateRequestSchema.parse(req.body);
    
    // Additional validation for Ethereum addresses
    if (!ethers.isAddress(validatedData.tokenA) || !ethers.isAddress(validatedData.tokenB)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid token address format' 
      });
    }

    // Check if tokens are different
    if (validatedData.tokenA.toLowerCase() === validatedData.tokenB.toLowerCase()) {
      return res.status(400).json({ 
        success: false,
        error: 'Token A and Token B must be different' 
      });
    }

    // Validate amount can be parsed by ethers
    try {
      ethers.parseEther(validatedData.amountIn);
    } catch (error) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid amount format for Ethereum parsing' 
      });
    }

    // Add validated data to request object
    req.body = validatedData;
    return next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Validation error',
      message: error instanceof Error ? error.message : 'Unknown validation error'
    });
  }
};

/**
 * Middleware to validate testnet-only operations
 */
export const validateTestnetOnly = (req: Request, res: Response, next: NextFunction) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const allowMainnet = process.env.ALLOW_MAINNET === 'true';
  
  if (isProduction && !allowMainnet) {
    // In production, only allow testnet operations unless explicitly enabled
    const networkId = req.headers['x-network-id'] || '84532'; // Default to Base Sepolia
    
    if (networkId !== '84532') { // Base Sepolia chain ID
      return res.status(403).json({
        success: false,
        error: 'Mainnet operations not allowed in production',
        message: 'This system is configured for testnet operations only'
      });
    }
  }

  return next();
};

/**
 * Middleware to validate gas price limits
 */
export const validateGasLimits = (req: Request, res: Response, next: NextFunction) => {
  const maxGasCostUSD = parseFloat(process.env.MAX_GAS_COST_USD || '20');
  const ethPriceUSD = parseFloat(process.env.ETH_PRICE_USD || '3000'); // Fallback ETH price
  
  // Calculate max gas cost in ETH
  const maxGasCostETH = maxGasCostUSD / ethPriceUSD;
  
  // Add gas limit validation to request
  req.body.maxGasCostETH = maxGasCostETH;

  return next();
};

/**
 * Rate limiting middleware for arbitrage requests
 */
export const rateLimitArbitrage = (req: Request, res: Response, next: NextFunction) => {
  const userAddress = req.body.walletAddress?.toLowerCase();
  
  if (!userAddress) {
    return res.status(400).json({
      success: false,
      error: 'Wallet address required for rate limiting'
    });
  }
  
  // Simple in-memory rate limiting (in production, use Redis)
  const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
  const maxRequests = 10; // Max 10 requests per minute
  const windowMs = 60 * 1000; // 1 minute
  
  const now = Date.now();
  const userLimit = rateLimitStore.get(userAddress);
  
  if (!userLimit || now > userLimit.resetTime) {
    // Reset or initialize rate limit
    rateLimitStore.set(userAddress, { count: 1, resetTime: now + windowMs });
    return next();
  } else if (userLimit.count < maxRequests) {
    // Increment count
    userLimit.count++;
    return next();
  } else {
    // Rate limit exceeded
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      message: `Maximum ${maxRequests} requests per minute allowed`,
      retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
    });
  }
};
