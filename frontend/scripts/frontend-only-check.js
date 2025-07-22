#!/usr/bin/env node
/**
 * 🌐 THEATOM Frontend-Only Health Check
 * Verifies the deployed Vercel frontend is working correctly
 */

const https = require('https');

const FRONTEND_URL = 'https://theatom-frontend-5q0nctmcw-elohim.vercel.app';

async function checkFrontend() {
  console.log('🌐 THEATOM Frontend Health Check');
  console.log('================================');
  console.log(`🔗 URL: ${FRONTEND_URL}\n`);

  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = https.get(FRONTEND_URL, { timeout: 10000 }, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`📊 Status Code: ${res.statusCode}`);
        console.log(`⚡ Response Time: ${responseTime}ms`);
        console.log(`📦 Content Length: ${data.length} bytes`);
        console.log(`🔧 Content Type: ${res.headers['content-type'] || 'unknown'}`);
        
        // Check for key indicators
        const hasNextJS = data.includes('_next') || res.headers['x-powered-by']?.includes('Next.js');
        const hasReact = data.includes('react') || data.includes('React');
        const hasTitle = data.includes('<title>') && data.includes('</title>');
        
        console.log('\n🔍 Content Analysis:');
        console.log(`✅ Next.js detected: ${hasNextJS ? 'Yes' : 'No'}`);
        console.log(`✅ React detected: ${hasReact ? 'Yes' : 'No'}`);
        console.log(`✅ Has title tag: ${hasTitle ? 'Yes' : 'No'}`);
        
        // Security headers check
        console.log('\n🛡️  Security Headers:');
        const securityHeaders = [
          'x-content-type-options',
          'x-frame-options', 
          'x-xss-protection',
          'referrer-policy'
        ];
        
        securityHeaders.forEach(header => {
          const value = res.headers[header];
          console.log(`${value ? '✅' : '❌'} ${header}: ${value || 'missing'}`);
        });
        
        if (res.statusCode === 200) {
          console.log('\n🎯 Frontend is healthy and accessible!');
          resolve(true);
        } else if (res.statusCode >= 300 && res.statusCode < 400) {
          console.log('\n🔄 Frontend is redirecting (this might be normal)');
          resolve(true);
        } else {
          console.log('\n⚠️  Frontend returned non-200 status');
          resolve(false);
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      console.log('❌ Request timed out');
      resolve(false);
    });

    req.on('error', (error) => {
      console.log(`❌ Request failed: ${error.message}`);
      resolve(false);
    });
  });
}

// Run the check
if (require.main === module) {
  checkFrontend().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = checkFrontend;
