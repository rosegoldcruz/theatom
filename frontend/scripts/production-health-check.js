#!/usr/bin/env node
/**
 * 🏥 THEATOM Frontend Production Health Check
 * Monitors the deployed Vercel frontend and backend connectivity
 */

const https = require('https');
const http = require('http');

// Production URLs
const FRONTEND_URL = 'https://theatom-frontend-5q0nctmcw-elohim.vercel.app';
const BACKEND_URL = 'http://152.42.234.243:8000';
const BOT_URL = 'http://152.42.234.243:3002';

// Health check configuration
const HEALTH_CHECK_CONFIG = {
  timeout: 10000, // 10 seconds
  retries: 3,
  interval: 30000, // 30 seconds between checks
};

class ProductionHealthMonitor {
  constructor() {
    this.results = {
      frontend: { status: 'unknown', lastCheck: null, responseTime: 0 },
      backend: { status: 'unknown', lastCheck: null, responseTime: 0 },
      bot: { status: 'unknown', lastCheck: null, responseTime: 0 }
    };
  }

  async checkEndpoint(url, name) {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const client = url.startsWith('https') ? https : http;
      
      const req = client.get(url, { timeout: HEALTH_CHECK_CONFIG.timeout }, (res) => {
        const responseTime = Date.now() - startTime;
        const status = res.statusCode >= 200 && res.statusCode < 400 ? 'healthy' : 'unhealthy';
        
        resolve({
          status,
          statusCode: res.statusCode,
          responseTime,
          timestamp: new Date().toISOString()
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          status: 'timeout',
          statusCode: 0,
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        });
      });

      req.on('error', (error) => {
        resolve({
          status: 'error',
          statusCode: 0,
          responseTime: Date.now() - startTime,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      });
    });
  }

  async checkFrontend() {
    console.log('🌐 Checking Frontend...');
    const result = await this.checkEndpoint(FRONTEND_URL, 'frontend');
    this.results.frontend = result;
    
    if (result.status === 'healthy') {
      console.log(`✅ Frontend: ${result.statusCode} (${result.responseTime}ms)`);
    } else {
      console.log(`❌ Frontend: ${result.status} - ${result.error || result.statusCode}`);
    }
    
    return result;
  }

  async checkBackend() {
    console.log('🐍 Checking Backend API...');
    const result = await this.checkEndpoint(`${BACKEND_URL}/health`, 'backend');
    this.results.backend = result;
    
    if (result.status === 'healthy') {
      console.log(`✅ Backend: ${result.statusCode} (${result.responseTime}ms)`);
    } else {
      console.log(`❌ Backend: ${result.status} - ${result.error || result.statusCode}`);
    }
    
    return result;
  }

  async checkBot() {
    console.log('🤖 Checking Bot API...');
    const result = await this.checkEndpoint(`${BOT_URL}/health`, 'bot');
    this.results.bot = result;
    
    if (result.status === 'healthy') {
      console.log(`✅ Bot: ${result.statusCode} (${result.responseTime}ms)`);
    } else {
      console.log(`❌ Bot: ${result.status} - ${result.error || result.statusCode}`);
    }
    
    return result;
  }

  async runHealthCheck() {
    console.log('\n🏥 THEATOM Production Health Check');
    console.log('=====================================');
    console.log(`⏰ ${new Date().toISOString()}\n`);

    const checks = await Promise.all([
      this.checkFrontend(),
      this.checkBackend(),
      this.checkBot()
    ]);

    // Summary
    console.log('\n📊 Health Check Summary:');
    console.log('========================');
    
    const healthyCount = checks.filter(c => c.status === 'healthy').length;
    const totalChecks = checks.length;
    
    console.log(`✅ Healthy: ${healthyCount}/${totalChecks}`);
    console.log(`⚡ Average Response Time: ${Math.round(checks.reduce((sum, c) => sum + c.responseTime, 0) / totalChecks)}ms`);
    
    if (healthyCount === totalChecks) {
      console.log('🎯 All systems operational!');
    } else {
      console.log('⚠️  Some systems need attention');
    }

    return {
      healthy: healthyCount === totalChecks,
      results: this.results,
      summary: {
        healthy: healthyCount,
        total: totalChecks,
        avgResponseTime: Math.round(checks.reduce((sum, c) => sum + c.responseTime, 0) / totalChecks)
      }
    };
  }

  async startMonitoring() {
    console.log('🚀 Starting continuous health monitoring...');
    console.log(`📡 Checking every ${HEALTH_CHECK_CONFIG.interval / 1000} seconds\n`);

    // Initial check
    await this.runHealthCheck();

    // Continuous monitoring
    setInterval(async () => {
      await this.runHealthCheck();
    }, HEALTH_CHECK_CONFIG.interval);
  }
}

// CLI Usage
if (require.main === module) {
  const monitor = new ProductionHealthMonitor();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--monitor') || args.includes('-m')) {
    monitor.startMonitoring();
  } else {
    monitor.runHealthCheck().then((result) => {
      process.exit(result.healthy ? 0 : 1);
    });
  }
}

module.exports = ProductionHealthMonitor;
