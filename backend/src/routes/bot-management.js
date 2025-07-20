const express = require('express');
const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const winston = require('winston');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/bot-management.log' })
  ]
});

// Bot process management
let botProcess = null;
let botStatus = {
  isRunning: false,
  pid: null,
  startTime: null,
  lastHeartbeat: null,
  stats: {
    totalTrades: 0,
    successfulTrades: 0,
    totalProfit: 0,
    totalGasSpent: 0,
    uptime: 0
  },
  health: {
    status: 'unknown',
    lastCheck: null,
    errors: []
  }
};

// Store for real-time logs and trades
let recentLogs = [];
let recentTrades = [];
const MAX_STORED_LOGS = 1000;
const MAX_STORED_TRADES = 100;

/**
 * POST /api/bot/start
 * Start the arbitrage bot
 */
router.post('/start', async (req, res) => {
  try {
    if (botProcess && !botProcess.killed) {
      return res.status(400).json({
        success: false,
        error: 'Bot is already running',
        status: botStatus
      });
    }

    logger.info('🚀 Starting arbitrage bot...');

    // Path to bot executable
    const botPath = path.join(__dirname, '../../../bot/src/ArbitrageBot.js');
    
    if (!fs.existsSync(botPath)) {
      return res.status(500).json({
        success: false,
        error: 'Bot executable not found'
      });
    }

    // Start the bot process
    botProcess = spawn('node', [botPath], {
      cwd: path.join(__dirname, '../../../bot'),
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        BACKEND_URL: `http://localhost:${process.env.PORT || 3001}`,
        BOT_PORT: '3002'
      }
    });

    // Handle bot output
    botProcess.stdout.on('data', (data) => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'info',
        source: 'bot',
        message: data.toString().trim()
      };
      
      addLog(logEntry);
      logger.info('Bot stdout:', data.toString().trim());
    });

    botProcess.stderr.on('data', (data) => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'error',
        source: 'bot',
        message: data.toString().trim()
      };
      
      addLog(logEntry);
      logger.error('Bot stderr:', data.toString().trim());
    });

    botProcess.on('close', (code) => {
      logger.info(`Bot process exited with code ${code}`);
      botStatus.isRunning = false;
      botStatus.pid = null;
      botProcess = null;
      
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'warn',
        source: 'system',
        message: `Bot process exited with code ${code}`
      };
      addLog(logEntry);
    });

    botProcess.on('error', (error) => {
      logger.error('Bot process error:', error);
      botStatus.isRunning = false;
      botStatus.pid = null;
      botProcess = null;
      
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'error',
        source: 'system',
        message: `Bot process error: ${error.message}`
      };
      addLog(logEntry);
    });

    // Update bot status
    botStatus.isRunning = true;
    botStatus.pid = botProcess.pid;
    botStatus.startTime = new Date().toISOString();
    botStatus.lastHeartbeat = new Date().toISOString();

    // Log to database
    await logBotEvent('start', { pid: botProcess.pid });

    res.json({
      success: true,
      message: 'Bot started successfully',
      status: botStatus
    });

  } catch (error) {
    logger.error('Failed to start bot:', error);
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
    if (!botProcess || botProcess.killed) {
      return res.status(400).json({
        success: false,
        error: 'Bot is not running',
        status: botStatus
      });
    }

    logger.info('🛑 Stopping arbitrage bot...');

    // Gracefully terminate the bot
    botProcess.kill('SIGTERM');
    
    // Force kill after 10 seconds if not terminated
    setTimeout(() => {
      if (botProcess && !botProcess.killed) {
        logger.warn('Force killing bot process');
        botProcess.kill('SIGKILL');
      }
    }, 10000);

    // Update status
    botStatus.isRunning = false;
    botStatus.pid = null;

    // Log to database
    await logBotEvent('stop', {});

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      source: 'system',
      message: 'Bot stopped by user request'
    };
    addLog(logEntry);

    res.json({
      success: true,
      message: 'Bot stopped successfully',
      status: botStatus
    });

  } catch (error) {
    logger.error('Failed to stop bot:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stop bot',
      message: error.message
    });
  }
});

/**
 * POST /api/bot/restart
 * Restart the arbitrage bot
 */
router.post('/restart', async (req, res) => {
  try {
    logger.info('🔄 Restarting arbitrage bot...');

    // Stop the bot first
    if (botProcess && !botProcess.killed) {
      botProcess.kill('SIGTERM');
      
      // Wait for process to stop
      await new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!botProcess || botProcess.killed) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          if (botProcess && !botProcess.killed) {
            botProcess.kill('SIGKILL');
          }
          resolve();
        }, 10000);
      });
    }

    // Small delay before restart
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Start the bot again (reuse start logic)
    const startResponse = await new Promise((resolve, reject) => {
      // Simulate the start request
      const mockReq = { body: {} };
      const mockRes = {
        json: (data) => resolve(data),
        status: (code) => ({
          json: (data) => resolve({ ...data, statusCode: code })
        })
      };
      
      // Call the start handler
      router.stack.find(layer => layer.route.path === '/start' && layer.route.methods.post)
        .route.stack[0].handle(mockReq, mockRes, (err) => {
          if (err) reject(err);
        });
    });

    await logBotEvent('restart', {});

    res.json({
      success: true,
      message: 'Bot restarted successfully',
      status: botStatus
    });

  } catch (error) {
    logger.error('Failed to restart bot:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restart bot',
      message: error.message
    });
  }
});

/**
 * GET /api/bot/status
 * Get current bot status and statistics
 */
router.get('/status', async (req, res) => {
  try {
    // Update uptime if bot is running
    if (botStatus.isRunning && botStatus.startTime) {
      botStatus.stats.uptime = Date.now() - new Date(botStatus.startTime).getTime();
    }

    // Check if process is actually running
    if (botStatus.isRunning && botStatus.pid) {
      try {
        process.kill(botStatus.pid, 0); // Check if process exists
      } catch (error) {
        // Process doesn't exist
        botStatus.isRunning = false;
        botStatus.pid = null;
      }
    }

    res.json({
      success: true,
      status: botStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to get bot status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get bot status',
      message: error.message
    });
  }
});

/**
 * POST /api/bot/heartbeat
 * Receive heartbeat from bot (called by bot itself)
 */
router.post('/heartbeat', async (req, res) => {
  try {
    const { stats, health } = req.body;

    // Update bot status with heartbeat data
    botStatus.lastHeartbeat = new Date().toISOString();
    
    if (stats) {
      botStatus.stats = { ...botStatus.stats, ...stats };
    }
    
    if (health) {
      botStatus.health = health;
    }

    res.json({ success: true });

  } catch (error) {
    logger.error('Failed to process heartbeat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process heartbeat'
    });
  }
});

/**
 * GET /api/bot/logs
 * Get recent bot logs
 */
router.get('/logs', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const level = req.query.level; // filter by log level
    
    let logs = recentLogs;
    
    if (level) {
      logs = logs.filter(log => log.level === level);
    }
    
    const limitedLogs = logs.slice(-limit);

    res.json({
      success: true,
      logs: limitedLogs,
      total: logs.length
    });

  } catch (error) {
    logger.error('Failed to get logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get logs'
    });
  }
});

/**
 * GET /api/bot/trades
 * Get recent bot trades
 */
router.get('/trades', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const limitedTrades = recentTrades.slice(-limit);

    res.json({
      success: true,
      trades: limitedTrades,
      total: recentTrades.length
    });

  } catch (error) {
    logger.error('Failed to get trades:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get trades'
    });
  }
});

// Helper functions
function addLog(logEntry) {
  recentLogs.push(logEntry);
  
  // Keep only recent logs
  if (recentLogs.length > MAX_STORED_LOGS) {
    recentLogs = recentLogs.slice(-MAX_STORED_LOGS);
  }
}

function addTrade(tradeData) {
  recentTrades.push({
    ...tradeData,
    timestamp: new Date().toISOString()
  });
  
  // Keep only recent trades
  if (recentTrades.length > MAX_STORED_TRADES) {
    recentTrades = recentTrades.slice(-MAX_STORED_TRADES);
  }
}

async function logBotEvent(event, data) {
  try {
    if (supabase) {
      await supabase.from('bot_events').insert({
        event_type: event,
        data: data,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    logger.error('Failed to log bot event:', error);
  }
}

module.exports = router;
