const fs = require('fs');
const path = require('path');
const Logger = require('./Logger');

class ConfigManager {
  constructor(configPath = null) {
    this.logger = new Logger('ConfigManager');
    this.configPath = configPath || path.join(__dirname, '..', 'config', 'bot-config.json');
    this.config = {};
    this.defaultConfig = this.getDefaultConfig();
    
    this.loadConfig();
  }

  getDefaultConfig() {
    return {
      // Scanning configuration
      scanInterval: '*/10 * * * * *', // Every 10 seconds
      
      // Trading thresholds
      minProfitThreshold: 0.01, // 0.01 ETH minimum profit
      minProfitMargin: 0.5, // 0.5% minimum profit margin
      maxGasPrice: 50, // 50 gwei max gas price
      estimatedGasUsed: 300000, // 300k gas estimate
      
      // Execution settings
      maxConcurrentTrades: 1, // Only 1 trade at a time
      executionTimeout: 60000, // 60 seconds timeout
      retryAttempts: 3, // 3 retry attempts
      
      // Token pairs to monitor
      tokens: {
        WETH: '0x4200000000000000000000000000000000000006', // Base WETH
        USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
        DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',  // Base DAI
      },
      
      tokenPairs: [
        {
          tokenA: '0x4200000000000000000000000000000000000006', // WETH
          tokenB: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC
          amount: 0.1 // 0.1 ETH
        },
        {
          tokenA: '0x4200000000000000000000000000000000000006', // WETH
          tokenB: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', // DAI
          amount: 0.1 // 0.1 ETH
        }
      ],
      
      // DEX configurations
      dexes: {
        uniswap: {
          enabled: true,
          priority: 1,
          quoterAddress: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
          factoryAddress: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24'
        },
        sushiswap: {
          enabled: true,
          priority: 2,
          routerAddress: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506'
        }
      },
      
      // Risk management
      riskManagement: {
        maxDailyLoss: 0.1, // 0.1 ETH max daily loss
        maxTradeSize: 1.0, // 1 ETH max trade size
        stopLossEnabled: true,
        emergencyStopEnabled: true
      },
      
      // Monitoring and alerts
      monitoring: {
        healthCheckInterval: 30000, // 30 seconds
        performanceReportInterval: 300000, // 5 minutes
        alertThresholds: {
          consecutiveFailures: 5,
          lowProfitability: 0.001, // 0.001 ETH
          highGasCosts: 0.05 // 0.05 ETH
        }
      },
      
      // Logging configuration
      logging: {
        level: 'info', // debug, info, warn, error
        maxFileSize: '10MB',
        maxFiles: 5,
        enableConsole: true,
        enableFile: true
      }
    };
  }

  loadConfig() {
    try {
      // Create config directory if it doesn't exist
      const configDir = path.dirname(this.configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      // Load config file if it exists
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf8');
        const loadedConfig = JSON.parse(configData);
        
        // Merge with default config
        this.config = this.mergeConfig(this.defaultConfig, loadedConfig);
        this.logger.info(`✅ Configuration loaded from ${this.configPath}`);
      } else {
        // Use default config and save it
        this.config = { ...this.defaultConfig };
        this.saveConfig();
        this.logger.info(`📝 Default configuration created at ${this.configPath}`);
      }

      // Override with environment variables
      this.applyEnvironmentOverrides();
      
    } catch (error) {
      this.logger.error('Error loading configuration:', error);
      this.logger.warn('Using default configuration');
      this.config = { ...this.defaultConfig };
    }
  }

  saveConfig() {
    try {
      const configData = JSON.stringify(this.config, null, 2);
      fs.writeFileSync(this.configPath, configData, 'utf8');
      this.logger.info('Configuration saved successfully');
    } catch (error) {
      this.logger.error('Error saving configuration:', error);
    }
  }

  mergeConfig(defaultConfig, userConfig) {
    const merged = { ...defaultConfig };
    
    for (const [key, value] of Object.entries(userConfig)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        merged[key] = this.mergeConfig(defaultConfig[key] || {}, value);
      } else {
        merged[key] = value;
      }
    }
    
    return merged;
  }

  applyEnvironmentOverrides() {
    // Override config with environment variables
    const envMappings = {
      'BOT_SCAN_INTERVAL': 'scanInterval',
      'BOT_MIN_PROFIT_THRESHOLD': 'minProfitThreshold',
      'BOT_MIN_PROFIT_MARGIN': 'minProfitMargin',
      'BOT_MAX_GAS_PRICE': 'maxGasPrice',
      'BOT_MAX_CONCURRENT_TRADES': 'maxConcurrentTrades',
      'BOT_EXECUTION_TIMEOUT': 'executionTimeout',
      'BOT_RETRY_ATTEMPTS': 'retryAttempts',
      'BOT_LOG_LEVEL': 'logging.level'
    };

    for (const [envVar, configPath] of Object.entries(envMappings)) {
      const envValue = process.env[envVar];
      if (envValue !== undefined) {
        this.setNestedValue(this.config, configPath, this.parseEnvValue(envValue));
        this.logger.info(`Environment override: ${configPath} = ${envValue}`);
      }
    }
  }

  parseEnvValue(value) {
    // Try to parse as number
    if (!isNaN(value) && !isNaN(parseFloat(value))) {
      return parseFloat(value);
    }
    
    // Try to parse as boolean
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    
    // Return as string
    return value;
  }

  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
  }

  get(key, defaultValue = null) {
    const keys = key.split('.');
    let current = this.config;
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return defaultValue;
      }
    }
    
    return current;
  }

  set(key, value) {
    this.setNestedValue(this.config, key, value);
  }

  // Update configuration and save
  update(updates) {
    this.config = this.mergeConfig(this.config, updates);
    this.saveConfig();
    this.logger.info('Configuration updated');
  }

  // Get all configuration
  getAll() {
    return { ...this.config };
  }

  // Validate configuration
  validate() {
    const errors = [];
    
    // Validate required fields
    if (!this.get('minProfitThreshold') || this.get('minProfitThreshold') <= 0) {
      errors.push('minProfitThreshold must be greater than 0');
    }
    
    if (!this.get('tokenPairs') || this.get('tokenPairs').length === 0) {
      errors.push('At least one token pair must be configured');
    }
    
    if (!this.get('maxGasPrice') || this.get('maxGasPrice') <= 0) {
      errors.push('maxGasPrice must be greater than 0');
    }
    
    // Validate token pairs
    const tokenPairs = this.get('tokenPairs', []);
    tokenPairs.forEach((pair, index) => {
      if (!pair.tokenA || !pair.tokenB) {
        errors.push(`Token pair ${index}: tokenA and tokenB are required`);
      }
      if (!pair.amount || pair.amount <= 0) {
        errors.push(`Token pair ${index}: amount must be greater than 0`);
      }
    });
    
    if (errors.length > 0) {
      this.logger.error('Configuration validation failed:', errors);
      return { valid: false, errors };
    }
    
    return { valid: true, errors: [] };
  }

  // Reset to default configuration
  reset() {
    this.config = { ...this.defaultConfig };
    this.saveConfig();
    this.logger.info('Configuration reset to defaults');
  }
}

module.exports = ConfigManager;
