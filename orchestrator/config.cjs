const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const config = {
  // Network Configuration - UPDATED FOR BASE SEPOLIA
  rpcUrl: process.env.BASE_SEPOLIA_RPC_URL || `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
  chainId: 84532, // Base Sepolia testnet

  // Wallet Configuration
  privateKey: process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',

  // Contract Addresses - UPDATED FOR DEPLOYED CONTRACT
  contractAddress: process.env.BASE_SEPOLIA_CONTRACT_ADDRESS || '0xFc905877348deA2f91000fe99F94E0AfAEDEB590',
  
  // DEX Router Addresses (Base Network)
  uniswapRouter: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24', // Base Uniswap V3
  sushiswapRouter: '0x6BDED42c6DA8FBf0d2bA55B2fa120C5e0c8D7891', // Base SushiSwap
  balancerVault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8', // Balancer Vault

  // AAVE Configuration (Base)
  aaveProvider: '0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D',
  
  // Bot Configuration
  minProfitThreshold: 10, // Minimum profit in USD
  maxGasPrice: 50, // Maximum gas price in gwei
  slippageTolerance: 0.5, // 0.5% slippage tolerance
  
  // Monitoring Configuration
  scanInterval: 5000, // 5 seconds
  maxRetries: 3,
  retryDelay: 2000, // 2 seconds
  
  // Logging
  logLevel: 'info',
  logFile: './logs/arbitrage.log'
};

module.exports = config;
