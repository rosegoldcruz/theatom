const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchainService');

// Bot state management
let botState = {
  isRunning: false,
  startedAt: null,
  stoppedAt: null,
  config: {
    minProfitThreshold: 0.01,
    maxGasPrice: 50,
    autoExecute: false,
    networks: ['base_sepolia'],
    pairs: ['ETH/USDC', 'USDC/DAI']
  },
  stats: {
    opportunitiesScanned: 0,
    tradesExecuted: 0,
    totalProfit: 0,
    uptime: 0
  }
};

/**
 * GET /api/bot/status
 * Get current bot status and configuration
 */
router.get('/status', (req, res) => {
  try {
    const currentTime = Date.now();
    const uptime = botState.isRunning && botState.startedAt 
      ? currentTime - botState.startedAt 
      : 0;

    res.json({
      success: true,
      data: {
        ...botState,
        stats: {
          ...botState.stats,
          uptime
        },
        timestamp: currentTime
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get bot status',
      message: error.message
    });
  }
});

/**
 * POST /api/bot/start
 * Start the arbitrage bot
 */
router.post('/start', async (req, res) => {
  try {
    if (botState.isRunning) {
      return res.status(400).json({
        success: false,
        error: 'Bot is already running'
      });
    }

    // Check if user has permission to control bot
    if (!req.user.profile.can_control_bot) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to control bot'
      });
    }

    // Update configuration if provided
    if (req.body.config) {
      botState.config = { ...botState.config, ...req.body.config };
    }

    // Start the bot
    botState.isRunning = true;
    botState.startedAt = Date.now();
    botState.stoppedAt = null;

    // TODO: Start actual bot processes
    // - Start opportunity scanning
    // - Start event listening
    // - Initialize trading algorithms
    
    console.log(`Bot started by user ${req.user.id} at ${new Date().toISOString()}`);

    // Start blockchain event listening
    blockchainService.startEventListening((event) => {
      console.log('Blockchain event received:', event);
      // TODO: Process events and update bot stats
    });

    res.json({
      success: true,
      data: {
        message: 'Bot started successfully',
        startedAt: botState.startedAt,
        config: botState.config
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to start bot',
      message: error.message
    });
  }
});

/**
 * POST /api/bot/stop
 * Stop the arbitrage bot
 */
router.post('/stop', async (req, res) => {
  try {
    if (!botState.isRunning) {
      return res.status(400).json({
        success: false,
        error: 'Bot is not running'
      });
    }

    // Check if user has permission to control bot
    if (!req.user.profile.can_control_bot) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to control bot'
      });
    }

    // Stop the bot
    botState.isRunning = false;
    botState.stoppedAt = Date.now();

    // TODO: Stop actual bot processes
    // - Stop opportunity scanning
    // - Stop event listening
    // - Clean up resources

    console.log(`Bot stopped by user ${req.user.id} at ${new Date().toISOString()}`);

    // Stop blockchain event listening
    blockchainService.stopEventListening();

    res.json({
      success: true,
      data: {
        message: 'Bot stopped successfully',
        stoppedAt: botState.stoppedAt,
        totalUptime: botState.stoppedAt - botState.startedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to stop bot',
      message: error.message
    });
  }
});

/**
 * PUT /api/bot/config
 * Update bot configuration
 */
router.put('/config', (req, res) => {
  try {
    // Check if user has permission to configure bot
    if (!req.user.profile.can_configure_bot) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to configure bot'
      });
    }

    const { config } = req.body;
    
    // Validate configuration
    if (config.minProfitThreshold && (config.minProfitThreshold < 0 || config.minProfitThreshold > 1)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid minProfitThreshold: must be between 0 and 1'
      });
    }

    if (config.maxGasPrice && (config.maxGasPrice < 1 || config.maxGasPrice > 1000)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid maxGasPrice: must be between 1 and 1000 gwei'
      });
    }

    // Update configuration
    botState.config = { ...botState.config, ...config };

    console.log(`Bot configuration updated by user ${req.user.id}:`, config);

    res.json({
      success: true,
      data: {
        message: 'Configuration updated successfully',
        config: botState.config
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update configuration',
      message: error.message
    });
  }
});

/**
 * GET /api/bot/logs
 * Get bot activity logs
 */
router.get('/logs', (req, res) => {
  try {
    const { limit = 100, level = 'info' } = req.query;
    
    // TODO: Implement actual log retrieval from log files or database
    const mockLogs = [
      {
        timestamp: Date.now() - 60000,
        level: 'info',
        message: 'Opportunity detected: ETH/USDC profit 0.15%',
        data: { pair: 'ETH/USDC', profit: 0.15 }
      },
      {
        timestamp: Date.now() - 120000,
        level: 'success',
        message: 'Trade executed successfully',
        data: { txHash: '0xabcd...ef01', profit: 0.12 }
      },
      {
        timestamp: Date.now() - 180000,
        level: 'warning',
        message: 'Gas price above threshold',
        data: { gasPrice: 55, threshold: 50 }
      }
    ];

    res.json({
      success: true,
      data: {
        logs: mockLogs.slice(0, parseInt(limit)),
        total: mockLogs.length,
        level
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get bot logs',
      message: error.message
    });
  }
});

module.exports = router;
