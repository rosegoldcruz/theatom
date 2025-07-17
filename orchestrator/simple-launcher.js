#!/usr/bin/env node

/**
 * ATOM Arbitrage System - Simple Orchestrator Launcher
 * Quick working version for demo
 */

const { ethers } = require('ethers');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🚀 ATOM Arbitrage Orchestrator - Simple Version');
console.log('='.repeat(50));

// Configuration
const config = {
  RPC_URL: process.env.BASE_SEPOLIA_RPC_URL || process.env.VITE_BASE_SEPOLIA_RPC_URL,
  CONTRACT_ADDRESS: process.env.BASE_SEPOLIA_CONTRACT_ADDRESS || process.env.VITE_BASE_SEPOLIA_CONTRACT_ADDRESS,
  PRIVATE_KEY: process.env.PRIVATE_KEY || process.env.VITE_PRIVATE_KEY,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
};

console.log('🔧 Config loaded:', {
  RPC_URL: config.RPC_URL ? 'SET' : 'MISSING',
  CONTRACT_ADDRESS: config.CONTRACT_ADDRESS ? 'SET' : 'MISSING',
  PRIVATE_KEY: config.PRIVATE_KEY ? 'SET' : 'MISSING',
  SUPABASE_URL: config.SUPABASE_URL ? 'SET' : 'MISSING'
});

// Initialize services
let provider, wallet, contract, supabase;

async function initialize() {
  try {
    console.log('🔧 Initializing services...');
    
    // Initialize blockchain connection
    provider = new ethers.JsonRpcProvider(config.RPC_URL);
    const privateKey = config.PRIVATE_KEY.startsWith('0x') ? config.PRIVATE_KEY : `0x${config.PRIVATE_KEY}`;
    wallet = new ethers.Wallet(privateKey, provider);
    
    // Enhanced contract ABI with flash loan functionality
    const contractABI = [
      "function owner() external view returns (address)",
      "function totalTrades() external view returns (uint256)",
      "function totalProfit() external view returns (uint256)",
      "function successfulTrades() external view returns (uint256)",
      "function totalGasUsed() external view returns (uint256)",
      "function paused() external view returns (bool)",
      "function executeArbitrage(address asset, uint256 amount, bytes calldata params) external",
      "function pause() external",
      "function unpause() external",
      "event ArbitrageExecuted(address indexed token, uint256 amountIn, uint256 profit, uint256 gasUsed)"
    ];
    
    contract = new ethers.Contract(config.CONTRACT_ADDRESS, contractABI, wallet);
    
    // Initialize Supabase
    supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY);
    
    console.log('✅ Services initialized successfully');
    
    // Test connections
    await testConnections();
    
  } catch (error) {
    console.error('❌ Initialization failed:', error.message);
    process.exit(1);
  }
}

async function testConnections() {
  try {
    console.log('🧪 Testing connections...');
    
    // Test blockchain
    const blockNumber = await provider.getBlockNumber();
    console.log(`📋 Current block: ${blockNumber}`);
    
    // Test wallet
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Wallet balance: ${ethers.formatEther(balance)} ETH`);
    
    // Test contract
    const owner = await contract.owner();
    console.log(`🏠 Contract owner: ${owner}`);
    
    // Test database (optional)
    try {
      const { error } = await supabase.from('users').select('count').limit(1);
      if (error) throw error;
      console.log('🗄️ Database connection successful');
    } catch (error) {
      console.log('⚠️ Database connection failed (continuing without DB)');
    }
    
    console.log('✅ All connections working!');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    throw error;
  }
}

async function logActivity(message, data = {}) {
  try {
    if (supabase) {
      await supabase.rpc('log_system_event', {
        log_level: 'info',
        component_name: 'orchestrator',
        log_message: message,
        log_details: data
      });
    }
    console.log(`📝 ${message}`);
  } catch (error) {
    console.log(`📝 ${message} (logging failed)`);
  }
}

async function scanForOpportunities() {
  try {
    console.log('🔍 Scanning for arbitrage opportunities...');
    
    // Simulate opportunity detection
    const mockOpportunity = {
      tokenA: 'WETH',
      tokenB: 'USDC',
      profit: Math.random() * 0.01, // Random profit 0-1%
      timestamp: new Date().toISOString()
    };
    
    await logActivity('Opportunity scan completed', mockOpportunity);
    
    if (mockOpportunity.profit > 0.005) { // 0.5% threshold
      console.log(`💰 Profitable opportunity found: ${(mockOpportunity.profit * 100).toFixed(3)}%`);
      await logActivity('Profitable opportunity detected', mockOpportunity);
    }
    
  } catch (error) {
    console.error('❌ Scan error:', error.message);
    await logActivity('Scan error occurred', { error: error.message });
  }
}

// 📡 STEP 3: Flash loan execution function
async function triggerFlashLoan(asset = '0x4200000000000000000000000000000000000006', amount = '1000000000000000000') {
  try {
    console.log('🚀 Triggering flash loan...');
    console.log(`💰 Asset: ${asset}`);
    console.log(`📊 Amount: ${ethers.formatEther(amount)} ETH`);

    // Prepare arbitrage parameters (mock for now)
    const params = ethers.AbiCoder.defaultAbiCoder().encode(
      ['address', 'uint256', 'uint256'],
      [asset, amount, Date.now()] // Simple params for testing
    );

    // Execute the flash loan arbitrage
    const tx = await contract.executeArbitrage(asset, amount, params, {
      gasLimit: 500000, // 500k gas limit
      gasPrice: ethers.parseUnits('1', 'gwei') // 1 gwei
    });

    console.log(`🚀 Flash loan TX submitted: ${tx.hash}`);
    await logActivity('Flash loan transaction submitted', {
      txHash: tx.hash,
      asset,
      amount: ethers.formatEther(amount)
    });

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`✅ Flash loan executed successfully!`);
    console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);

    await logActivity('Flash loan executed successfully', {
      txHash: tx.hash,
      gasUsed: receipt.gasUsed.toString(),
      blockNumber: receipt.blockNumber
    });

    return {
      success: true,
      txHash: tx.hash,
      gasUsed: receipt.gasUsed.toString(),
      blockNumber: receipt.blockNumber
    };

  } catch (error) {
    console.error('❌ Flash loan failed:', error.message);
    await logActivity('Flash loan execution failed', { error: error.message });
    throw error;
  }
}

async function startMonitoring() {
  console.log('👀 Starting monitoring loop...');

  // Scan every 30 seconds
  setInterval(async () => {
    await scanForOpportunities();
  }, 30000);

  // Initial scan
  await scanForOpportunities();

  console.log('✅ Monitoring started - scanning every 30 seconds');
}

// Enhanced API server with bot controls
function startApiServer() {
  const express = require('express');
  const cors = require('cors');
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Bot state
  let botState = {
    isRunning: false,
    isMonitoring: false,
    lastScan: null,
    totalScans: 0,
    opportunities: []
  };

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      botState
    });
  });

  // 🔄 STEP 2: Bot control endpoints
  app.post('/api/bot/start', async (req, res) => {
    try {
      console.log('🚀 Starting bot via API...');
      if (!botState.isRunning) {
        await startMonitoring();
        botState.isRunning = true;
        botState.isMonitoring = true;
        await logActivity('Bot started via API');
      }
      res.json({
        success: true,
        message: 'Bot started successfully',
        state: botState
      });
    } catch (error) {
      console.error('❌ Failed to start bot:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  app.post('/api/bot/stop', async (req, res) => {
    try {
      console.log('⏹️ Stopping bot via API...');
      botState.isRunning = false;
      botState.isMonitoring = false;
      await logActivity('Bot stopped via API');
      res.json({
        success: true,
        message: 'Bot stopped successfully',
        state: botState
      });
    } catch (error) {
      console.error('❌ Failed to stop bot:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  app.get('/api/bot/status', (req, res) => {
    res.json({
      success: true,
      state: botState,
      contract: {
        address: config.CONTRACT_ADDRESS,
        network: 'Base Sepolia'
      }
    });
  });

  // 📡 STEP 3: Flash loan API endpoint
  app.post('/api/flashloan/run', async (req, res) => {
    try {
      console.log('🚀 Flash loan triggered via API...');
      const { asset, amount } = req.body;

      const result = await triggerFlashLoan(
        asset || '0x4200000000000000000000000000000000000006', // Default to WETH on Base
        amount || '1000000000000000000' // Default to 1 ETH
      );

      res.json({
        success: true,
        message: 'Flash loan executed successfully',
        result
      });
    } catch (error) {
      console.error('❌ Flash loan API error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  const port = process.env.API_PORT || 3001;
  app.listen(port, () => {
    console.log(`🚀 API server running on port ${port}`);
    console.log(`📡 Bot controls available at http://localhost:${port}/api/bot/*`);
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n📡 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n📡 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Main execution
async function main() {
  try {
    await initialize();
    startApiServer(); // Start API server with bot controls

    console.log('\n🎉 ATOM Orchestrator is running successfully!');
    console.log('🔄 Bot controls available via API endpoints');
    console.log('📡 Use frontend buttons or POST to /api/bot/start to begin monitoring');
    console.log('Press Ctrl+C to stop');

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

// Start the orchestrator
main();
