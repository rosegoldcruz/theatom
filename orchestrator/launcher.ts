#!/usr/bin/env node

import dotenv from 'dotenv';
import { AtomOrchestrator } from './AtomOrchestrator';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'BASE_SEPOLIA_RPC_URL',
  'PRIVATE_KEY',
  'BASE_SEPOLIA_CONTRACT_ADDRESS',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

function validateEnvironment(): void {
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(envVar => console.error(`  - ${envVar}`));
    process.exit(1);
  }
}

async function testConnections(): Promise<void> {
  console.log('🔍 Testing connections...');
  
  try {
    // Test Supabase connection
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { error } = await supabase.from('arbitrage_config').select('count').limit(1);
    if (error) throw new Error(`Supabase connection failed: ${error.message}`);
    
    console.log('✅ Supabase connection successful');
    
    // Test RPC connection
    const { ethers } = await import('ethers');
    const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL);
    const blockNumber = await provider.getBlockNumber();
    
    console.log(`✅ RPC connection successful (block: ${blockNumber})`);
    
    // Test wallet
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    const balance = await provider.getBalance(wallet.address);
    
    console.log(`✅ Wallet loaded (balance: ${ethers.formatEther(balance)} ETH)`);
    
    if (balance < ethers.parseEther('0.01')) {
      console.warn('⚠️  Low wallet balance - may not be sufficient for gas fees');
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    process.exit(1);
  }
}

async function main(): Promise<void> {
  console.log('🚀 ATOM Arbitrage Orchestrator Launcher');
  console.log('=====================================');
  
  try {
    // Validate environment
    validateEnvironment();
    console.log('✅ Environment variables validated');
    
    // Test connections
    await testConnections();
    
    // Create and start orchestrator
    const orchestrator = new AtomOrchestrator();
    
    // Handle graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n📡 Received ${signal}, shutting down gracefully...`);
      try {
        await orchestrator.stop();
        console.log('✅ Orchestrator stopped successfully');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };
    
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGUSR2', () => shutdown('SIGUSR2')); // For nodemon
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      shutdown('uncaughtException');
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      shutdown('unhandledRejection');
    });
    
    // Start the orchestrator
    await orchestrator.start();
    
    // Keep the process running
    console.log('🔄 Orchestrator is running... Press Ctrl+C to stop');
    
    // Health check endpoint (if needed for monitoring)
    if (process.env.ENABLE_HEALTH_CHECK === 'true') {
      const express = await import('express');
      const app = express.default();
      
      app.get('/health', (_req, res) => {
        res.json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        });
      });
      
      const port = process.env.HEALTH_CHECK_PORT || 3001;
      app.listen(port, () => {
        console.log(`🏥 Health check endpoint available at http://localhost:${port}/health`);
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to start orchestrator:', error);
    process.exit(1);
  }
}

// Run the launcher
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { main };
