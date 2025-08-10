// const puppeteer = require('puppeteer'); // Temporarily disabled
const cron = require('node-cron');
const { pool } = require('../config/database');
const Tender = require('../models/Tender');
const { SCRAPING_CONFIG, TENDER_CATEGORIES, DEPARTMENTS, INDIAN_STATES } = require('../config/constants');

class ScraperService {
  constructor() {
    this.browser = null;
    this.isRunning = false;
    this.logId = null;
  }

  // Initialize browser
  async initBrowser() {
    // Temporarily disabled - puppeteer not installed
    console.log('Browser initialization disabled - puppeteer not available');
    return null;
  }

  // Close browser
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // Create scraping log entry
  async createScrapingLog(portal) {
    const query = `
      INSERT INTO scraping_logs (portal, status, started_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      RETURNING id
    `;
    
    try {
      const result = await pool.query(query, [portal, 'running']);
      this.logId = result.rows[0].id;
      return this.logId;
    } catch (error) {
      console.error('Error creating scraping log:', error);
      return null;
    }
  }

  // Update scraping log
  async updateScrapingLog(status, tendersFound = 0, tendersNew = 0, tendersUpdated = 0, errorMessage = null) {
    if (!this.logId) return;

    const query = `
      UPDATE scraping_logs 
      SET status = $1, tenders_found = $2, tenders_new = $3, tenders_updated = $4, 
          error_message = $5, completed_at = CURRENT_TIMESTAMP
      WHERE id = $6
    `;
    
    try {
      await pool.query(query, [status, tendersFound, tendersNew, tendersUpdated, errorMessage, this.logId]);
    } catch (error) {
      console.error('Error updating scraping log:', error);
    }
  }

  // Scrape GeM portal
  async scrapeGeMPortal() {
    console.log('Starting GeM portal scraping...');
    
    const logId = await this.createScrapingLog('GeM');
    let tendersFound = 0;
    let tendersNew = 0;
    let tendersUpdated = 0;

    try {
      // Temporarily return mock data since puppeteer is not available
      console.log('Scraping temporarily disabled - returning mock data');
      
      const tenders = this.generateMockTenders('GeM', 5);
      tendersFound = tenders.length;
      console.log(`Generated ${tendersFound} mock tenders for GeM portal`);

      // Process and save tenders
      for (const tenderData of tenders) {
        try {
          const processedTender = await this.processTenderData(tenderData, 'GeM');
          
          // Check if tender already exists
          const existingTender = await Tender.findByRefNo(processedTender.tender_ref_no);
          
          if (!existingTender) {
            await Tender.create(processedTender);
            tendersNew++;
          } else {
            // Update existing tender if needed
            await Tender.update(existingTender.id, processedTender);
            tendersUpdated++;
          }

          // Rate limiting
          await this.delay(1000); // 1 second delay for mock data
        } catch (error) {
          console.error('Error processing tender:', error);
        }
      }

      await this.updateScrapingLog('completed', tendersFound, tendersNew, tendersUpdated);
      
      console.log(`GeM scraping completed: ${tendersNew} new, ${tendersUpdated} updated`);
      return { tendersFound, tendersNew, tendersUpdated };

    } catch (error) {
      console.error('GeM scraping error:', error);
      await this.updateScrapingLog('failed', tendersFound, tendersNew, tendersUpdated, error.message);
      throw error;
    }
  }

  // Scrape CPPP portal
  async scrapeCPPPPortal() {
    console.log('Starting CPPP portal scraping...');
    
    const logId = await this.createScrapingLog('CPPP');
    let tendersFound = 0;
    let tendersNew = 0;
    let tendersUpdated = 0;

    try {
      // Temporarily return mock data since puppeteer is not available
      console.log('CPPP scraping temporarily disabled - returning mock data');
      
      const tenders = this.generateMockTenders('CPPP', 3);
      tendersFound = tenders.length;
      console.log(`Generated ${tendersFound} mock tenders for CPPP portal`);

      // Process tenders
      for (const tenderData of tenders) {
        try {
          const processedTender = await this.processTenderData(tenderData, 'CPPP');
          
          const existingTender = await Tender.findByRefNo(processedTender.tender_ref_no);
          
          if (!existingTender) {
            await Tender.create(processedTender);
            tendersNew++;
          } else {
            await Tender.update(existingTender.id, processedTender);
            tendersUpdated++;
          }

          await this.delay(1000); // 1 second delay for mock data
        } catch (error) {
          console.error('Error processing CPPP tender:', error);
        }
      }

      await this.updateScrapingLog('completed', tendersFound, tendersNew, tendersUpdated);
      
      console.log(`CPPP scraping completed: ${tendersNew} new, ${tendersUpdated} updated`);
      return { tendersFound, tendersNew, tendersUpdated };

    } catch (error) {
      console.error('CPPP scraping error:', error);
      await this.updateScrapingLog('failed', tendersFound, tendersNew, tendersUpdated, error.message);
      throw error;
    }
  }

  // Process and normalize tender data
  async processTenderData(rawTender, portal) {
    const processed = {
      tender_ref_no: this.cleanTenderRefNo(rawTender.tender_ref_no),
      title: this.cleanText(rawTender.title),
      description: this.cleanText(rawTender.description) || rawTender.title,
      department: this.mapDepartment(rawTender.department),
      state: this.extractState(rawTender.location || rawTender.department),
      city: this.extractCity(rawTender.location || ''),
      publish_date: this.parseDate(rawTender.publish_date),
      bid_deadline: this.parseDate(rawTender.bid_deadline),
      category: this.categorizeTitle(rawTender.title),
      source_portal: portal,
      source_url: rawTender.source_url,
      budget_min: this.extractBudget(rawTender.budget, 'min'),
      budget_max: this.extractBudget(rawTender.budget, 'max'),
      status: 'active'
    };

    return processed;
  }

  // Helper methods for data processing
  cleanTenderRefNo(refNo) {
    if (!refNo) return '';
    return refNo.replace(/[^\w\/\-]/g, '').toUpperCase();
  }

  cleanText(text) {
    if (!text) return '';
    return text.trim().replace(/\s+/g, ' ').substring(0, 500);
  }

  mapDepartment(dept) {
    if (!dept) return DEPARTMENTS[0];
    
    const deptLower = dept.toLowerCase();
    const mapping = {
      'education': 'Ministry of Education',
      'health': 'Ministry of Health & Family Welfare',
      'transport': 'Ministry of Transport',
      'it': 'Ministry of Information Technology',
      'defence': 'Ministry of Defence',
      'railway': 'Ministry of Railways',
      'power': 'Ministry of Power',
      'agriculture': 'Ministry of Agriculture',
      'rural': 'Ministry of Rural Development',
      'urban': 'Ministry of Urban Development'
    };

    for (const [key, value] of Object.entries(mapping)) {
      if (deptLower.includes(key)) {
        return value;
      }
    }

    return DEPARTMENTS[0];
  }

  extractState(location) {
    if (!location) return INDIAN_STATES[0];
    
    const locationLower = location.toLowerCase();
    for (const state of INDIAN_STATES) {
      if (locationLower.includes(state.toLowerCase())) {
        return state;
      }
    }
    
    return INDIAN_STATES[0];
  }

  extractCity(location) {
    if (!location) return 'Not Specified';
    
    // Simple city extraction - in real implementation, use a proper city database
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];
    const locationLower = location.toLowerCase();
    
    for (const city of cities) {
      if (locationLower.includes(city.toLowerCase())) {
        return city;
      }
    }
    
    return 'Not Specified';
  }

  parseDate(dateStr) {
    if (!dateStr) return null;
    
    try {
      // Handle various date formats
      const cleaned = dateStr.replace(/[^\d\/\-\s]/g, '');
      const date = new Date(cleaned);
      
      if (isNaN(date.getTime())) {
        return null;
      }
      
      return date;
    } catch (error) {
      return null;
    }
  }

  categorizeTitle(title) {
    if (!title) return TENDER_CATEGORIES[0];
    
    const titleLower = title.toLowerCase();
    const categoryMapping = {
      'computer': 'IT Equipment',
      'software': 'Software Development',
      'construction': 'Construction',
      'building': 'Construction',
      'medical': 'Medical Equipment',
      'hospital': 'Medical Equipment',
      'office': 'Office Supplies',
      'furniture': 'Office Supplies',
      'transport': 'Transportation',
      'vehicle': 'Transportation',
      'consultancy': 'Consultancy Services',
      'consultant': 'Consultancy Services',
      'infrastructure': 'Infrastructure',
      'road': 'Infrastructure'
    };

    for (const [keyword, category] of Object.entries(categoryMapping)) {
      if (titleLower.includes(keyword)) {
        return category;
      }
    }

    return TENDER_CATEGORIES[0];
  }

  extractBudget(budgetStr, type) {
    if (!budgetStr) return null;
    
    try {
      const numbers = budgetStr.match(/[\d,]+/g);
      if (!numbers) return null;
      
      const amounts = numbers.map(n => parseInt(n.replace(/,/g, '')));
      
      if (type === 'min') {
        return Math.min(...amounts);
      } else {
        return Math.max(...amounts);
      }
    } catch (error) {
      return null;
    }
  }

  // Utility method for delays
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate mock tender data for testing
  generateMockTenders(portal, count = 5) {
    const mockTenders = [];
    const titles = [
      'Supply of Computer Hardware for Government Office',
      'Construction of School Building in Rural Area',
      'Medical Equipment for District Hospital',
      'Software Development for E-Governance Portal',
      'Office Furniture and Equipment Supply',
      'Road Construction and Maintenance Project',
      'Consultancy Services for IT Infrastructure',
      'Supply of Vehicles for Government Department'
    ];

    const departments = [
      'Ministry of Education',
      'Ministry of Health & Family Welfare',
      'Ministry of Information Technology',
      'Ministry of Rural Development',
      'Ministry of Transport'
    ];

    const states = ['Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu', 'Gujarat'];
    const cities = ['Mumbai', 'Bangalore', 'Delhi', 'Chennai', 'Ahmedabad'];

    for (let i = 0; i < count; i++) {
      const randomTitle = titles[Math.floor(Math.random() * titles.length)];
      const randomDept = departments[Math.floor(Math.random() * departments.length)];
      const randomState = states[Math.floor(Math.random() * states.length)];
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      
      const publishDate = new Date();
      publishDate.setDate(publishDate.getDate() - Math.floor(Math.random() * 30));
      
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + Math.floor(Math.random() * 60) + 10);

      mockTenders.push({
        tender_ref_no: `${portal}/${new Date().getFullYear()}/B/${String(Math.floor(Math.random() * 90000) + 10000)}`,
        title: randomTitle,
        description: `${randomTitle} - Detailed specifications and requirements will be provided in the tender document.`,
        department: randomDept,
        state: randomState,
        city: randomCity,
        publish_date: publishDate.toISOString(),
        bid_deadline: deadlineDate.toISOString(),
        budget: `₹${Math.floor(Math.random() * 50) + 5} Lakh`,
        source_url: `https://example.com/tender/${Math.floor(Math.random() * 10000)}`
      });
    }

    return mockTenders;
  }

  // Run all scrapers
  async runAllScrapers() {
    if (this.isRunning) {
      console.log('Scraping already in progress...');
      return;
    }

    this.isRunning = true;
    console.log('Starting tender scraping process...');

    try {
      await this.initBrowser();
      
      const results = {
        gem: null,
        cppp: null,
        total: { found: 0, new: 0, updated: 0 }
      };

      // Scrape GeM portal
      try {
        results.gem = await this.scrapeGeMPortal();
        results.total.found += results.gem.tendersFound;
        results.total.new += results.gem.tendersNew;
        results.total.updated += results.gem.tendersUpdated;
      } catch (error) {
        console.error('GeM scraping failed:', error);
        results.gem = { error: error.message };
      }

      // Scrape CPPP portal
      try {
        results.cppp = await this.scrapeCPPPPortal();
        results.total.found += results.cppp.tendersFound;
        results.total.new += results.cppp.tendersNew;
        results.total.updated += results.cppp.tendersUpdated;
      } catch (error) {
        console.error('CPPP scraping failed:', error);
        results.cppp = { error: error.message };
      }

      console.log('Scraping completed:', results.total);
      return results;

    } catch (error) {
      console.error('Scraping process error:', error);
      throw error;
    } finally {
      await this.closeBrowser();
      this.isRunning = false;
    }
  }

  // Setup cron job for automated scraping
  setupCronJob() {
    const cronExpression = process.env.SCRAPING_INTERVAL || '0 2 * * *'; // Default: 2 AM daily
    
    console.log(`Setting up scraping cron job: ${cronExpression}`);
    
    cron.schedule(cronExpression, async () => {
      console.log('Running scheduled tender scraping...');
      try {
        await this.runAllScrapers();
      } catch (error) {
        console.error('Scheduled scraping failed:', error);
      }
    });
  }

  // Manual scraping trigger (for API endpoint)
  async manualScrape(portal = 'all') {
    try {
      if (portal === 'all') {
        return await this.runAllScrapers();
      } else if (portal === 'gem') {
        await this.initBrowser();
        const result = await this.scrapeGeMPortal();
        await this.closeBrowser();
        return result;
      } else if (portal === 'cppp') {
        await this.initBrowser();
        const result = await this.scrapeCPPPPortal();
        await this.closeBrowser();
        return result;
      } else {
        throw new Error('Invalid portal specified');
      }
    } catch (error) {
      await this.closeBrowser();
      throw error;
    }
  }
}

// Create singleton instance
const scraperService = new ScraperService();

// Export for use in other modules
module.exports = scraperService;

// If running directly, start the scraping process
if (require.main === module) {
  scraperService.runAllScrapers()
    .then(results => {
      console.log('Scraping completed successfully:', results);
      process.exit(0);
    })
    .catch(error => {
      console.error('Scraping failed:', error);
      process.exit(1);
    });
}