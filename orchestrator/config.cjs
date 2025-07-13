const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const config = {
  // Network Configuration
  rpcUrl: process.env.RPC_URL || 'http://127.0.0.1:8545',
  chainId: 31337, // Hardhat local network
  
  // Wallet Configuration
  privateKey: process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  
  // Contract Addresses
  contractAddress: process.env.ATOM_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  
  // DEX Router Addresses (Mainnet)
  uniswapRouter: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  sushiswapRouter: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
  
  // AAVE Configuration
  aaveProvider: '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e',
  
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
