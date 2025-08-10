#!/usr/bin/env node

// Comprehensive test runner for TenderMatch Pro
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class TestRunner {
  constructor() {
    this.testResults = {
      unit: { passed: 0, failed: 0, duration: 0 },
      integration: { passed: 0, failed: 0, duration: 0 },
      e2e: { passed: 0, failed: 0, duration: 0 },
      performance: { passed: 0, failed: 0, duration: 0 },
      scrapers: { passed: 0, failed: 0, duration: 0 }
    };
    
    this.startTime = Date.now();
  }

  // Print colored output
  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red,
      header: chalk.cyan.bold
    };
    
    console.log(`[${timestamp}] ${colors[type](message)}`);
  }

  // Check if required dependencies are installed
  async checkDependencies() {
    this.log('🔍 Checking test dependencies...', 'header');
    
    const requiredPackages = [
      'jest',
      'puppeteer',
      'cypress',
      'artillery',
      '@testing-library/react'
    ];

    for (const pkg of requiredPackages) {
      try {
        require.resolve(pkg);
        this.log(`✅ ${pkg} is installed`, 'success');
      } catch (error) {
        this.log(`❌ ${pkg} is missing. Please run: npm install --save-dev ${pkg}`, 'error');
        process.exit(1);
      }
    }
  }

  // Setup test environment
  async setupEnvironment() {
    this.log('🛠️ Setting up test environment...', 'header');
    
    // Load test environment variables
    process.env.NODE_ENV = 'test';
    
    // Create test directories if they don't exist
    const testDirs = [
      'tests/coverage',
      'tests/reports',
      'tests/screenshots',
      'tests/videos'
    ];

    testDirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.log(`📁 Created directory: ${dir}`, 'info');
      }
    });

    // Setup test database
    try {
      const dbHelper = require('./helpers/db-helper');
      await dbHelper.setupPostgreSQL();
      await dbHelper.createTestSchema();
      this.log('✅ Test database setup complete', 'success');
    } catch (error) {
      this.log('⚠️ Test database setup failed, using mocks', 'warning');
    }
  }

  // Run unit tests
  async runUnitTests() {
    this.log('🧪 Running unit tests...', 'header');
    const startTime = Date.now();

    return new Promise((resolve) => {
      const jest = spawn('npx', ['jest', 'tests/unit', '--coverage', '--json'], {
        stdio: ['inherit', 'pipe', 'inherit']
      });

      let output = '';
      jest.stdout.on('data', (data) => {
        output += data.toString();
      });

      jest.on('close', (code) => {
        const duration = Date.now() - startTime;
        
        try {
          const results = JSON.parse(output);
          this.testResults.unit = {
            passed: results.numPassedTests || 0,
            failed: results.numFailedTests || 0,
            duration
          };
          
          if (code === 0) {
            this.log(`✅ Unit tests passed (${this.testResults.unit.passed} tests, ${duration}ms)`, 'success');
          } else {
            this.log(`❌ Unit tests failed (${this.testResults.unit.failed} failures)`, 'error');
          }
        } catch (error) {
          this.log('⚠️ Could not parse unit test results', 'warning');
        }

        resolve(code === 0);
      });
    });
  }

  // Run integration tests
  async runIntegrationTests() {
    this.log('🔗 Running integration tests...', 'header');
    const startTime = Date.now();

    return new Promise((resolve) => {
      const jest = spawn('npx', ['jest', 'tests/integration', '--runInBand', '--json'], {
        stdio: ['inherit', 'pipe', 'inherit']
      });

      let output = '';
      jest.stdout.on('data', (data) => {
        output += data.toString();
      });

      jest.on('close', (code) => {
        const duration = Date.now() - startTime;
        
        try {
          const results = JSON.parse(output);
          this.testResults.integration = {
            passed: results.numPassedTests || 0,
            failed: results.numFailedTests || 0,
            duration
          };
          
          if (code === 0) {
            this.log(`✅ Integration tests passed (${this.testResults.integration.passed} tests, ${duration}ms)`, 'success');
          } else {
            this.log(`❌ Integration tests failed (${this.testResults.integration.failed} failures)`, 'error');
          }
        } catch (error) {
          this.log('⚠️ Could not parse integration test results', 'warning');
        }

        resolve(code === 0);
      });
    });
  }

  // Run scraper tests
  async runScraperTests() {
    this.log('🕷️ Running scraper tests...', 'header');
    const startTime = Date.now();

    return new Promise((resolve) => {
      const jest = spawn('npx', ['jest', 'tests/unit/scrapers', '--runInBand', '--json'], {
        stdio: ['inherit', 'pipe', 'inherit']
      });

      let output = '';
      jest.stdout.on('data', (data) => {
        output += data.toString();
      });

      jest.on('close', (code) => {
        const duration = Date.now() - startTime;
        
        try {
          const results = JSON.parse(output);
          this.testResults.scrapers = {
            passed: results.numPassedTests || 0,
            failed: results.numFailedTests || 0,
            duration
          };
          
          if (code === 0) {
            this.log(`✅ Scraper tests passed (${this.testResults.scrapers.passed} tests, ${duration}ms)`, 'success');
          } else {
            this.log(`❌ Scraper tests failed (${this.testResults.scrapers.failed} failures)`, 'error');
          }
        } catch (error) {
          this.log('⚠️ Could not parse scraper test results', 'warning');
        }

        resolve(code === 0);
      });
    });
  }

  // Run E2E tests
  async runE2ETests() {
    this.log('🎭 Running E2E tests...', 'header');
    const startTime = Date.now();

    // Check if application is running
    const isAppRunning = await this.checkApplicationHealth();
    if (!isAppRunning) {
      this.log('❌ Application is not running. Please start the app first.', 'error');
      return false;
    }

    return new Promise((resolve) => {
      const cypress = spawn('npx', ['cypress', 'run', '--reporter', 'json'], {
        stdio: ['inherit', 'pipe', 'inherit']
      });

      let output = '';
      cypress.stdout.on('data', (data) => {
        output += data.toString();
      });

      cypress.on('close', (code) => {
        const duration = Date.now() - startTime;
        
        try {
          const results = JSON.parse(output);
          this.testResults.e2e = {
            passed: results.stats?.passes || 0,
            failed: results.stats?.failures || 0,
            duration
          };
          
          if (code === 0) {
            this.log(`✅ E2E tests passed (${this.testResults.e2e.passed} tests, ${duration}ms)`, 'success');
          } else {
            this.log(`❌ E2E tests failed (${this.testResults.e2e.failed} failures)`, 'error');
          }
        } catch (error) {
          this.log('⚠️ Could not parse E2E test results', 'warning');
        }

        resolve(code === 0);
      });
    });
  }

  // Run performance tests
  async runPerformanceTests() {
    this.log('⚡ Running performance tests...', 'header');
    const startTime = Date.now();

    // Check if application is running
    const isAppRunning = await this.checkApplicationHealth();
    if (!isAppRunning) {
      this.log('❌ Application is not running. Skipping performance tests.', 'error');
      return false;
    }

    return new Promise((resolve) => {
      const artillery = spawn('npx', ['artillery', 'run', 'tests/performance/load-tests/main.yml', '--output', 'tests/reports/performance.json'], {
        stdio: ['inherit', 'pipe', 'inherit']
      });

      let output = '';
      artillery.stdout.on('data', (data) => {
        output += data.toString();
      });

      artillery.on('close', (code) => {
        const duration = Date.now() - startTime;
        
        // Parse Artillery results
        try {
          const reportPath = 'tests/reports/performance.json';
          if (fs.existsSync(reportPath)) {
            const results = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
            const summary = results.aggregate;
            
            this.testResults.performance = {
              passed: summary.codes['200'] || 0,
              failed: (summary.codes['4xx'] || 0) + (summary.codes['5xx'] || 0),
              duration
            };
            
            this.log(`📊 Performance test results:`, 'info');
            this.log(`   • Requests: ${summary.requestsCompleted}`, 'info');
            this.log(`   • Success rate: ${((summary.codes['200'] / summary.requestsCompleted) * 100).toFixed(2)}%`, 'info');
            this.log(`   • Avg response time: ${summary.latency.mean.toFixed(2)}ms`, 'info');
            this.log(`   • P95 response time: ${summary.latency.p95.toFixed(2)}ms`, 'info');
          }
          
          if (code === 0) {
            this.log(`✅ Performance tests completed (${duration}ms)`, 'success');
          } else {
            this.log(`❌ Performance tests failed`, 'error');
          }
        } catch (error) {
          this.log('⚠️ Could not parse performance test results', 'warning');
        }

        resolve(code === 0);
      });
    });
  }

  // Check if application is running
  async checkApplicationHealth() {
    return new Promise((resolve) => {
      const http = require('http');
      const req = http.get('http://localhost:53337', (res) => {
        resolve(res.statusCode === 200);
      });
      
      req.on('error', () => {
        resolve(false);
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        resolve(false);
      });
    });
  }

  // Generate test report
  generateReport() {
    this.log('📊 Generating test report...', 'header');
    
    const totalDuration = Date.now() - this.startTime;
    const totalTests = Object.values(this.testResults).reduce((sum, result) => sum + result.passed + result.failed, 0);
    const totalPassed = Object.values(this.testResults).reduce((sum, result) => sum + result.passed, 0);
    const totalFailed = Object.values(this.testResults).reduce((sum, result) => sum + result.failed, 0);
    
    const report = {
      summary: {
        totalTests,
        totalPassed,
        totalFailed,
        successRate: totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) : 0,
        totalDuration: totalDuration,
        timestamp: new Date().toISOString()
      },
      results: this.testResults,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };

    // Save report to file
    const reportPath = 'tests/reports/test-summary.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    this.log('📋 TEST SUMMARY', 'header');
    console.log('='.repeat(60));
    
    Object.entries(this.testResults).forEach(([type, result]) => {
      const status = result.failed === 0 ? '✅' : '❌';
      const duration = (result.duration / 1000).toFixed(2);
      this.log(`${status} ${type.toUpperCase()}: ${result.passed} passed, ${result.failed} failed (${duration}s)`, 
        result.failed === 0 ? 'success' : 'error');
    });
    
    console.log('='.repeat(60));
    this.log(`🎯 OVERALL: ${totalPassed}/${totalTests} tests passed (${report.summary.successRate}%)`, 
      totalFailed === 0 ? 'success' : 'error');
    this.log(`⏱️ Total duration: ${(totalDuration / 1000).toFixed(2)}s`, 'info');
    this.log(`📄 Detailed report saved to: ${reportPath}`, 'info');
    console.log('='.repeat(60) + '\n');
    
    return totalFailed === 0;
  }

  // Cleanup test environment
  async cleanup() {
    this.log('🧹 Cleaning up test environment...', 'header');
    
    try {
      const dbHelper = require('./helpers/db-helper');
      await dbHelper.cleanupTestData();
      await dbHelper.teardown();
      this.log('✅ Test database cleanup complete', 'success');
    } catch (error) {
      this.log('⚠️ Test database cleanup failed', 'warning');
    }

    // Clean up auth helper
    try {
      const authHelper = require('./helpers/auth-helper');
      authHelper.cleanup();
      this.log('✅ Auth helper cleanup complete', 'success');
    } catch (error) {
      this.log('⚠️ Auth helper cleanup failed', 'warning');
    }
  }

  // Main test runner
  async run(testTypes = ['unit', 'integration', 'scrapers', 'e2e', 'performance']) {
    try {
      await this.checkDependencies();
      await this.setupEnvironment();
      
      const results = {};
      
      if (testTypes.includes('unit')) {
        results.unit = await this.runUnitTests();
      }
      
      if (testTypes.includes('integration')) {
        results.integration = await this.runIntegrationTests();
      }
      
      if (testTypes.includes('scrapers')) {
        results.scrapers = await this.runScraperTests();
      }
      
      if (testTypes.includes('e2e')) {
        results.e2e = await this.runE2ETests();
      }
      
      if (testTypes.includes('performance')) {
        results.performance = await this.runPerformanceTests();
      }
      
      const allPassed = this.generateReport();
      await this.cleanup();
      
      process.exit(allPassed ? 0 : 1);
      
    } catch (error) {
      this.log(`💥 Test runner failed: ${error.message}`, 'error');
      await this.cleanup();
      process.exit(1);
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const testRunner = new TestRunner();
  
  if (args.length === 0) {
    // Run all tests
    testRunner.run();
  } else {
    // Run specific test types
    const validTypes = ['unit', 'integration', 'scrapers', 'e2e', 'performance'];
    const requestedTypes = args.filter(arg => validTypes.includes(arg));
    
    if (requestedTypes.length === 0) {
      console.log('Usage: node run-tests.js [unit] [integration] [scrapers] [e2e] [performance]');
      process.exit(1);
    }
    
    testRunner.run(requestedTypes);
  }
}

module.exports = TestRunner;