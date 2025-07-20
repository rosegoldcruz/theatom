const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const winston = require('winston');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const arbitrageRoutes = require('./routes/arbitrage-simple');
const opportunitiesRoutes = require('./routes/opportunities');
const botRoutes = require('./routes/bot');
const healthRoutes = require('./routes/health');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

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

// Validation middleware for testnet-only operations
const validateTestnetOnly = (req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const allowMainnet = process.env.ALLOW_MAINNET === 'true';
  
  if (isProduction && !allowMainnet) {
    // In production, only allow testnet operations unless explicitly enabled
    const networkId = req.headers['x-network-id'] || '84532'; // Default to Base Sepolia
    
    if (networkId !== '84532') { // Base Sepolia chain ID
      return res.status(403).json({
        success: false,
        error: 'Mainnet operations not allowed in production',
        message: 'This system is configured for testnet operations only'
      });
    }
  }
  
  next();
};

// Rate limiting middleware
const rateLimitStore = new Map();
const rateLimitArbitrage = (req, res, next) => {
  const userAddress = req.body.walletAddress?.toLowerCase();
  
  if (!userAddress) {
    return res.status(400).json({
      success: false,
      error: 'Wallet address required for rate limiting'
    });
  }
  
  const maxRequests = 10; // Max 10 requests per minute
  const windowMs = 60 * 1000; // 1 minute
  
  const now = Date.now();
  const userLimit = rateLimitStore.get(userAddress);
  
  if (!userLimit || now > userLimit.resetTime) {
    // Reset or initialize rate limit
    rateLimitStore.set(userAddress, { count: 1, resetTime: now + windowMs });
    next();
  } else if (userLimit.count < maxRequests) {
    // Increment count
    userLimit.count++;
    next();
  } else {
    // Rate limit exceeded
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      message: `Maximum ${maxRequests} requests per minute allowed`,
      retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
    });
  }
};

// Routes
app.use('/api/health', healthRoutes);

// Arbitrage routes with validation
app.use('/api/arbitrage', validateTestnetOnly, arbitrageRoutes);

// Specific arbitrage execution endpoint with rate limiting
app.post('/api/arbitrage/execute', rateLimitArbitrage);

// Other protected routes (if auth middleware exists)
try {
  const { authenticateToken } = require('./middleware/auth');
  app.use('/api/opportunities', authenticateToken, opportunitiesRoutes);
  app.use('/api/bot', authenticateToken, botRoutes);
} catch (error) {
  logger.warn('Auth middleware not found, skipping protected routes');
  app.use('/api/opportunities', opportunitiesRoutes);
  app.use('/api/bot', botRoutes);
}

// Error handling middleware
app.use((err, req, res, next) => {
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
  logger.info(`🛡️  Enhanced validation and security middleware active`);
  logger.info(`🔗 Contract Address: ${process.env.BASE_SEPOLIA_CONTRACT_ADDRESS || 'Not configured'}`);
  logger.info(`🌐 Network: Base Sepolia Testnet`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
