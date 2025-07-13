const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

/**
 * PRODUCTION-GRADE CONFIGURATION
 * 
 * This configuration is designed for real trading with proper risk management,
 * security measures, and performance optimization.
 */

const config = {
  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Network Configuration
  network: {
    rpcUrl: process.env.RPC_URL || 'http://127.0.0.1:8545',
    chainId: parseInt(process.env.CHAIN_ID) || 31337,
    confirmations: parseInt(process.env.CONFIRMATIONS) || 1,
    timeout: parseInt(process.env.NETWORK_TIMEOUT) || 30000
  },
  
  // Wallet Configuration
  wallet: {
    privateKey: process.env.PRIVATE_KEY,
    maxGasPrice: parseInt(process.env.MAX_GAS_PRICE) || 100, // gwei
    gasMultiplier: parseFloat(process.env.GAS_MULTIPLIER) || 1.2,
    nonceManagement: true
  },
  
  // Contract Addresses
  contracts: {
    atomArbitrage: process.env.ATOM_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    aaveProvider: '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e',
    uniswapRouter: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    sushiswapRouter: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
    curveRouter: '0x8301AE4fc9c624d1D396cbDAa1ed877821D7C511'
  },
  
  // Scanner Agent Configuration
  scanner: {
    scanInterval: parseInt(process.env.SCAN_INTERVAL) || 3000, // 3 seconds
    maxConcurrentScans: parseInt(process.env.MAX_CONCURRENT_SCANS) || 5,
    priceTolerancePercent: parseFloat(process.env.PRICE_TOLERANCE) || 0.1,
    minLiquidityUSD: parseInt(process.env.MIN_LIQUIDITY_USD) || 10000,
    
    // DEX configurations
    dexes: [
      {
        name: 'Uniswap V2',
        router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        fee: 0.003,
        priority: 1
      },
      {
        name: 'SushiSwap',
        router: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
        factory: '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac',
        fee: 0.003,
        priority: 2
      },
      {
        name: 'Curve',
        router: '0x8301AE4fc9c624d1D396cbDAa1ed877821D7C511',
        factory: '0x0959158b6040D32d04c301A72CBFD6b39E21c9AE',
        fee: 0.0004,
        priority: 3
      }
    ],
    
    // Trading pairs to monitor
    pairs: [
      {
        symbol: 'ETH/USDC',
        tokenA: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        tokenB: '0xA0b86a33E6441b8435b662f0E2d0a8b0e6E6E6E6', // USDC
        decimalsA: 18,
        decimalsB: 6,
        minVolumeETH: '1.0',
        priority: 1
      },
      {
        symbol: 'WBTC/USDC',
        tokenA: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
        tokenB: '0xA0b86a33E6441b8435b662f0E2d0a8b0e6E6E6E6', // USDC
        decimalsA: 8,
        decimalsB: 6,
        minVolumeETH: '0.5',
        priority: 2
      },
      {
        symbol: 'UNI/ETH',
        tokenA: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // UNI
        tokenB: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        decimalsA: 18,
        decimalsB: 18,
        minVolumeETH: '0.3',
        priority: 3
      }
    ]
  },
  
  // Risk Manager Configuration
  riskManager: {
    // Position limits
    maxPositionSizeETH: parseFloat(process.env.MAX_POSITION_SIZE) || 5.0,
    maxDailyLossUSD: parseInt(process.env.MAX_DAILY_LOSS) || 500,
    maxWeeklyLossUSD: parseInt(process.env.MAX_WEEKLY_LOSS) || 2000,
    
    // Risk thresholds
    maxSlippagePercent: parseFloat(process.env.MAX_SLIPPAGE) || 0.5,
    minConfidencePercent: parseInt(process.env.MIN_CONFIDENCE) || 75,
    minProfitThresholdUSD: parseInt(process.env.MIN_PROFIT_THRESHOLD) || 15,
    
    // Gas limits
    maxGasPriceGwei: parseInt(process.env.MAX_GAS_PRICE) || 100,
    maxGasCostUSD: parseInt(process.env.MAX_GAS_COST) || 50,
    
    // Timing controls
    cooldownPeriodMs: parseInt(process.env.COOLDOWN_PERIOD) || 30000, // 30 seconds
    maxExecutionTimeMs: parseInt(process.env.MAX_EXECUTION_TIME) || 60000, // 1 minute
    
    // Circuit breakers
    circuitBreakers: {
      consecutiveLossLimit: parseInt(process.env.CONSECUTIVE_LOSS_LIMIT) || 3,
      rapidLossLimit: parseInt(process.env.RAPID_LOSS_LIMIT) || 5,
      rapidLossWindowMs: parseInt(process.env.RAPID_LOSS_WINDOW) || 300000, // 5 minutes
      lowSuccessRateThreshold: parseFloat(process.env.LOW_SUCCESS_RATE) || 0.5,
      emergencyStopLossUSD: parseInt(process.env.EMERGENCY_STOP_LOSS) || 1000
    }
  },
  
  // Executor Configuration
  executor: {
    maxConcurrentExecutions: parseInt(process.env.MAX_CONCURRENT_EXECUTIONS) || 3,
    maxRetries: parseInt(process.env.MAX_RETRIES) || 3,
    retryDelayMs: parseInt(process.env.RETRY_DELAY) || 5000,
    
    // Transaction settings
    gasLimitMultiplier: parseFloat(process.env.GAS_LIMIT_MULTIPLIER) || 1.2,
    gasPriceStrategy: process.env.GAS_PRICE_STRATEGY || 'fast', // slow, standard, fast
    
    // Execution optimization
    priorityFeeGwei: parseInt(process.env.PRIORITY_FEE) || 2,
    maxFeePerGasGwei: parseInt(process.env.MAX_FEE_PER_GAS) || 100,
    
    // Monitoring
    executionTimeoutMs: parseInt(process.env.EXECUTION_TIMEOUT) || 120000, // 2 minutes
    confirmationTimeoutMs: parseInt(process.env.CONFIRMATION_TIMEOUT) || 300000 // 5 minutes
  },
  
  // AI Coordinator Configuration
  aiCoordinator: {
    // Learning parameters
    learningRate: parseFloat(process.env.AI_LEARNING_RATE) || 0.1,
    adaptationThreshold: parseFloat(process.env.AI_ADAPTATION_THRESHOLD) || 0.6,
    
    // Strategy parameters
    initialAggressiveness: parseFloat(process.env.AI_AGGRESSIVENESS) || 0.5,
    riskTolerance: parseFloat(process.env.AI_RISK_TOLERANCE) || 0.3,
    
    // Market analysis
    volatilityWindowMs: parseInt(process.env.VOLATILITY_WINDOW) || 3600000, // 1 hour
    liquidityAnalysisIntervalMs: parseInt(process.env.LIQUIDITY_ANALYSIS_INTERVAL) || 300000, // 5 minutes
    
    // Decision making
    decisionTimeoutMs: parseInt(process.env.AI_DECISION_TIMEOUT) || 5000,
    confidenceThreshold: parseFloat(process.env.AI_CONFIDENCE_THRESHOLD) || 0.7,
    
    // Adaptation
    adaptationIntervalMs: parseInt(process.env.AI_ADAPTATION_INTERVAL) || 300000, // 5 minutes
    performanceWindowMs: parseInt(process.env.AI_PERFORMANCE_WINDOW) || 3600000 // 1 hour
  },
  
  // Security Configuration
  security: {
    // Multi-signature (if enabled)
    multisigEnabled: process.env.MULTISIG_ENABLED === 'true',
    multisigAddress: process.env.MULTISIG_ADDRESS,
    requiredSignatures: parseInt(process.env.REQUIRED_SIGNATURES) || 2,
    
    // Emergency controls
    emergencyStopEnabled: true,
    emergencyContacts: (process.env.EMERGENCY_CONTACTS || '').split(',').filter(Boolean),
    
    // Audit trail
    auditLogEnabled: true,
    auditLogPath: process.env.AUDIT_LOG_PATH || './logs/audit.log',
    
    // Rate limiting
    rateLimitEnabled: true,
    maxTransactionsPerHour: parseInt(process.env.MAX_TX_PER_HOUR) || 100,
    maxTransactionsPerDay: parseInt(process.env.MAX_TX_PER_DAY) || 1000
  },
  
  // Monitoring Configuration
  monitoring: {
    // Health checks
    healthCheckIntervalMs: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000,
    
    // Metrics
    metricsEnabled: process.env.METRICS_ENABLED !== 'false',
    metricsPort: parseInt(process.env.METRICS_PORT) || 9090,
    
    // Alerts
    alertsEnabled: process.env.ALERTS_ENABLED !== 'false',
    alertWebhookUrl: process.env.ALERT_WEBHOOK_URL,
    
    // Logging
    logLevel: process.env.LOG_LEVEL || 'info',
    logFile: process.env.LOG_FILE || './logs/arbitrage.log',
    logRotation: process.env.LOG_ROTATION !== 'false'
  },
  
  // Performance Configuration
  performance: {
    // Memory management
    maxMemoryUsageMB: parseInt(process.env.MAX_MEMORY_USAGE) || 512,
    gcIntervalMs: parseInt(process.env.GC_INTERVAL) || 300000, // 5 minutes
    
    // CPU optimization
    maxCpuUsagePercent: parseInt(process.env.MAX_CPU_USAGE) || 80,
    
    // Database optimization
    maxDbConnections: parseInt(process.env.MAX_DB_CONNECTIONS) || 10,
    dbQueryTimeoutMs: parseInt(process.env.DB_QUERY_TIMEOUT) || 30000,
    
    // Caching
    cacheEnabled: process.env.CACHE_ENABLED !== 'false',
    cacheTtlMs: parseInt(process.env.CACHE_TTL) || 60000, // 1 minute
    maxCacheSize: parseInt(process.env.MAX_CACHE_SIZE) || 1000
  },
  
  // Development/Testing overrides
  development: {
    mockMode: process.env.MOCK_MODE === 'true',
    simulationMode: process.env.SIMULATION_MODE === 'true',
    testnetMode: process.env.TESTNET_MODE === 'true',
    debugMode: process.env.DEBUG_MODE === 'true'
  }
};

// Validation
function validateConfig() {
  const required = [
    'network.rpcUrl',
    'wallet.privateKey',
    'contracts.atomArbitrage'
  ];
  
  for (const path of required) {
    const value = path.split('.').reduce((obj, key) => obj?.[key], config);
    if (!value) {
      throw new Error(`Required configuration missing: ${path}`);
    }
  }
  
  // Validate numeric ranges
  if (config.riskManager.maxSlippagePercent > 5) {
    throw new Error('Max slippage too high (>5%)');
  }
  
  if (config.riskManager.maxPositionSizeETH > 100) {
    throw new Error('Max position size too high (>100 ETH)');
  }
  
  console.log('✅ Configuration validated');
}

// Validate on load
validateConfig();

module.exports = config;
