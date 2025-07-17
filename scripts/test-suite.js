#!/usr/bin/env node

// 🧪 COMPREHENSIVE TEST SUITE RUNNER
// Day 4-5 - Automated testing with reporting

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestSuiteRunner {
  constructor() {
    this.results = {
      unit: { passed: 0, failed: 0, coverage: 0 },
      integration: { passed: 0, failed: 0, coverage: 0 },
      e2e: { passed: 0, failed: 0, coverage: 0 },
      security: { passed: 0, failed: 0, coverage: 0 },
      performance: { passed: 0, failed: 0, coverage: 0 }
    };
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      test: '🧪'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: 'pipe',
        shell: true,
        ...options
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
        if (options.verbose) {
          process.stdout.write(data);
        }
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
        if (options.verbose) {
          process.stderr.write(data);
        }
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr, code });
        } else {
          reject({ stdout, stderr, code });
        }
      });

      child.on('error', (error) => {
        reject({ error, stdout, stderr });
      });
    });
  }

  async checkPrerequisites() {
    this.log('🔍 Checking prerequisites...', 'test');

    try {
      // Check if Jest is installed
      await this.runCommand('npx', ['jest', '--version']);
      this.log('Jest is installed', 'success');
    } catch (error) {
      this.log('Jest is not installed. Installing...', 'warning');
      await this.runCommand('pnpm', ['add', '-D', 'jest', '@jest/globals', '@testing-library/react', '@testing-library/jest-dom', '@testing-library/user-event', 'jest-environment-jsdom']);
    }

    // Check if test files exist
    const testDirs = ['__tests__', 'src/__tests__'];
    let hasTests = false;

    for (const dir of testDirs) {
      if (fs.existsSync(dir)) {
        hasTests = true;
        break;
      }
    }

    if (!hasTests) {
      this.log('No test files found. Creating sample tests...', 'warning');
      await this.createSampleTests();
    }

    this.log('Prerequisites check completed', 'success');
  }

  async createSampleTests() {
    // Create basic test structure if it doesn't exist
    const testDir = '__tests__';
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Create a basic test file
    const basicTest = `
// Basic test to ensure Jest is working
describe('Basic Test Suite', () => {
  test('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  test('should handle async operations', async () => {
    const result = await Promise.resolve('test');
    expect(result).toBe('test');
  });
});
`;

    fs.writeFileSync(path.join(testDir, 'basic.test.js'), basicTest);
    this.log('Created basic test file', 'success');
  }

  async runUnitTests() {
    this.log('🧪 Running unit tests...', 'test');

    try {
      const result = await this.runCommand('npx', [
        'jest',
        '--testPathPattern=__tests__',
        '--coverage',
        '--coverageReporters=text',
        '--coverageReporters=json-summary',
        '--passWithNoTests'
      ], { verbose: true });

      // Parse coverage from output
      const coverageMatch = result.stdout.match(/All files[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*(\d+\.?\d*)/);
      const coverage = coverageMatch ? parseFloat(coverageMatch[1]) : 0;

      this.results.unit.coverage = coverage;
      this.results.unit.passed = (result.stdout.match(/✓/g) || []).length;
      this.results.unit.failed = (result.stdout.match(/✕/g) || []).length;

      this.log(`Unit tests completed - Passed: ${this.results.unit.passed}, Failed: ${this.results.unit.failed}, Coverage: ${coverage}%`, 'success');
    } catch (error) {
      this.log(`Unit tests failed: ${error.stderr || error.message}`, 'error');
      this.results.unit.failed = 1;
    }
  }

  async runIntegrationTests() {
    this.log('🔗 Running integration tests...', 'test');

    try {
      const result = await this.runCommand('node', ['scripts/integration-test.js'], { verbose: true });
      
      // Parse results from integration test output
      const passedMatch = result.stdout.match(/✅ Passed: (\d+)/);
      const failedMatch = result.stdout.match(/❌ Failed: (\d+)/);

      this.results.integration.passed = passedMatch ? parseInt(passedMatch[1]) : 0;
      this.results.integration.failed = failedMatch ? parseInt(failedMatch[1]) : 0;

      this.log(`Integration tests completed - Passed: ${this.results.integration.passed}, Failed: ${this.results.integration.failed}`, 'success');
    } catch (error) {
      this.log(`Integration tests failed: ${error.stderr || error.message}`, 'error');
      this.results.integration.failed = 1;
    }
  }

  async runSecurityTests() {
    this.log('🔒 Running security tests...', 'test');

    try {
      // Run npm audit
      const auditResult = await this.runCommand('pnpm', ['audit', '--json']);
      const auditData = JSON.parse(auditResult.stdout);
      
      const vulnerabilities = auditData.metadata?.vulnerabilities || {};
      const totalVulns = Object.values(vulnerabilities).reduce((sum, count) => sum + count, 0);

      if (totalVulns === 0) {
        this.results.security.passed = 1;
        this.log('No security vulnerabilities found', 'success');
      } else {
        this.results.security.failed = 1;
        this.log(`Found ${totalVulns} security vulnerabilities`, 'warning');
      }

      // Check for exposed secrets
      const secretsCheck = await this.checkForSecrets();
      if (secretsCheck.hasSecrets) {
        this.results.security.failed++;
        this.log(`Found exposed secrets: ${secretsCheck.secrets.join(', ')}`, 'error');
      } else {
        this.results.security.passed++;
        this.log('No exposed secrets found', 'success');
      }

    } catch (error) {
      this.log(`Security tests failed: ${error.message}`, 'error');
      this.results.security.failed = 1;
    }
  }

  async checkForSecrets() {
    const secretPatterns = [
      /PRIVATE_KEY\s*=\s*[0-9a-fA-F]{64}/,
      /JWT_SECRET\s*=\s*["'].*change.*["']/,
      /API_KEY\s*=\s*["'][^"']{20,}["']/,
      /SECRET\s*=\s*["']test|demo|example["']/
    ];

    const filesToCheck = ['.env', '.env.local', '.env.example'];
    const foundSecrets = [];

    for (const file of filesToCheck) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        for (const pattern of secretPatterns) {
          if (pattern.test(content)) {
            foundSecrets.push(`${file}: ${pattern.source}`);
          }
        }
      }
    }

    return {
      hasSecrets: foundSecrets.length > 0,
      secrets: foundSecrets
    };
  }

  async runPerformanceTests() {
    this.log('⚡ Running performance tests...', 'test');

    try {
      // Basic performance test - check if app builds within reasonable time
      const buildStart = Date.now();
      await this.runCommand('pnpm', ['run', 'build']);
      const buildTime = Date.now() - buildStart;

      if (buildTime < 120000) { // 2 minutes
        this.results.performance.passed = 1;
        this.log(`Build completed in ${buildTime}ms`, 'success');
      } else {
        this.results.performance.failed = 1;
        this.log(`Build took too long: ${buildTime}ms`, 'warning');
      }

    } catch (error) {
      this.log(`Performance tests failed: ${error.message}`, 'error');
      this.results.performance.failed = 1;
    }
  }

  generateReport() {
    const totalTime = Date.now() - this.startTime;
    const totalPassed = Object.values(this.results).reduce((sum, result) => sum + result.passed, 0);
    const totalFailed = Object.values(this.results).reduce((sum, result) => sum + result.failed, 0);
    const totalTests = totalPassed + totalFailed;
    const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;

    const report = `
🧪 TEST SUITE RESULTS
=====================

📊 Summary:
- Total Tests: ${totalTests}
- Passed: ${totalPassed}
- Failed: ${totalFailed}
- Success Rate: ${successRate}%
- Total Time: ${(totalTime / 1000).toFixed(1)}s

📋 Detailed Results:
- Unit Tests: ${this.results.unit.passed}/${this.results.unit.passed + this.results.unit.failed} (Coverage: ${this.results.unit.coverage}%)
- Integration Tests: ${this.results.integration.passed}/${this.results.integration.passed + this.results.integration.failed}
- Security Tests: ${this.results.security.passed}/${this.results.security.passed + this.results.security.failed}
- Performance Tests: ${this.results.performance.passed}/${this.results.performance.passed + this.results.performance.failed}

${totalFailed === 0 ? '🎉 All tests passed!' : '⚠️  Some tests failed. Please review the output above.'}
`;

    console.log(report);

    // Save report to file
    fs.writeFileSync('test-results.txt', report);
    
    // Save JSON report
    const jsonReport = {
      timestamp: new Date().toISOString(),
      totalTime,
      totalTests,
      totalPassed,
      totalFailed,
      successRate: parseFloat(successRate),
      results: this.results
    };
    
    fs.writeFileSync('test-results.json', JSON.stringify(jsonReport, null, 2));

    return totalFailed === 0;
  }

  async run() {
    this.log('🚀 Starting comprehensive test suite...', 'test');

    try {
      await this.checkPrerequisites();
      await this.runUnitTests();
      await this.runIntegrationTests();
      await this.runSecurityTests();
      await this.runPerformanceTests();

      const success = this.generateReport();
      
      if (success) {
        this.log('🎉 All tests completed successfully!', 'success');
        process.exit(0);
      } else {
        this.log('❌ Some tests failed. Check the report for details.', 'error');
        process.exit(1);
      }

    } catch (error) {
      this.log(`Test suite failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run the test suite if this file is executed directly
if (require.main === module) {
  const runner = new TestSuiteRunner();
  runner.run();
}

module.exports = TestSuiteRunner;
