import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import winston from 'winston';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';

// Load environment variables
dotenv.config();

// Import routes
import arbitrageRoutes from './routes/arbitrage';
const opportunitiesRoutes = require('./routes/opportunities');
const botRoutes = require('./routes/bot');
const healthRoutes = require('./routes/health');
const { authenticateToken } = require('./middleware/auth');

// Import validation middleware
import { 
  validateArbitrageRequest, 
  validateTestnetOnly, 
  validateGasLimits, 
  rateLimitArbitrage 
} from './middleware/validation';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// ATOM v2 Python process management
let atomProcess: ChildProcess | null = null;

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// ATOM v2 Integration Routes
app.post('/api/atom/start', authenticateToken, async (req, res) => {
  try {
    if (atomProcess) {
      return res.status(400).json({ error: 'ATOM system is already running' });
    }

    const dryRun = req.body.dryRun || false;
    const args = ['atom_cli.py', 'start'];
    if (dryRun) args.push('--dry-run');

    atomProcess = spawn('python', args, {
      cwd: path.join(__dirname, '..'),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    atomProcess.stdout?.on('data', (data) => {
      logger.info(`ATOM: ${data.toString()}`);
    });

    atomProcess.stderr?.on('data', (data) => {
      logger.error(`ATOM Error: ${data.toString()}`);
    });

    atomProcess.on('close', (code) => {
      logger.info(`ATOM process exited with code ${code}`);
      atomProcess = null;
    });

    res.json({
      success: true,
      message: 'ATOM v2 system started',
      dryRun: dryRun,
      pid: atomProcess.pid
    });
  } catch (error) {
    logger.error('Failed to start ATOM system:', error);
    res.status(500).json({ error: 'Failed to start ATOM system' });
  }
});

app.post('/api/atom/stop', authenticateToken, async (req, res) => {
  try {
    if (!atomProcess) {
      return res.status(400).json({ error: 'ATOM system is not running' });
    }

    atomProcess.kill('SIGTERM');
    atomProcess = null;

    res.json({
      success: true,
      message: 'ATOM v2 system stopped'
    });
  } catch (error) {
    logger.error('Failed to stop ATOM system:', error);
    res.status(500).json({ error: 'Failed to stop ATOM system' });
  }
});

app.get('/api/atom/status', authenticateToken, async (req, res) => {
  try {
    const isRunning = atomProcess !== null;

    res.json({
      isRunning,
      pid: atomProcess ? atomProcess.pid : null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get ATOM status:', error);
    res.status(500).json({ error: 'Failed to get ATOM status' });
  }
});

// Routes with proper middleware chain
app.use('/api/health', healthRoutes);

// Arbitrage routes with comprehensive validation
app.use('/api/arbitrage', 
  validateTestnetOnly,
  validateGasLimits,
  arbitrageRoutes
);

// Protected routes
app.use('/api/opportunities', authenticateToken, opportunitiesRoutes);
app.use('/api/bot', authenticateToken, botRoutes);

// Specific arbitrage execution endpoint with full validation chain
app.post('/api/arbitrage/execute',
  validateTestnetOnly,
  validateGasLimits,
  rateLimitArbitrage,
  validateArbitrageRequest,
  // The actual handler is in the arbitrage routes
);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 ATOM Backend Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 ATOM v2 Python CLI integration enabled`);
  logger.info(`🛡️  Enhanced validation and security middleware active`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  if (atomProcess) {
    atomProcess.kill('SIGTERM');
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  if (atomProcess) {
    atomProcess.kill('SIGTERM');
  }
  process.exit(0);
});

export default app;
