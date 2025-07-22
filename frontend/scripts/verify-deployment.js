#!/usr/bin/env node
/**
 * 🔍 THEATOM Deployment Verification Script
 * Comprehensive testing of the deployed frontend functionality
 */

const https = require('https');
const http = require('http');

// Production configuration
const PRODUCTION_CONFIG = {
  frontendUrl: 'https://theatom-frontend-5q0nctmcw-elohim.vercel.app',
  backendUrl: 'http://152.42.234.243:8000',
  botUrl: 'http://152.42.234.243:3002',
  timeout: 15000
};

class DeploymentVerifier {
  constructor() {
    this.testResults = [];
    this.passed = 0;
    this.failed = 0;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      'info': '📋',
      'success': '✅',
      'error': '❌',
      'warning': '⚠️'
    }[type] || '📋';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      const startTime = Date.now();
      
      const req = client.get(url, { 
        timeout: PRODUCTION_CONFIG.timeout,
        ...options 
      }, (res) => {
        let data = '';
        
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            responseTime: Date.now() - startTime
          });
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.on('error', reject);
    });
  }

  async testFrontendAccess() {
    this.log('Testing frontend accessibility...', 'info');
    
    try {
      const response = await this.makeRequest(PRODUCTION_CONFIG.frontendUrl);
      
      if (response.statusCode === 200) {
        this.log(`Frontend accessible (${response.responseTime}ms)`, 'success');
        this.passed++;
        return true;
      } else {
        this.log(`Frontend returned status ${response.statusCode}`, 'error');
        this.failed++;
        return false;
      }
    } catch (error) {
      this.log(`Frontend access failed: ${error.message}`, 'error');
      this.failed++;
      return false;
    }
  }

  async testBackendConnectivity() {
    this.log('Testing backend API connectivity...', 'info');
    
    try {
      const response = await this.makeRequest(`${PRODUCTION_CONFIG.backendUrl}/health`);
      
      if (response.statusCode === 200) {
        this.log(`Backend API accessible (${response.responseTime}ms)`, 'success');
        this.passed++;
        return true;
      } else {
        this.log(`Backend API returned status ${response.statusCode}`, 'error');
        this.failed++;
        return false;
      }
    } catch (error) {
      this.log(`Backend API failed: ${error.message}`, 'error');
      this.failed++;
      return false;
    }
  }

  async testBotConnectivity() {
    this.log('Testing bot API connectivity...', 'info');
    
    try {
      const response = await this.makeRequest(`${PRODUCTION_CONFIG.botUrl}/health`);
      
      if (response.statusCode === 200) {
        this.log(`Bot API accessible (${response.responseTime}ms)`, 'success');
        this.passed++;
        return true;
      } else {
        this.log(`Bot API returned status ${response.statusCode}`, 'error');
        this.failed++;
        return false;
      }
    } catch (error) {
      this.log(`Bot API failed: ${error.message}`, 'error');
      this.failed++;
      return false;
    }
  }

  async testSecurityHeaders() {
    this.log('Testing security headers...', 'info');
    
    try {
      const response = await this.makeRequest(PRODUCTION_CONFIG.frontendUrl);
      const headers = response.headers;
      
      const requiredHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection',
        'referrer-policy'
      ];
      
      let headersPassed = 0;
      
      for (const header of requiredHeaders) {
        if (headers[header]) {
          headersPassed++;
        } else {
          this.log(`Missing security header: ${header}`, 'warning');
        }
      }
      
      if (headersPassed === requiredHeaders.length) {
        this.log('All security headers present', 'success');
        this.passed++;
        return true;
      } else {
        this.log(`${headersPassed}/${requiredHeaders.length} security headers present`, 'warning');
        this.failed++;
        return false;
      }
    } catch (error) {
      this.log(`Security headers test failed: ${error.message}`, 'error');
      this.failed++;
      return false;
    }
  }

  async testAPIEndpoints() {
    this.log('Testing API endpoints...', 'info');
    
    const endpoints = [
      { url: `${PRODUCTION_CONFIG.backendUrl}/api/health`, name: 'Backend Health' },
      { url: `${PRODUCTION_CONFIG.backendUrl}/api/status`, name: 'Backend Status' },
      { url: `${PRODUCTION_CONFIG.botUrl}/health`, name: 'Bot Health' }
    ];
    
    let endpointsPassed = 0;
    
    for (const endpoint of endpoints) {
      try {
        const response = await this.makeRequest(endpoint.url);
        
        if (response.statusCode === 200) {
          this.log(`${endpoint.name} endpoint working`, 'success');
          endpointsPassed++;
        } else {
          this.log(`${endpoint.name} returned ${response.statusCode}`, 'warning');
        }
      } catch (error) {
        this.log(`${endpoint.name} failed: ${error.message}`, 'error');
      }
    }
    
    if (endpointsPassed > 0) {
      this.log(`${endpointsPassed}/${endpoints.length} API endpoints accessible`, 'success');
      this.passed++;
      return true;
    } else {
      this.log('No API endpoints accessible', 'error');
      this.failed++;
      return false;
    }
  }

  async runAllTests() {
    this.log('🚀 Starting THEATOM Deployment Verification', 'info');
    this.log('============================================', 'info');
    
    const tests = [
      this.testFrontendAccess(),
      this.testBackendConnectivity(),
      this.testBotConnectivity(),
      this.testSecurityHeaders(),
      this.testAPIEndpoints()
    ];
    
    await Promise.all(tests);
    
    // Summary
    this.log('\n📊 Verification Summary:', 'info');
    this.log('========================', 'info');
    this.log(`✅ Passed: ${this.passed}`, 'success');
    this.log(`❌ Failed: ${this.failed}`, this.failed > 0 ? 'error' : 'info');
    this.log(`📈 Success Rate: ${Math.round((this.passed / (this.passed + this.failed)) * 100)}%`, 'info');
    
    if (this.failed === 0) {
      this.log('\n🎯 All tests passed! Deployment is healthy.', 'success');
      return true;
    } else {
      this.log('\n⚠️  Some tests failed. Check the logs above.', 'warning');
      return false;
    }
  }
}

// CLI Usage
if (require.main === module) {
  const verifier = new DeploymentVerifier();
  
  verifier.runAllTests().then((success) => {
    process.exit(success ? 0 : 1);
  }).catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
}

module.exports = DeploymentVerifier;
