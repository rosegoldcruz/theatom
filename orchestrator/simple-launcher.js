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
    
    // Simple contract ABI for testing
    const contractABI = [
      "function owner() external view returns (address)",
      "function totalTrades() external view returns (uint256)",
      "function totalProfit() external view returns (uint256)"
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

// Health check server
function startHealthServer() {
  const express = require('express');
  const app = express();
  
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0'
    });
  });
  
  const port = process.env.HEALTH_CHECK_PORT || 3001;
  app.listen(port, () => {
    console.log(`🏥 Health check server running on port ${port}`);
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
    startHealthServer();
    await startMonitoring();
    
    console.log('\n🎉 ATOM Orchestrator is running successfully!');
    console.log('Press Ctrl+C to stop');
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

// Start the orchestrator
main();
