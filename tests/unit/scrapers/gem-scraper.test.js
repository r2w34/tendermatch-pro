// Unit tests for GeM portal scraper
import scraperHelper from '../../helpers/scraper-helper';

describe('GeM Portal Scraper', () => {
  let browser, page;

  beforeAll(async () => {
    browser = await scraperHelper.setupBrowser({ headless: true });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await scraperHelper.cleanup();
  });

  beforeEach(async () => {
    // Reset page state
    await page.goto('about:blank');
  });

  describe('Page Navigation', () => {
    test('should navigate to GeM portal successfully', async () => {
      // Mock GeM portal page
      await scraperHelper.createMockGeMPage();
      
      const title = await page.title();
      expect(title).toBe('Government e-Marketplace');
      
      // Check if tender list container exists
      const tenderList = await page.$('.tender-list');
      expect(tenderList).toBeTruthy();
    });

    test('should handle network timeouts gracefully', async () => {
      // Simulate slow network
      await scraperHelper.simulateSlowNetwork();
      
      const startTime = Date.now();
      
      try {
        await page.goto('https://gem.gov.in', { timeout: 5000 });
      } catch (error) {
        const endTime = Date.now();
        expect(endTime - startTime).toBeGreaterThan(4000);
        expect(error.message).toContain('timeout');
      }
    });

    test('should retry failed requests', async () => {
      let attemptCount = 0;
      
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        attemptCount++;
        if (attemptCount < 3) {
          request.abort('failed');
        } else {
          request.continue();
        }
      });

      await scraperHelper.createMockGeMPage();
      expect(attemptCount).toBe(3);
    });
  });

  describe('Tender Data Extraction', () => {
    beforeEach(async () => {
      await scraperHelper.createMockGeMPage();
    });

    test('should extract tender cards correctly', async () => {
      const selectors = {
        container: '.tender-card',
        fields: {
          id: '.tender-card',
          title: '.tender-title',
          department: '.tender-department',
          location: '.tender-location',
          budget: '.tender-budget',
          deadline: '.tender-deadline',
          status: '.tender-status'
        }
      };

      const tenders = await scraperHelper.extractTenderData(selectors);
      
      expect(tenders).toHaveLength(10);
      expect(tenders[0]).toHaveProperty('id');
      expect(tenders[0]).toHaveProperty('title');
      expect(tenders[0]).toHaveProperty('department');
      expect(tenders[0]).toHaveProperty('budget');
    });

    test('should handle missing data fields gracefully', async () => {
      // Create page with incomplete tender data
      const incompleteHtml = `
        <div class="tender-list">
          <div class="tender-card">
            <h3 class="tender-title">Incomplete Tender</h3>
            <!-- Missing other fields -->
          </div>
        </div>
      `;
      
      await page.setContent(incompleteHtml);
      
      const selectors = {
        container: '.tender-card',
        fields: {
          title: '.tender-title',
          department: '.tender-department',
          budget: '.tender-budget'
        }
      };

      const tenders = await scraperHelper.extractTenderData(selectors);
      
      expect(tenders).toHaveLength(1);
      expect(tenders[0].title).toBe('Incomplete Tender');
      expect(tenders[0].department).toBe(''); // Should be empty string for missing fields
      expect(tenders[0].budget).toBe('');
    });

    test('should parse Indian currency formats correctly', async () => {
      const currencyTestHtml = `
        <div class="tender-list">
          <div class="tender-card">
            <p class="tender-budget">₹50,00,000</p>
          </div>
          <div class="tender-card">
            <p class="tender-budget">₹2.5 Crore</p>
          </div>
          <div class="tender-card">
            <p class="tender-budget">₹75 Lakh</p>
          </div>
        </div>
      `;
      
      await page.setContent(currencyTestHtml);
      
      const budgets = await page.$$eval('.tender-budget', elements => 
        elements.map(el => el.textContent.trim())
      );
      
      expect(budgets).toContain('₹50,00,000');
      expect(budgets).toContain('₹2.5 Crore');
      expect(budgets).toContain('₹75 Lakh');
    });

    test('should handle Hindi content correctly', async () => {
      const hindiHtml = `
        <div class="tender-list">
          <div class="tender-card">
            <h3 class="tender-title">सरकारी कार्यालय के लिए आईटी उपकरण</h3>
            <p class="tender-department">सूचना प्रौद्योगिकी विभाग</p>
            <p class="tender-location">महाराष्ट्र, मुंबई</p>
          </div>
        </div>
      `;
      
      await page.setContent(hindiHtml);
      
      const title = await page.$eval('.tender-title', el => el.textContent.trim());
      const department = await page.$eval('.tender-department', el => el.textContent.trim());
      
      expect(title).toBe('सरकारी कार्यालय के लिए आईटी उपकरण');
      expect(department).toBe('सूचना प्रौद्योगिकी विभाग');
    });
  });

  describe('Pagination Handling', () => {
    beforeEach(async () => {
      await scraperHelper.createMockGeMPage();
    });

    test('should detect pagination links', async () => {
      const paginationLinks = await page.$$('.page-link');
      expect(paginationLinks.length).toBeGreaterThan(0);
      
      const pageNumbers = await page.$$eval('.page-link', links => 
        links.map(link => link.textContent.trim())
      );
      
      expect(pageNumbers).toContain('1');
      expect(pageNumbers).toContain('2');
      expect(pageNumbers).toContain('3');
    });

    test('should navigate through pages correctly', async () => {
      const page2Link = await page.$('a[href="?page=2"]');
      expect(page2Link).toBeTruthy();
      
      // Simulate clicking page 2
      await page2Link.click();
      await page.waitForNavigation();
      
      const currentUrl = page.url();
      expect(currentUrl).toContain('page=2');
    });

    test('should handle last page detection', async () => {
      // Navigate to last page
      const page3Link = await page.$('a[href="?page=3"]');
      await page3Link.click();
      await page.waitForNavigation();
      
      // Check if next page link is disabled or missing
      const nextPageLink = await page.$('a[href="?page=4"]');
      expect(nextPageLink).toBeFalsy();
    });
  });

  describe('Error Handling', () => {
    test('should handle CAPTCHA detection', async () => {
      const captchaHtml = `
        <div class="captcha-container">
          <img src="/captcha.jpg" class="captcha-image" />
          <input name="captcha" type="text" />
        </div>
      `;
      
      await page.setContent(captchaHtml);
      
      const captchaDetected = await scraperHelper.handleCaptcha();
      expect(captchaDetected).toBe(true);
      
      // Check if CAPTCHA input was filled
      const captchaValue = await page.$eval('input[name="captcha"]', el => el.value);
      expect(captchaValue).toBe('TEST123');
    });

    test('should handle rate limiting', async () => {
      let requestCount = 0;
      
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        requestCount++;
        if (requestCount > 5) {
          request.respond({
            status: 429,
            contentType: 'text/html',
            body: 'Too Many Requests'
          });
        } else {
          request.continue();
        }
      });

      // Make multiple requests
      for (let i = 0; i < 7; i++) {
        try {
          await page.goto('about:blank');
        } catch (error) {
          if (i > 5) {
            expect(error.message).toContain('429');
          }
        }
      }
    });

    test('should handle server errors gracefully', async () => {
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        request.respond({
          status: 500,
          contentType: 'text/html',
          body: 'Internal Server Error'
        });
      });

      try {
        await page.goto('https://gem.gov.in');
      } catch (error) {
        expect(error.message).toContain('500');
      }
    });
  });

  describe('Performance Monitoring', () => {
    test('should monitor memory usage during scraping', async () => {
      await scraperHelper.createMockGeMPage();
      
      const initialMetrics = await scraperHelper.monitorPerformance();
      
      // Perform some scraping operations
      await scraperHelper.extractTenderData({
        container: '.tender-card',
        fields: { title: '.tender-title' }
      });
      
      const finalMetrics = await scraperHelper.monitorPerformance();
      
      expect(finalMetrics.jsHeapUsedSize).toBeGreaterThan(0);
      expect(finalMetrics.timestamp).toBeGreaterThan(initialMetrics.timestamp);
    });

    test('should measure scraping speed', async () => {
      await scraperHelper.createMockGeMPage();
      
      const startTime = Date.now();
      
      await scraperHelper.extractTenderData({
        container: '.tender-card',
        fields: {
          title: '.tender-title',
          department: '.tender-department',
          budget: '.tender-budget'
        }
      });
      
      const endTime = Date.now();
      const scrapingTime = endTime - startTime;
      
      // Should complete within reasonable time (5 seconds)
      expect(scrapingTime).toBeLessThan(5000);
    });
  });

  describe('Data Validation', () => {
    test('should validate tender ID format', async () => {
      await scraperHelper.createMockGeMPage();
      
      const tenders = await scraperHelper.extractTenderData({
        container: '.tender-card',
        fields: { id: '[data-tender-id]' }
      });
      
      tenders.forEach(tender => {
        // GeM tender ID format: GEM/YYYY/B/NNNNN
        expect(tender.id).toMatch(/^GEM\/\d{4}\/[A-Z]\/\d{5}$/);
      });
    });

    test('should validate date formats', async () => {
      const dateTestHtml = `
        <div class="tender-list">
          <div class="tender-card">
            <p class="tender-deadline">15/02/2024</p>
          </div>
          <div class="tender-card">
            <p class="tender-deadline">28-Feb-2024</p>
          </div>
        </div>
      `;
      
      await page.setContent(dateTestHtml);
      
      const dates = await page.$$eval('.tender-deadline', elements => 
        elements.map(el => el.textContent.trim())
      );
      
      dates.forEach(date => {
        // Should be valid date format
        expect(new Date(date).toString()).not.toBe('Invalid Date');
      });
    });

    test('should validate required fields presence', async () => {
      await scraperHelper.createMockGeMPage();
      
      const tenders = await scraperHelper.extractTenderData({
        container: '.tender-card',
        fields: {
          title: '.tender-title',
          department: '.tender-department',
          budget: '.tender-budget'
        }
      });
      
      tenders.forEach(tender => {
        expect(tender.title).toBeTruthy();
        expect(tender.title.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Mobile Responsiveness', () => {
    test('should work on mobile viewport', async () => {
      await scraperHelper.simulateMobileDevice();
      await scraperHelper.createMockGeMPage();
      
      const viewport = page.viewport();
      expect(viewport.width).toBe(375);
      expect(viewport.height).toBe(667);
      
      // Should still be able to extract data on mobile
      const tenders = await scraperHelper.extractTenderData({
        container: '.tender-card',
        fields: { title: '.tender-title' }
      });
      
      expect(tenders.length).toBeGreaterThan(0);
    });
  });
});