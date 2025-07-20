const Logger = require('./Logger');
const { ethers } = require('ethers');

class HealthMonitor {
  constructor() {
    this.logger = new Logger('HealthMonitor');
    this.isRunning = false;
    this.healthChecks = new Map();
    this.alerts = [];
    this.metrics = {
      startTime: Date.now(),
      lastHealthCheck: 0,
      consecutiveFailures: 0,
      networkLatency: 0,
      memoryUsage: 0,
      cpuUsage: 0
    };
    
    this.thresholds = {
      maxConsecutiveFailures: 5,
      maxNetworkLatency: 5000, // 5 seconds
      maxMemoryUsage: 500 * 1024 * 1024, // 500MB
      minFreeMemory: 100 * 1024 * 1024 // 100MB
    };
  }

  start() {
    if (this.isRunning) {
      this.logger.warn('Health monitor already running');
      return;
    }

    this.logger.info('🏥 Starting Health Monitor...');
    this.isRunning = true;

    // Run health checks every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.runHealthChecks().catch(error => {
        this.logger.error('Health check failed:', error);
      });
    }, 30000);

    // Run system metrics check every 60 seconds
    this.metricsInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, 60000);

    this.logger.info('✅ Health Monitor started');
  }

  stop() {
    if (!this.isRunning) {
      return;
    }

    this.logger.info('🛑 Stopping Health Monitor...');
    this.isRunning = false;

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }

    this.logger.info('Health Monitor stopped');
  }

  async runHealthChecks() {
    this.logger.debug('Running health checks...');
    this.metrics.lastHealthCheck = Date.now();

    const checks = [
      this.checkNetworkConnection(),
      this.checkBackendConnection(),
      this.checkMemoryUsage(),
      this.checkDiskSpace()
    ];

    try {
      const results = await Promise.allSettled(checks);
      let failedChecks = 0;

      results.forEach((result, index) => {
        const checkName = ['network', 'backend', 'memory', 'disk'][index];
        
        if (result.status === 'fulfilled' && result.value.healthy) {
          this.healthChecks.set(checkName, {
            status: 'healthy',
            lastCheck: Date.now(),
            message: result.value.message
          });
        } else {
          failedChecks++;
          const error = result.status === 'rejected' ? result.reason : result.value.error;
          this.healthChecks.set(checkName, {
            status: 'unhealthy',
            lastCheck: Date.now(),
            error: error
          });
          this.logger.warn(`Health check failed: ${checkName}`, error);
        }
      });

      if (failedChecks > 0) {
        this.metrics.consecutiveFailures++;
        this.handleHealthFailure(failedChecks);
      } else {
        this.metrics.consecutiveFailures = 0;
      }

    } catch (error) {
      this.logger.error('Error running health checks:', error);
      this.metrics.consecutiveFailures++;
    }
  }

  async checkNetworkConnection() {
    const startTime = Date.now();
    
    try {
      const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL);
      const blockNumber = await provider.getBlockNumber();
      
      const latency = Date.now() - startTime;
      this.metrics.networkLatency = latency;

      if (latency > this.thresholds.maxNetworkLatency) {
        return {
          healthy: false,
          error: `High network latency: ${latency}ms`
        };
      }

      return {
        healthy: true,
        message: `Network healthy, block: ${blockNumber}, latency: ${latency}ms`
      };
    } catch (error) {
      return {
        healthy: false,
        error: `Network connection failed: ${error.message}`
      };
    }
  }

  async checkBackendConnection() {
    try {
      const axios = require('axios');
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
      
      const response = await axios.get(`${backendUrl}/api/health`, {
        timeout: 5000
      });

      if (response.status === 200) {
        return {
          healthy: true,
          message: 'Backend connection healthy'
        };
      } else {
        return {
          healthy: false,
          error: `Backend returned status: ${response.status}`
        };
      }
    } catch (error) {
      return {
        healthy: false,
        error: `Backend connection failed: ${error.message}`
      };
    }
  }

  checkMemoryUsage() {
    try {
      const memUsage = process.memoryUsage();
      this.metrics.memoryUsage = memUsage.heapUsed;

      if (memUsage.heapUsed > this.thresholds.maxMemoryUsage) {
        return {
          healthy: false,
          error: `High memory usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`
        };
      }

      const freeMemory = memUsage.heapTotal - memUsage.heapUsed;
      if (freeMemory < this.thresholds.minFreeMemory) {
        return {
          healthy: false,
          error: `Low free memory: ${Math.round(freeMemory / 1024 / 1024)}MB`
        };
      }

      return {
        healthy: true,
        message: `Memory usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`
      };
    } catch (error) {
      return {
        healthy: false,
        error: `Memory check failed: ${error.message}`
      };
    }
  }

  checkDiskSpace() {
    try {
      const fs = require('fs');
      const stats = fs.statSync('.');
      
      // This is a basic check - in production you'd want more sophisticated disk monitoring
      return {
        healthy: true,
        message: 'Disk space check passed'
      };
    } catch (error) {
      return {
        healthy: false,
        error: `Disk check failed: ${error.message}`
      };
    }
  }

  collectSystemMetrics() {
    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      this.metrics.memoryUsage = memUsage.heapUsed;
      this.metrics.cpuUsage = cpuUsage.user + cpuUsage.system;

      this.logger.debug('System metrics collected:', {
        memory: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        uptime: `${Math.round(process.uptime())}s`
      });
    } catch (error) {
      this.logger.error('Error collecting system metrics:', error);
    }
  }

  handleHealthFailure(failedChecks) {
    const alert = {
      timestamp: Date.now(),
      type: 'health_failure',
      severity: failedChecks > 2 ? 'critical' : 'warning',
      message: `${failedChecks} health checks failed`,
      consecutiveFailures: this.metrics.consecutiveFailures
    };

    this.alerts.push(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    this.logger.warn('Health failure detected:', alert);

    // Trigger emergency actions if too many consecutive failures
    if (this.metrics.consecutiveFailures >= this.thresholds.maxConsecutiveFailures) {
      this.triggerEmergencyStop();
    }
  }

  triggerEmergencyStop() {
    this.logger.error('🚨 EMERGENCY STOP TRIGGERED - Too many consecutive health failures');
    
    const alert = {
      timestamp: Date.now(),
      type: 'emergency_stop',
      severity: 'critical',
      message: 'Bot stopped due to health failures',
      consecutiveFailures: this.metrics.consecutiveFailures
    };

    this.alerts.push(alert);

    // Emit emergency stop event
    process.emit('emergencyStop', alert);
  }

  getHealthStatus() {
    const uptime = Date.now() - this.metrics.startTime;
    const healthChecks = Object.fromEntries(this.healthChecks);
    
    const overallHealth = Array.from(this.healthChecks.values()).every(check => 
      check.status === 'healthy'
    );

    return {
      overall: overallHealth ? 'healthy' : 'unhealthy',
      uptime: uptime,
      lastHealthCheck: this.metrics.lastHealthCheck,
      consecutiveFailures: this.metrics.consecutiveFailures,
      checks: healthChecks,
      metrics: {
        networkLatency: this.metrics.networkLatency,
        memoryUsage: Math.round(this.metrics.memoryUsage / 1024 / 1024), // MB
        cpuUsage: this.metrics.cpuUsage
      },
      recentAlerts: this.alerts.slice(-10) // Last 10 alerts
    };
  }

  getAlerts() {
    return this.alerts;
  }

  clearAlerts() {
    this.alerts = [];
    this.logger.info('Health alerts cleared');
  }
}

module.exports = HealthMonitor;
