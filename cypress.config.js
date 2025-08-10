const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:53337',
    supportFile: 'tests/e2e/support/e2e.js',
    specPattern: 'tests/e2e/**/*.cy.js',
    fixturesFolder: 'tests/fixtures',
    screenshotsFolder: 'tests/e2e/screenshots',
    videosFolder: 'tests/e2e/videos',
    downloadsFolder: 'tests/e2e/downloads',
    
    // Viewport settings for Indian mobile-first approach
    viewportWidth: 1366,
    viewportHeight: 768,
    
    // Test settings
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    
    // Video and screenshot settings
    video: true,
    screenshotOnRunFailure: true,
    
    // Retry settings for flaky tests
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    // Environment variables
    env: {
      apiUrl: 'http://localhost:5000/api',
      testUser: {
        email: 'test@example.com',
        password: 'TestPassword123!'
      },
      adminUser: {
        email: 'admin@tendermatch.pro',
        password: 'AdminPassword123!'
      }
    },
    
    setupNodeEvents(on, config) {
      // Task for database seeding
      on('task', {
        seedDatabase() {
          // In real implementation, this would seed the test database
          console.log('Seeding test database...');
          return null;
        },
        
        cleanDatabase() {
          // In real implementation, this would clean the test database
          console.log('Cleaning test database...');
          return null;
        },
        
        generateTestData(count = 10) {
          // Generate test tender data
          const { faker } = require('@faker-js/faker');
          const tenders = [];
          
          for (let i = 0; i < count; i++) {
            tenders.push({
              id: `GEM/2024/B/${faker.number.int({ min: 10000, max: 99999 })}`,
              title: faker.lorem.sentence(),
              department: faker.helpers.arrayElement([
                'Information Technology',
                'Education',
                'Health',
                'Transport',
                'Public Works'
              ]),
              state: faker.helpers.arrayElement([
                'Maharashtra',
                'Karnataka',
                'Tamil Nadu',
                'Gujarat',
                'Delhi'
              ]),
              budget: faker.number.int({ min: 100000, max: 50000000 }),
              status: faker.helpers.arrayElement(['Active', 'Closing Soon', 'Closed'])
            });
          }
          
          return tenders;
        },
        
        // Performance monitoring
        measurePageLoad(url) {
          const startTime = Date.now();
          return fetch(url)
            .then(() => Date.now() - startTime)
            .catch(() => -1);
        }
      });
      
      // Browser launch options
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.name === 'chrome') {
          // Add Chrome flags for better performance in CI
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--disable-gpu');
          
          // For testing slow connections
          if (config.env.slowNetwork) {
            launchOptions.args.push('--force-effective-connection-type=2g');
          }
        }
        
        return launchOptions;
      });
      
      // Custom commands for Indian localization
      on('task', {
        setLanguage(language) {
          // Set language preference in localStorage
          return { language };
        },
        
        formatIndianCurrency(amount) {
          if (amount >= 10000000) {
            return `₹${(amount / 10000000).toFixed(2)} Crore`;
          } else if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(2)} Lakh`;
          }
          return `₹${amount.toLocaleString('en-IN')}`;
        }
      });
      
      return config;
    },
  },
  
  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
    },
    specPattern: 'tests/unit/components/**/*.cy.js',
    supportFile: 'tests/e2e/support/component.js'
  },
});