#!/usr/bin/env node

/**
 * ATOM Arbitrage System - Production Monitoring Script
 * 
 * This script continuously monitors the production system:
 * - Smart contract health and activity
 * - Frontend availability and performance
 * - Orchestrator bot status and trading activity
 * - Database health and performance
 * - Alert system for critical issues
 */

import { ethers } from 'ethers';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Monitoring configuration
const MONITOR_CONFIG = {
  // Check intervals (in milliseconds)
  CONTRACT_CHECK_INTERVAL: 60000,    // 1 minute
  FRONTEND_CHECK_INTERVAL: 120000,   // 2 minutes
  ORCHESTRATOR_CHECK_INTERVAL: 30000, // 30 seconds
  DATABASE_CHECK_INTERVAL: 180000,   // 3 minutes
  
  // Alert thresholds
  MAX_RESPONSE_TIME_MS: 5000,
  MIN_WALLET_BALANCE_ETH: 0.05,
  MAX_FAILED_TRADES_PERCENT: 20,
  MAX_GAS_PRICE_GWEI: 100,
  
  // Network settings
  RPC_URL: process.env.BASE_MAINNET_RPC_URL || process.env.BASE_SEPOLIA_RPC_URL,
  CONTRACT_ADDRESS: process.env.BASE_MAINNET_CONTRACT_ADDRESS || process.env.BASE_SEPOLIA_CONTRACT_ADDRESS,
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  
  // Service URLs
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://atom-arbitrage.vercel.app',
  ORCHESTRATOR_URL: process.env.ORCHESTRATOR_URL || 'http://localhost:3001',
  
  // Database
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  
  // Notifications
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
  
  // Monitoring settings
  ALERT_COOLDOWN_MS: 300000, // 5 minutes between same alerts
  LOG_RETENTION_HOURS: 24
};

// System state tracking
const systemState = {
  contract: { status: 'unknown', lastCheck: null, alerts: new Set() },
  frontend: { status: 'unknown', lastCheck: null, alerts: new Set() },
  orchestrator: { status: 'unknown', lastCheck: null, alerts: new Set() },
  database: { status: 'unknown', lastCheck: null, alerts: new Set() },
  
  // Performance metrics
  metrics: {
    totalTrades: 0,
    successfulTrades: 0,
    totalProfit: 0,
    avgResponseTime: 0,
    lastTradeTime: null
  },
  
  // Alert tracking
  lastAlerts: new Map(),
  startTime: new Date()
};

// Utility functions
const log = (message, type = 'info', component = 'monitor') => {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] [${component.toUpperCase()}] ${message}`);
};

const sendAlert = async (message, severity = 'warning') => {
  const alertKey = `${severity}:${message}`;
  const now = Date.now();
  
  // Check cooldown
  if (systemState.lastAlerts.has(alertKey)) {
    const lastAlert = systemState.lastAlerts.get(alertKey);
    if (now - lastAlert < MONITOR_CONFIG.ALERT_COOLDOWN_MS) {
      return; // Skip duplicate alert within cooldown period
    }
  }
  
  systemState.lastAlerts.set(alertKey, now);
  
  const emoji = severity === 'critical' ? '🚨' : severity === 'warning' ? '⚠️' : 'ℹ️';
  const alertMessage = `${emoji} ATOM Alert [${severity.toUpperCase()}]\n\n${message}\n\nTime: ${new Date().toISOString()}`;
  
  log(message, severity === 'critical' ? 'error' : 'warning');
  
  // Send Telegram notification
  if (MONITOR_CONFIG.TELEGRAM_BOT_TOKEN && MONITOR_CONFIG.TELEGRAM_CHAT_ID) {
    try {
      await axios.post(`https://api.telegram.org/bot${MONITOR_CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: MONITOR_CONFIG.TELEGRAM_CHAT_ID,
        text: alertMessage,
        parse_mode: 'HTML'
      });
    } catch (error) {
      log(`Failed to send Telegram alert: ${error.message}`, 'error');
    }
  }
};

// Contract monitoring
class ContractMonitor {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(MONITOR_CONFIG.RPC_URL);
    this.wallet = new ethers.Wallet(MONITOR_CONFIG.PRIVATE_KEY, this.provider);
    this.contract = null;
    this.initializeContract();
  }

  initializeContract() {
    const contractABI = [
      "function paused() external view returns (bool)",
      "function getConfig() external view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256)",
      "function owner() external view returns (address)",
      "event ArbitrageExecuted(address indexed token, uint256 amountIn, uint256 profit, uint256 gasUsed)"
    ];
    
    this.contract = new ethers.Contract(
      MONITOR_CONFIG.CONTRACT_ADDRESS,
      contractABI,
      this.wallet
    );
  }

  async checkContractHealth() {
    try {
      const startTime = Date.now();
      
      // Check if contract is paused
      const isPaused = await this.contract.paused();
      if (isPaused) {
        await sendAlert('Smart contract is paused!', 'critical');
        systemState.contract.status = 'paused';
      } else {
        systemState.contract.status = 'active';
      }
      
      // Check wallet balance
      const balance = await this.wallet.getBalance();
      const balanceEth = parseFloat(ethers.formatEther(balance));
      
      if (balanceEth < MONITOR_CONFIG.MIN_WALLET_BALANCE_ETH) {
        await sendAlert(`Low wallet balance: ${balanceEth.toFixed(4)} ETH`, 'critical');
      }
      
      // Check gas price
      const gasPrice = await this.provider.getGasPrice();
      const gasPriceGwei = parseFloat(ethers.formatUnits(gasPrice, 'gwei'));
      
      if (gasPriceGwei > MONITOR_CONFIG.MAX_GAS_PRICE_GWEI) {
        await sendAlert(`High gas price: ${gasPriceGwei.toFixed(1)} gwei`, 'warning');
      }
      
      // Get contract stats
      const config = await this.contract.getConfig();
      systemState.metrics.totalTrades = parseInt(config[3]);
      systemState.metrics.successfulTrades = parseInt(config[4]);
      systemState.metrics.totalProfit = parseFloat(ethers.formatEther(config[5]));
      
      const responseTime = Date.now() - startTime;
      systemState.contract.lastCheck = new Date();
      
      log(`Contract health check completed in ${responseTime}ms`, 'success', 'contract');
      
    } catch (error) {
      systemState.contract.status = 'error';
      await sendAlert(`Contract health check failed: ${error.message}`, 'critical');
    }
  }
}

// Frontend monitoring
class FrontendMonitor {
  async checkFrontendHealth() {
    try {
      const startTime = Date.now();
      
      const response = await axios.get(MONITOR_CONFIG.FRONTEND_URL, {
        timeout: MONITOR_CONFIG.MAX_RESPONSE_TIME_MS
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.status !== 200) {
        await sendAlert(`Frontend returned status ${response.status}`, 'warning');
        systemState.frontend.status = 'degraded';
      } else {
        systemState.frontend.status = 'healthy';
      }
      
      if (responseTime > MONITOR_CONFIG.MAX_RESPONSE_TIME_MS) {
        await sendAlert(`Frontend slow response: ${responseTime}ms`, 'warning');
      }
      
      systemState.metrics.avgResponseTime = responseTime;
      systemState.frontend.lastCheck = new Date();
      
      log(`Frontend health check completed in ${responseTime}ms`, 'success', 'frontend');
      
    } catch (error) {
      systemState.frontend.status = 'error';
      await sendAlert(`Frontend health check failed: ${error.message}`, 'critical');
    }
  }
}

// Orchestrator monitoring
class OrchestratorMonitor {
  async checkOrchestratorHealth() {
    try {
      const startTime = Date.now();
      
      // Check health endpoint
      const response = await axios.get(`${MONITOR_CONFIG.ORCHESTRATOR_URL}/health`, {
        timeout: 10000
      });
      
      if (response.status !== 200) {
        await sendAlert(`Orchestrator health endpoint returned ${response.status}`, 'critical');
        systemState.orchestrator.status = 'error';
        return;
      }
      
      systemState.orchestrator.status = 'running';
      
      const responseTime = Date.now() - startTime;
      systemState.orchestrator.lastCheck = new Date();
      
      log(`Orchestrator health check completed in ${responseTime}ms`, 'success', 'orchestrator');
      
    } catch (error) {
      systemState.orchestrator.status = 'error';
      await sendAlert(`Orchestrator health check failed: ${error.message}`, 'critical');
    }
  }
}

// Database monitoring
class DatabaseMonitor {
  constructor() {
    this.supabase = createClient(
      MONITOR_CONFIG.SUPABASE_URL,
      MONITOR_CONFIG.SUPABASE_SERVICE_KEY
    );
  }

  async checkDatabaseHealth() {
    try {
      const startTime = Date.now();
      
      // Test database connection
      const { data, error } = await this.supabase
        .from('system_logs')
        .select('count')
        .limit(1);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Check recent trading activity
      const { data: recentTrades, error: tradesError } = await this.supabase
        .from('arbitrage_trades')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(10);
      
      if (tradesError) {
        throw new Error(tradesError.message);
      }
      
      // Calculate success rate
      if (recentTrades && recentTrades.length > 0) {
        const successfulTrades = recentTrades.filter(trade => trade.status === 'success').length;
        const successRate = (successfulTrades / recentTrades.length) * 100;
        
        if (successRate < (100 - MONITOR_CONFIG.MAX_FAILED_TRADES_PERCENT)) {
          await sendAlert(`Low success rate: ${successRate.toFixed(1)}%`, 'warning');
        }
        
        systemState.metrics.lastTradeTime = recentTrades[0].executed_at;
      }
      
      const responseTime = Date.now() - startTime;
      systemState.database.status = 'healthy';
      systemState.database.lastCheck = new Date();
      
      log(`Database health check completed in ${responseTime}ms`, 'success', 'database');
      
    } catch (error) {
      systemState.database.status = 'error';
      await sendAlert(`Database health check failed: ${error.message}`, 'critical');
    }
  }
}

// Main monitoring orchestrator
class SystemMonitor {
  constructor() {
    this.contractMonitor = new ContractMonitor();
    this.frontendMonitor = new FrontendMonitor();
    this.orchestratorMonitor = new OrchestratorMonitor();
    this.databaseMonitor = new DatabaseMonitor();
    
    this.intervals = new Map();
  }

  start() {
    log('🚀 Starting ATOM System Monitor');
    log('='.repeat(50));
    
    // Start monitoring intervals
    this.intervals.set('contract', setInterval(
      () => this.contractMonitor.checkContractHealth(),
      MONITOR_CONFIG.CONTRACT_CHECK_INTERVAL
    ));
    
    this.intervals.set('frontend', setInterval(
      () => this.frontendMonitor.checkFrontendHealth(),
      MONITOR_CONFIG.FRONTEND_CHECK_INTERVAL
    ));
    
    this.intervals.set('orchestrator', setInterval(
      () => this.orchestratorMonitor.checkOrchestratorHealth(),
      MONITOR_CONFIG.ORCHESTRATOR_CHECK_INTERVAL
    ));
    
    this.intervals.set('database', setInterval(
      () => this.databaseMonitor.checkDatabaseHealth(),
      MONITOR_CONFIG.DATABASE_CHECK_INTERVAL
    ));
    
    // Status report interval
    this.intervals.set('status', setInterval(
      () => this.printStatusReport(),
      300000 // 5 minutes
    ));
    
    // Run initial checks
    this.runInitialChecks();
    
    log('✅ System monitor started successfully');
  }

  async runInitialChecks() {
    log('🔍 Running initial system checks...');
    
    await this.contractMonitor.checkContractHealth();
    await this.frontendMonitor.checkFrontendHealth();
    await this.orchestratorMonitor.checkOrchestratorHealth();
    await this.databaseMonitor.checkDatabaseHealth();
    
    log('✅ Initial system checks completed');
  }

  printStatusReport() {
    const uptime = Math.floor((Date.now() - systemState.startTime.getTime()) / 1000);
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimeMinutes = Math.floor((uptime % 3600) / 60);
    
    log('\n📊 SYSTEM STATUS REPORT');
    log('='.repeat(30));
    log(`⏱️ Uptime: ${uptimeHours}h ${uptimeMinutes}m`);
    log(`📋 Contract: ${systemState.contract.status}`);
    log(`🌐 Frontend: ${systemState.frontend.status}`);
    log(`🤖 Orchestrator: ${systemState.orchestrator.status}`);
    log(`🗄️ Database: ${systemState.database.status}`);
    log(`📈 Total Trades: ${systemState.metrics.totalTrades}`);
    log(`✅ Successful: ${systemState.metrics.successfulTrades}`);
    log(`💰 Total Profit: ${systemState.metrics.totalProfit.toFixed(4)} ETH`);
    log('='.repeat(30));
  }

  stop() {
    log('🛑 Stopping system monitor...');
    
    this.intervals.forEach((interval, name) => {
      clearInterval(interval);
      log(`✅ Stopped ${name} monitoring`);
    });
    
    log('✅ System monitor stopped');
  }
}

// Signal handling for graceful shutdown
const monitor = new SystemMonitor();

process.on('SIGINT', () => {
  log('📡 Received SIGINT, shutting down gracefully...');
  monitor.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('📡 Received SIGTERM, shutting down gracefully...');
  monitor.stop();
  process.exit(0);
});

// Start monitoring if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  monitor.start();
}

export { SystemMonitor };
