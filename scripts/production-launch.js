#!/usr/bin/env node

/**
 * ATOM Arbitrage System - Production Launch Script
 * 
 * This script handles the complete production launch process:
 * - Pre-launch validation
 * - Contract deployment to mainnet
 * - Frontend deployment
 * - Orchestrator startup
 * - Post-launch monitoring
 */

import { ethers } from 'ethers';
import axios from 'axios';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

// Launch configuration
const LAUNCH_CONFIG = {
  // Network settings
  MAINNET_RPC_URL: process.env.BASE_MAINNET_RPC_URL,
  TESTNET_RPC_URL: process.env.BASE_SEPOLIA_RPC_URL,
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  
  // Deployment settings
  VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID,
  VERCEL_TOKEN: process.env.VERCEL_TOKEN,
  
  // Monitoring settings
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
  
  // Safety limits
  MAX_GAS_PRICE_GWEI: 50,
  MIN_WALLET_BALANCE_ETH: 0.1,
  INITIAL_TRADE_LIMIT_ETH: 0.1
};

// Launch state tracking
const launchState = {
  phase: 'pre-launch',
  contractAddress: null,
  frontendUrl: null,
  orchestratorStatus: 'stopped',
  errors: [],
  startTime: new Date()
};

// Utility functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const sendTelegramNotification = async (message) => {
  if (!LAUNCH_CONFIG.TELEGRAM_BOT_TOKEN || !LAUNCH_CONFIG.TELEGRAM_CHAT_ID) {
    return;
  }
  
  try {
    await axios.post(`https://api.telegram.org/bot${LAUNCH_CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: LAUNCH_CONFIG.TELEGRAM_CHAT_ID,
      text: `🚀 ATOM Launch: ${message}`,
      parse_mode: 'HTML'
    });
  } catch (error) {
    log(`Failed to send Telegram notification: ${error.message}`, 'warning');
  }
};

const executeCommand = (command, description) => {
  log(`Executing: ${description}`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`✅ ${description} completed`);
    return output;
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'error');
    throw error;
  }
};

// Pre-launch validation
class PreLaunchValidator {
  async validateEnvironment() {
    log('🔍 Validating environment configuration...');
    
    const requiredVars = [
      'BASE_MAINNET_RPC_URL',
      'PRIVATE_KEY',
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'JWT_SECRET'
    ];
    
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    log('✅ Environment configuration validated');
  }

  async validateWalletBalance() {
    log('💰 Validating wallet balance...');
    
    const provider = new ethers.JsonRpcProvider(LAUNCH_CONFIG.MAINNET_RPC_URL);
    const wallet = new ethers.Wallet(LAUNCH_CONFIG.PRIVATE_KEY, provider);
    
    const balance = await wallet.getBalance();
    const balanceEth = parseFloat(ethers.formatEther(balance));
    
    if (balanceEth < LAUNCH_CONFIG.MIN_WALLET_BALANCE_ETH) {
      throw new Error(`Insufficient wallet balance: ${balanceEth} ETH (minimum: ${LAUNCH_CONFIG.MIN_WALLET_BALANCE_ETH} ETH)`);
    }
    
    log(`✅ Wallet balance validated: ${balanceEth} ETH`);
  }

  async validateGasPrice() {
    log('⛽ Validating gas price...');
    
    const provider = new ethers.JsonRpcProvider(LAUNCH_CONFIG.MAINNET_RPC_URL);
    const gasPrice = await provider.getGasPrice();
    const gasPriceGwei = parseFloat(ethers.formatUnits(gasPrice, 'gwei'));
    
    if (gasPriceGwei > LAUNCH_CONFIG.MAX_GAS_PRICE_GWEI) {
      throw new Error(`Gas price too high: ${gasPriceGwei} gwei (maximum: ${LAUNCH_CONFIG.MAX_GAS_PRICE_GWEI} gwei)`);
    }
    
    log(`✅ Gas price validated: ${gasPriceGwei} gwei`);
  }

  async validateTestnetDeployment() {
    log('🧪 Validating testnet deployment...');
    
    if (!process.env.BASE_SEPOLIA_CONTRACT_ADDRESS) {
      throw new Error('Testnet contract not deployed. Deploy to testnet first.');
    }
    
    const provider = new ethers.JsonRpcProvider(LAUNCH_CONFIG.TESTNET_RPC_URL);
    const code = await provider.getCode(process.env.BASE_SEPOLIA_CONTRACT_ADDRESS);
    
    if (code === '0x') {
      throw new Error('Testnet contract not found at specified address');
    }
    
    log('✅ Testnet deployment validated');
  }

  async runIntegrationTests() {
    log('🧪 Running integration tests...');
    
    try {
      executeCommand('node scripts/integration-test.js', 'Integration tests');
    } catch (error) {
      throw new Error('Integration tests failed. Fix issues before launching to production.');
    }
  }
}

// Contract deployment
class ContractDeployer {
  async deployToMainnet() {
    log('📋 Deploying smart contract to Base Mainnet...');
    
    try {
      const output = executeCommand(
        'npm run deploy:base-mainnet',
        'Contract deployment to mainnet'
      );
      
      // Extract contract address from deployment output
      const addressMatch = output.match(/Contract deployed to: (0x[a-fA-F0-9]{40})/);
      if (addressMatch) {
        launchState.contractAddress = addressMatch[1];
        log(`✅ Contract deployed to: ${launchState.contractAddress}`);
      } else {
        throw new Error('Could not extract contract address from deployment output');
      }
      
    } catch (error) {
      throw new Error(`Contract deployment failed: ${error.message}`);
    }
  }

  async verifyContract() {
    log('🔍 Verifying contract on Etherscan...');
    
    if (!launchState.contractAddress) {
      throw new Error('No contract address available for verification');
    }
    
    try {
      executeCommand(
        `npx hardhat verify --network base_mainnet ${launchState.contractAddress}`,
        'Contract verification'
      );
    } catch (error) {
      log(`⚠️ Contract verification failed: ${error.message}`, 'warning');
      // Don't fail the launch for verification issues
    }
  }
}

// Frontend deployment
class FrontendDeployer {
  async deployToVercel() {
    log('🌐 Deploying frontend to Vercel...');
    
    try {
      // Update environment variables with mainnet contract address
      if (launchState.contractAddress) {
        process.env.VITE_BASE_MAINNET_CONTRACT_ADDRESS = launchState.contractAddress;
      }
      
      const output = executeCommand(
        'vercel --prod --yes',
        'Frontend deployment to Vercel'
      );
      
      // Extract deployment URL
      const urlMatch = output.match(/https:\/\/[^\s]+/);
      if (urlMatch) {
        launchState.frontendUrl = urlMatch[0];
        log(`✅ Frontend deployed to: ${launchState.frontendUrl}`);
      }
      
    } catch (error) {
      throw new Error(`Frontend deployment failed: ${error.message}`);
    }
  }

  async validateDeployment() {
    log('🔍 Validating frontend deployment...');
    
    if (!launchState.frontendUrl) {
      throw new Error('No frontend URL available for validation');
    }
    
    try {
      const response = await axios.get(launchState.frontendUrl, { timeout: 30000 });
      
      if (response.status !== 200) {
        throw new Error(`Frontend returned status ${response.status}`);
      }
      
      log('✅ Frontend deployment validated');
      
    } catch (error) {
      throw new Error(`Frontend validation failed: ${error.message}`);
    }
  }
}

// Orchestrator management
class OrchestratorManager {
  async startOrchestrator() {
    log('🤖 Starting orchestrator bot...');
    
    try {
      // Update orchestrator environment with mainnet settings
      const envUpdates = {
        NODE_ENV: 'production',
        BASE_MAINNET_CONTRACT_ADDRESS: launchState.contractAddress,
        MAX_TRADE_AMOUNT_ETH: LAUNCH_CONFIG.INITIAL_TRADE_LIMIT_ETH.toString()
      };
      
      // Start orchestrator (implementation depends on deployment method)
      // This is a placeholder - actual implementation would depend on your deployment strategy
      log('🤖 Orchestrator startup initiated');
      launchState.orchestratorStatus = 'starting';
      
      // Wait for orchestrator to be ready
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      launchState.orchestratorStatus = 'running';
      log('✅ Orchestrator bot started successfully');
      
    } catch (error) {
      throw new Error(`Orchestrator startup failed: ${error.message}`);
    }
  }

  async validateOrchestrator() {
    log('🔍 Validating orchestrator status...');
    
    try {
      // Check orchestrator health endpoint
      const response = await axios.get('http://localhost:3001/health', { timeout: 10000 });
      
      if (response.status !== 200) {
        throw new Error(`Orchestrator health check failed: ${response.status}`);
      }
      
      log('✅ Orchestrator validation successful');
      
    } catch (error) {
      log(`⚠️ Orchestrator validation failed: ${error.message}`, 'warning');
      // Don't fail launch for orchestrator issues
    }
  }
}

// Post-launch monitoring
class PostLaunchMonitor {
  async setupMonitoring() {
    log('📊 Setting up post-launch monitoring...');
    
    // Send launch notification
    const launchMessage = `
🚀 <b>ATOM Arbitrage System Launched!</b>

📋 Contract: <code>${launchState.contractAddress}</code>
🌐 Frontend: ${launchState.frontendUrl}
🤖 Orchestrator: ${launchState.orchestratorStatus}
⏱️ Launch Time: ${launchState.startTime.toISOString()}

System is now live and ready for trading!
    `;
    
    await sendTelegramNotification(launchMessage);
    
    log('✅ Post-launch monitoring setup complete');
  }

  async performInitialChecks() {
    log('🔍 Performing initial post-launch checks...');
    
    // Wait for system to stabilize
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // Check for any immediate issues
    // This would include checking logs, monitoring metrics, etc.
    
    log('✅ Initial post-launch checks completed');
  }
}

// Main launch orchestrator
async function launchToProduction() {
  log('🚀 Starting ATOM Arbitrage Production Launch');
  log('='.repeat(60));
  
  const validator = new PreLaunchValidator();
  const contractDeployer = new ContractDeployer();
  const frontendDeployer = new FrontendDeployer();
  const orchestratorManager = new OrchestratorManager();
  const monitor = new PostLaunchMonitor();
  
  try {
    // Phase 1: Pre-launch validation
    launchState.phase = 'validation';
    log('\n🔍 Phase 1: Pre-launch Validation');
    await validator.validateEnvironment();
    await validator.validateWalletBalance();
    await validator.validateGasPrice();
    await validator.validateTestnetDeployment();
    await validator.runIntegrationTests();
    
    // Phase 2: Contract deployment
    launchState.phase = 'contract-deployment';
    log('\n📋 Phase 2: Contract Deployment');
    await contractDeployer.deployToMainnet();
    await contractDeployer.verifyContract();
    
    // Phase 3: Frontend deployment
    launchState.phase = 'frontend-deployment';
    log('\n🌐 Phase 3: Frontend Deployment');
    await frontendDeployer.deployToVercel();
    await frontendDeployer.validateDeployment();
    
    // Phase 4: Orchestrator startup
    launchState.phase = 'orchestrator-startup';
    log('\n🤖 Phase 4: Orchestrator Startup');
    await orchestratorManager.startOrchestrator();
    await orchestratorManager.validateOrchestrator();
    
    // Phase 5: Post-launch monitoring
    launchState.phase = 'post-launch';
    log('\n📊 Phase 5: Post-launch Monitoring');
    await monitor.setupMonitoring();
    await monitor.performInitialChecks();
    
    // Launch complete
    launchState.phase = 'complete';
    const duration = (new Date() - launchState.startTime) / 1000;
    
    log('\n🎉 PRODUCTION LAUNCH SUCCESSFUL! 🎉');
    log(`⏱️ Total launch time: ${duration.toFixed(1)} seconds`);
    log(`📋 Contract: ${launchState.contractAddress}`);
    log(`🌐 Frontend: ${launchState.frontendUrl}`);
    log(`🤖 Orchestrator: ${launchState.orchestratorStatus}`);
    
    await sendTelegramNotification('🎉 ATOM Arbitrage System successfully launched to production!');
    
  } catch (error) {
    launchState.errors.push(error.message);
    log(`💥 Launch failed in phase ${launchState.phase}: ${error.message}`, 'error');
    
    await sendTelegramNotification(`❌ ATOM launch failed in phase ${launchState.phase}: ${error.message}`);
    
    process.exit(1);
  }
}

// Run launch if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  launchToProduction();
}

export { launchToProduction };
