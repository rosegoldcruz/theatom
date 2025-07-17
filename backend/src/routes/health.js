const express = require('express');
const router = express.Router();

/**
 * Health check endpoint
 * Used by Railway and monitoring services to check if the backend is running
 */
router.get('/', (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: 'connected', // TODO: Add actual DB health check
      blockchain: 'connected', // TODO: Add actual blockchain health check
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      }
    }
  };

  res.status(200).json(healthCheck);
});

/**
 * Detailed health check with service status
 */
router.get('/detailed', async (req, res) => {
  try {
    // TODO: Add actual service health checks
    const services = {
      supabase: await checkSupabaseHealth(),
      blockchain: await checkBlockchainHealth(),
      redis: await checkRedisHealth() // If using Redis for caching
    };

    const allHealthy = Object.values(services).every(service => service.status === 'healthy');

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Helper functions for service health checks
async function checkSupabaseHealth() {
  try {
    // TODO: Implement actual Supabase health check
    return { status: 'healthy', responseTime: '< 100ms' };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}

async function checkBlockchainHealth() {
  try {
    // TODO: Implement actual blockchain health check
    return { status: 'healthy', blockNumber: 'latest' };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}

async function checkRedisHealth() {
  try {
    // TODO: Implement Redis health check if using Redis
    return { status: 'healthy', connections: 'active' };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}

module.exports = router;
