// Web scraping test helper utilities
import puppeteer from 'puppeteer';
import { faker } from '@faker-js/faker';

class ScraperHelper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.mockResponses = new Map();
  }

  // Setup Puppeteer browser for scraping tests
  async setupBrowser(options = {}) {
    const defaultOptions = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ],
      ...options
    };

    try {
      this.browser = await puppeteer.launch(defaultOptions);
      this.page = await this.browser.newPage();
      
      // Set Indian locale and timezone
      await this.page.setExtraHTTPHeaders({
        'Accept-Language': 'en-IN,hi-IN;q=0.9,en;q=0.8'
      });
      
      await this.page.setViewport({ width: 1366, height: 768 });
      
      // Set user agent to mimic real browser
      await this.page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      console.log('✅ Puppeteer browser setup complete');
      return this.browser;
    } catch (error) {
      console.error('❌ Failed to setup Puppeteer browser:', error);
      throw error;
    }
  }

  // Create mock GeM portal page
  async createMockGeMPage() {
    const mockHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Government e-Marketplace</title>
      </head>
      <body>
        <div class="tender-list">
          ${this.generateMockTenderCards(10)}
        </div>
        <div class="pagination">
          <a href="?page=1" class="page-link">1</a>
          <a href="?page=2" class="page-link">2</a>
          <a href="?page=3" class="page-link">3</a>
        </div>
      </body>
      </html>
    `;

    await this.page.setContent(mockHtml);
    return this.page;
  }

  // Create mock CPPP portal page
  async createMockCPPPPage() {
    const mockHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Central Public Procurement Portal</title>
      </head>
      <body>
        <table class="tender-table">
          <thead>
            <tr>
              <th>Tender ID</th>
              <th>Title</th>
              <th>Department</th>
              <th>Value</th>
              <th>Deadline</th>
            </tr>
          </thead>
          <tbody>
            ${this.generateMockTenderRows(15)}
          </tbody>
        </table>
      </body>
      </html>
    `;

    await this.page.setContent(mockHtml);
    return this.page;
  }

  // Generate mock tender cards for GeM
  generateMockTenderCards(count) {
    const cards = [];
    for (let i = 0; i < count; i++) {
      const tender = this.generateMockTender();
      cards.push(`
        <div class="tender-card" data-tender-id="${tender.id}">
          <h3 class="tender-title">${tender.title}</h3>
          <p class="tender-department">${tender.department}</p>
          <p class="tender-location">${tender.state}, ${tender.city}</p>
          <p class="tender-budget">₹${tender.budget.toLocaleString('en-IN')}</p>
          <p class="tender-deadline">${tender.deadline}</p>
          <span class="tender-status ${tender.status.toLowerCase()}">${tender.status}</span>
          <a href="/tender/${tender.id}" class="view-details">View Details</a>
        </div>
      `);
    }
    return cards.join('');
  }

  // Generate mock tender table rows for CPPP
  generateMockTenderRows(count) {
    const rows = [];
    for (let i = 0; i < count; i++) {
      const tender = this.generateMockTender();
      rows.push(`
        <tr class="tender-row" data-tender-id="${tender.id}">
          <td class="tender-id">${tender.id}</td>
          <td class="tender-title">${tender.title}</td>
          <td class="tender-department">${tender.department}</td>
          <td class="tender-value">₹${tender.budget.toLocaleString('en-IN')}</td>
          <td class="tender-deadline">${tender.deadline}</td>
        </tr>
      `);
    }
    return rows.join('');
  }

  // Generate realistic mock tender data
  generateMockTender() {
    const departments = [
      'Information Technology',
      'Education',
      'Health and Family Welfare',
      'Public Works Department',
      'Transport',
      'Agriculture',
      'Defence',
      'Railways'
    ];

    const states = [
      'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan',
      'Uttar Pradesh', 'West Bengal', 'Delhi', 'Haryana', 'Punjab'
    ];

    const categories = [
      'IT Equipment', 'Construction', 'Consultancy Services',
      'Medical Equipment', 'Office Supplies', 'Transportation',
      'Infrastructure', 'Software Development'
    ];

    const statuses = ['Active', 'Closing Soon', 'Closed'];

    const department = faker.helpers.arrayElement(departments);
    const state = faker.helpers.arrayElement(states);
    const category = faker.helpers.arrayElement(categories);
    const status = faker.helpers.arrayElement(statuses);

    return {
      id: `GEM/2024/B/${faker.number.int({ min: 10000, max: 99999 })}`,
      title: this.generateTenderTitle(category, department),
      description: faker.lorem.paragraph(3),
      department,
      state,
      city: this.getCityForState(state),
      budget: faker.number.int({ min: 100000, max: 50000000 }),
      publishedDate: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
      deadline: faker.date.future({ days: 60 }).toISOString().split('T')[0],
      status,
      category
    };
  }

  // Generate realistic tender titles
  generateTenderTitle(category, department) {
    const titles = {
      'IT Equipment': [
        'Supply of Laptops and Desktops',
        'Procurement of Network Equipment',
        'Supply of Printers and Scanners',
        'IT Infrastructure Setup'
      ],
      'Construction': [
        'Construction of Office Building',
        'Road Construction and Maintenance',
        'Bridge Construction Project',
        'School Building Construction'
      ],
      'Consultancy Services': [
        'Management Consultancy Services',
        'IT Consultancy and Support',
        'Financial Advisory Services',
        'Legal Consultancy Services'
      ],
      'Medical Equipment': [
        'Supply of Medical Equipment',
        'Hospital Equipment Procurement',
        'Diagnostic Equipment Supply',
        'Surgical Instruments Purchase'
      ]
    };

    const categoryTitles = titles[category] || ['General Procurement Services'];
    const baseTitle = faker.helpers.arrayElement(categoryTitles);
    
    return `${baseTitle} for ${department}`;
  }

  // Get appropriate city for state
  getCityForState(state) {
    const stateCities = {
      'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
      'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore'],
      'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem'],
      'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
      'Delhi': ['New Delhi', 'Delhi'],
      'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi']
    };

    const cities = stateCities[state] || ['City'];
    return faker.helpers.arrayElement(cities);
  }

  // Mock network responses for scraping tests
  async mockNetworkResponse(url, response) {
    this.mockResponses.set(url, response);
    
    await this.page.setRequestInterception(true);
    this.page.on('request', (request) => {
      const mockResponse = this.mockResponses.get(request.url());
      if (mockResponse) {
        request.respond(mockResponse);
      } else {
        request.continue();
      }
    });
  }

  // Simulate slow network conditions
  async simulateSlowNetwork() {
    const client = await this.page.target().createCDPSession();
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 50 * 1024, // 50 KB/s
      uploadThroughput: 20 * 1024,   // 20 KB/s
      latency: 2000 // 2 seconds
    });
  }

  // Simulate mobile device
  async simulateMobileDevice() {
    await this.page.setViewport({ width: 375, height: 667 });
    await this.page.setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
    );
  }

  // Test scraper resilience with random failures
  async simulateRandomFailures(failureRate = 0.1) {
    await this.page.setRequestInterception(true);
    this.page.on('request', (request) => {
      if (Math.random() < failureRate) {
        request.abort('failed');
      } else {
        request.continue();
      }
    });
  }

  // Extract tender data using common selectors
  async extractTenderData(selectors) {
    return await this.page.evaluate((sel) => {
      const tenders = [];
      const tenderElements = document.querySelectorAll(sel.container);
      
      tenderElements.forEach(element => {
        const tender = {};
        
        // Extract each field using provided selectors
        Object.keys(sel.fields).forEach(field => {
          const fieldElement = element.querySelector(sel.fields[field]);
          if (fieldElement) {
            tender[field] = fieldElement.textContent.trim();
          }
        });
        
        tenders.push(tender);
      });
      
      return tenders;
    }, selectors);
  }

  // Wait for dynamic content to load
  async waitForDynamicContent(selector, timeout = 10000) {
    try {
      await this.page.waitForSelector(selector, { timeout });
      await this.page.waitForFunction(
        (sel) => document.querySelectorAll(sel).length > 0,
        { timeout },
        selector
      );
      return true;
    } catch (error) {
      console.warn(`⚠️ Dynamic content not loaded: ${selector}`);
      return false;
    }
  }

  // Handle CAPTCHA for testing (mock solution)
  async handleCaptcha() {
    const captchaSelector = 'img[src*="captcha"], .captcha-image';
    const captchaExists = await this.page.$(captchaSelector);
    
    if (captchaExists) {
      console.log('🔒 CAPTCHA detected - using mock solution for testing');
      
      // In real tests, you might want to use a CAPTCHA solving service
      // For now, we'll just simulate solving it
      const captchaInput = await this.page.$('input[name*="captcha"]');
      if (captchaInput) {
        await captchaInput.type('TEST123'); // Mock CAPTCHA solution
      }
      
      return true;
    }
    
    return false;
  }

  // Performance monitoring during scraping
  async monitorPerformance() {
    const metrics = await this.page.metrics();
    return {
      timestamp: Date.now(),
      jsHeapUsedSize: metrics.JSHeapUsedSize,
      jsHeapTotalSize: metrics.JSHeapTotalSize,
      scriptDuration: metrics.ScriptDuration,
      taskDuration: metrics.TaskDuration,
      layoutCount: metrics.LayoutCount,
      recalcStyleCount: metrics.RecalcStyleCount
    };
  }

  // Cleanup browser resources
  async cleanup() {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      
      this.mockResponses.clear();
      console.log('✅ Scraper helper cleanup complete');
    } catch (error) {
      console.warn('⚠️ Error during scraper cleanup:', error.message);
    }
  }

  // Generate test data files
  async generateTestDataFiles() {
    const testData = {
      tenders: Array.from({ length: 100 }, () => this.generateMockTender()),
      timestamp: new Date().toISOString(),
      source: 'test-generator'
    };

    return testData;
  }
}

// Singleton instance
const scraperHelper = new ScraperHelper();

export default scraperHelper;

// Convenience functions
export const setupScraper = async (options = {}) => {
  await scraperHelper.setupBrowser(options);
  return scraperHelper;
};

export const cleanupScraper = async () => {
  await scraperHelper.cleanup();
};