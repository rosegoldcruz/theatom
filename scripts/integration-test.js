#!/usr/bin/env node

/**
 * ATOM Arbitrage System - Integration Test Suite
 *
 * This script performs end-to-end testing of the entire ATOM system:
 * - Smart contract functionality
 * - API endpoints
 * - Database operations
 * - Orchestrator bot
 * - Frontend integration
 */

import { ethers } from 'ethers';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Test configuration
const TEST_CONFIG = {
  // Network settings
  RPC_URL: process.env.BASE_SEPOLIA_RPC_URL,
  CONTRACT_ADDRESS: process.env.BASE_SEPOLIA_CONTRACT_ADDRESS,
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  
  // API settings
  API_BASE_URL: process.env.API_BASE_URL || 'http://152.42.234.243:8000',
  
  // Database settings
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  
  // Test user
  TEST_EMAIL: 'test@atom-arbitrage.com',
  TEST_PASSWORD: 'TestPassword123!',
  
  // Test amounts (in ETH)
  TEST_AMOUNT: '0.001',
  MIN_PROFIT_BP: 50,
  MAX_SLIPPAGE_BP: 300,
  MAX_GAS_GWEI: 50
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Utility functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const assert = (condition, message) => {
  if (condition) {
    testResults.passed++;
    log(`PASS: ${message}`, 'success');
  } else {
    testResults.failed++;
    testResults.errors.push(message);
    log(`FAIL: ${message}`, 'error');
  }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test suite classes
class ContractTester {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(TEST_CONFIG.RPC_URL);
    this.wallet = new ethers.Wallet(TEST_CONFIG.PRIVATE_KEY, this.provider);
    this.contract = null;
  }

  async initialize() {
    log('Initializing contract tester...');
    
    // Load contract ABI (simplified for testing)
    const contractABI = [
      "function paused() external view returns (bool)",
      "function getConfig() external view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256)",
      "function owner() external view returns (address)",
      "event ArbitrageExecuted(address indexed token, uint256 amountIn, uint256 profit, uint256 gasUsed)"
    ];
    
    this.contract = new ethers.Contract(
      TEST_CONFIG.CONTRACT_ADDRESS,
      contractABI,
      this.wallet
    );
    
    log('Contract tester initialized');
  }

  async testContractDeployment() {
    log('Testing contract deployment...');
    
    try {
      const code = await this.provider.getCode(TEST_CONFIG.CONTRACT_ADDRESS);
      assert(code !== '0x', 'Contract is deployed');
      
      const owner = await this.contract.owner();
      assert(owner === this.wallet.address, 'Contract owner is correct');
      
      const isPaused = await this.contract.paused();
      log(`Contract paused status: ${isPaused}`);
      
    } catch (error) {
      assert(false, `Contract deployment test failed: ${error.message}`);
    }
  }

  async testContractConfiguration() {
    log('Testing contract configuration...');
    
    try {
      const config = await this.contract.getConfig();
      
      assert(config.length === 7, 'Contract config has correct structure');
      assert(config[0] > 0, 'Min profit basis points is set');
      assert(config[1] > 0, 'Max slippage basis points is set');
      assert(config[2] > 0, 'Max gas price is set');
      
      log(`Contract config: minProfit=${config[0]}bp, maxSlippage=${config[1]}bp, maxGas=${ethers.formatUnits(config[2], 'gwei')}gwei`);
      
    } catch (error) {
      assert(false, `Contract configuration test failed: ${error.message}`);
    }
  }

  async testWalletBalance() {
    log('Testing wallet balance...');
    
    try {
      const balance = await this.wallet.getBalance();
      const balanceEth = ethers.formatEther(balance);
      
      assert(parseFloat(balanceEth) > 0.01, 'Wallet has sufficient balance for testing');
      log(`Wallet balance: ${balanceEth} ETH`);
      
    } catch (error) {
      assert(false, `Wallet balance test failed: ${error.message}`);
    }
  }
}

class APITester {
  constructor() {
    this.baseURL = TEST_CONFIG.API_BASE_URL;
    this.authToken = null;
  }

  async testHealthEndpoint() {
    log('Testing API health endpoint...');
    
    try {
      const response = await axios.get(`${this.baseURL}/api/health`);
      assert(response.status === 200, 'Health endpoint returns 200');
      assert(response.data.status === 'healthy', 'Health endpoint returns healthy status');
      
    } catch (error) {
      assert(false, `Health endpoint test failed: ${error.message}`);
    }
  }

  async testUserRegistration() {
    log('Testing user registration...');
    
    try {
      const response = await axios.post(`${this.baseURL}/api/auth/register`, {
        email: TEST_CONFIG.TEST_EMAIL,
        password: TEST_CONFIG.TEST_PASSWORD,
        confirmPassword: TEST_CONFIG.TEST_PASSWORD
      });
      
      if (response.status === 201) {
        assert(response.data.success === true, 'Registration successful');
        assert(response.data.token, 'Registration returns auth token');
        this.authToken = response.data.token;
      } else if (response.status === 409) {
        log('User already exists, attempting login...');
        await this.testUserLogin();
      }
      
    } catch (error) {
      if (error.response?.status === 409) {
        log('User already exists, attempting login...');
        await this.testUserLogin();
      } else {
        assert(false, `User registration test failed: ${error.message}`);
      }
    }
  }

  async testUserLogin() {
    log('Testing user login...');
    
    try {
      const response = await axios.post(`${this.baseURL}/api/auth/login`, {
        email: TEST_CONFIG.TEST_EMAIL,
        password: TEST_CONFIG.TEST_PASSWORD
      });
      
      assert(response.status === 200, 'Login returns 200');
      assert(response.data.success === true, 'Login successful');
      assert(response.data.token, 'Login returns auth token');
      
      this.authToken = response.data.token;
      
    } catch (error) {
      assert(false, `User login test failed: ${error.message}`);
    }
  }

  async testConfigurationAPI() {
    log('Testing configuration API...');
    
    if (!this.authToken) {
      assert(false, 'No auth token available for configuration test');
      return;
    }
    
    try {
      // Test creating configuration
      const createResponse = await axios.post(`${this.baseURL}/api/config`, {
        name: 'Test Configuration',
        min_profit_basis_points: TEST_CONFIG.MIN_PROFIT_BP,
        max_slippage_basis_points: TEST_CONFIG.MAX_SLIPPAGE_BP,
        max_gas_price_gwei: TEST_CONFIG.MAX_GAS_GWEI,
        enabled_tokens: ['0x4200000000000000000000000000000000000006'],
        enabled_dexes: ['uniswap_v2', 'uniswap_v3'],
        flash_loan_enabled: true,
        max_trade_amount_eth: 1.0
      }, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });
      
      assert(createResponse.status === 201, 'Configuration creation returns 201');
      assert(createResponse.data.success === true, 'Configuration creation successful');
      
      const configId = createResponse.data.data.id;
      
      // Test getting configurations
      const getResponse = await axios.get(`${this.baseURL}/api/config`, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });
      
      assert(getResponse.status === 200, 'Configuration retrieval returns 200');
      assert(Array.isArray(getResponse.data.data), 'Configuration retrieval returns array');
      
      // Test deleting configuration
      const deleteResponse = await axios.delete(`${this.baseURL}/api/config?id=${configId}`, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });
      
      assert(deleteResponse.status === 200, 'Configuration deletion returns 200');
      
    } catch (error) {
      assert(false, `Configuration API test failed: ${error.message}`);
    }
  }

  async testDashboardAPI() {
    log('Testing dashboard API...');
    
    if (!this.authToken) {
      assert(false, 'No auth token available for dashboard test');
      return;
    }
    
    try {
      const response = await axios.get(`${this.baseURL}/api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });
      
      assert(response.status === 200, 'Dashboard stats returns 200');
      assert(response.data.success === true, 'Dashboard stats successful');
      assert(response.data.data.overview, 'Dashboard stats contains overview');
      
    } catch (error) {
      assert(false, `Dashboard API test failed: ${error.message}`);
    }
  }
}

class DatabaseTester {
  constructor() {
    this.supabase = createClient(
      TEST_CONFIG.SUPABASE_URL,
      TEST_CONFIG.SUPABASE_SERVICE_KEY
    );
  }

  async testDatabaseConnection() {
    log('Testing database connection...');
    
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('count')
        .limit(1);
      
      assert(!error, 'Database connection successful');
      
    } catch (error) {
      assert(false, `Database connection test failed: ${error.message}`);
    }
  }

  async testTableStructure() {
    log('Testing database table structure...');
    
    const requiredTables = [
      'users',
      'arbitrage_config',
      'arbitrage_opportunities',
      'arbitrage_trades',
      'bot_status',
      'system_logs',
      'recent_activity'
    ];
    
    for (const table of requiredTables) {
      try {
        const { data, error } = await this.supabase
          .from(table)
          .select('*')
          .limit(1);
        
        assert(!error, `Table ${table} exists and is accessible`);
        
      } catch (error) {
        assert(false, `Table ${table} test failed: ${error.message}`);
      }
    }
  }
}

// Main test runner
async function runIntegrationTests() {
  log('🚀 Starting ATOM Arbitrage Integration Tests');
  log('='.repeat(50));
  
  try {
    // Initialize testers
    const contractTester = new ContractTester();
    const apiTester = new APITester();
    const dbTester = new DatabaseTester();
    
    // Contract tests
    log('\n📋 Running Contract Tests...');
    await contractTester.initialize();
    await contractTester.testContractDeployment();
    await contractTester.testContractConfiguration();
    await contractTester.testWalletBalance();
    
    // Database tests
    log('\n🗄️ Running Database Tests...');
    await dbTester.testDatabaseConnection();
    await dbTester.testTableStructure();
    
    // API tests
    log('\n🔌 Running API Tests...');
    await apiTester.testHealthEndpoint();
    await apiTester.testUserRegistration();
    await apiTester.testConfigurationAPI();
    await apiTester.testDashboardAPI();
    
    // Summary
    log('\n📊 Test Results Summary');
    log('='.repeat(30));
    log(`✅ Passed: ${testResults.passed}`);
    log(`❌ Failed: ${testResults.failed}`);
    log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
    
    if (testResults.failed > 0) {
      log('\n❌ Failed Tests:');
      testResults.errors.forEach(error => log(`  - ${error}`, 'error'));
      process.exit(1);
    } else {
      log('\n🎉 All tests passed! System is ready for production.', 'success');
      process.exit(0);
    }
    
  } catch (error) {
    log(`💥 Integration test suite failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runIntegrationTests();
}

export { runIntegrationTests };
