# TenderMatch Pro Testing Framework

A comprehensive testing framework for the Indian Government Tender Aggregation Platform, designed to ensure reliability, performance, and compliance with Indian market requirements.

## 🏗️ Framework Architecture

```
/tests
├── /unit                    # Unit tests for individual components
│   ├── /components         # React component tests
│   ├── /services          # Business logic tests
│   ├── /utils             # Utility function tests
│   └── /scrapers          # Web scraper tests
├── /integration            # Integration tests
│   ├── /api               # API endpoint tests
│   ├── /database          # Database integration tests
│   └── /ai                # AI/ML feature tests
├── /e2e                    # End-to-end tests
│   ├── /user-flows        # Complete user journey tests
│   └── /critical-paths    # Business-critical functionality
├── /performance            # Performance and load tests
│   ├── /load-tests        # Normal load testing
│   └── /stress-tests      # Stress and spike testing
├── /fixtures               # Test data and mock files
│   ├── /real-data         # Real government tender data
│   ├── /test-documents    # Sample PDF/document files
│   └── /sample-tenders    # Mock tender data
├── /config                 # Test configuration files
└── /helpers                # Test utility functions
    ├── db-helper.js       # Database test utilities
    ├── scraper-helper.js  # Web scraping test utilities
    └── auth-helper.js     # Authentication test utilities
```

## 🛠️ Technology Stack

| Tool | Version | Purpose |
|------|---------|---------|
| **Jest** | v29.x | Unit testing framework |
| **Puppeteer** | v21.x | Web scraping tests |
| **Playwright** | v1.40.x | Complex browser automation |
| **Supertest** | v6.x | API endpoint testing |
| **React Testing Library** | v14.x | Component testing |
| **Cypress** | v13.x | End-to-end testing |
| **Artillery** | v2.x | Load and performance testing |
| **Newman** | v6.x | Postman collection testing |

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install all testing dependencies
npm install

# Or install manually
npm install --save-dev jest puppeteer cypress artillery newman
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev @faker-js/faker axios-mock-adapter
```

### 2. Environment Setup

```bash
# Copy test environment file
cp .env.test.example .env.test

# Edit test configuration
nano .env.test
```

### 3. Run Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:e2e           # End-to-end tests only
npm run test:scraper       # Scraper tests only
npm run test:performance   # Performance tests only

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### 4. Advanced Test Runner

```bash
# Use the comprehensive test runner
node tests/run-tests.js

# Run specific test types
node tests/run-tests.js unit integration
node tests/run-tests.js e2e performance
```

## 📋 Test Categories

### Unit Tests (`/tests/unit`)

Test individual components and functions in isolation.

**Component Tests:**
```javascript
// Example: TenderCard component test
describe('TenderCard Component', () => {
  test('renders tender information correctly', () => {
    const mockTender = {
      id: 'GEM/2024/B/12345',
      title: 'IT Equipment Supply',
      budget: 5000000
    };
    
    render(<TenderCard tender={mockTender} />);
    expect(screen.getByText('GEM/2024/B/12345')).toBeInTheDocument();
    expect(screen.getByText('₹50.00 Lakh')).toBeInTheDocument();
  });
});
```

**Scraper Tests:**
```javascript
// Example: GeM portal scraper test
describe('GeM Portal Scraper', () => {
  test('should extract tender data correctly', async () => {
    await scraperHelper.createMockGeMPage();
    const tenders = await scraperHelper.extractTenderData(selectors);
    expect(tenders).toHaveLength(10);
    expect(tenders[0]).toHaveProperty('id');
  });
});
```

### Integration Tests (`/tests/integration`)

Test interactions between different parts of the system.

**API Tests:**
```javascript
// Example: Tenders API test
describe('Tenders API', () => {
  test('should return filtered tenders', async () => {
    const response = await request(app)
      .get('/api/tenders')
      .query({ state: 'Maharashtra' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(response.body.data).toBeInstanceOf(Array);
  });
});
```

### End-to-End Tests (`/tests/e2e`)

Test complete user workflows from browser perspective.

**User Flow Tests:**
```javascript
// Example: Tender search flow
describe('Tender Search Flow', () => {
  it('should search and filter tenders', () => {
    cy.visit('/');
    cy.get('[data-testid="search-input"]').type('IT Equipment');
    cy.get('[data-testid="search-button"]').click();
    cy.get('[data-testid="tender-card"]').should('have.length.greaterThan', 0);
  });
});
```

### Performance Tests (`/tests/performance`)

Test system performance under various load conditions.

**Load Testing Configuration:**
```yaml
# Artillery configuration for Indian market
config:
  target: 'http://localhost:53337'
  phases:
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"
  
  variables:
    indianStates: ["Maharashtra", "Karnataka", "Tamil Nadu"]
    searchTerms: ["IT Equipment", "Construction"]
```

## 🇮🇳 Indian Market Specific Features

### 1. Currency Format Testing
```javascript
// Test Indian currency formatting
expect(formatCurrency(5000000)).toBe('₹50.00 Lakh');
expect(formatCurrency(25000000)).toBe('₹2.50 Crore');
```

### 2. Date Format Testing
```javascript
// Test Indian date format (DD/MM/YYYY)
expect(formatDate('2024-01-15')).toBe('15/01/2024');
```

### 3. Hindi Language Support
```javascript
// Test Hindi content rendering
cy.get('[data-testid="language-selector"]').select('hi');
cy.get('[data-testid="search-placeholder"]')
  .should('contain.text', 'निविदाएं खोजें');
```

### 4. Mobile-First Testing
```javascript
// Test mobile responsiveness
cy.viewport(375, 667);
cy.get('[data-testid="mobile-header"]').should('be.visible');
```

### 5. Slow Network Simulation
```javascript
// Test performance on slow connections
await scraperHelper.simulateSlowNetwork();
// Verify graceful degradation
```

## 🔧 Test Helpers

### Database Helper (`db-helper.js`)
```javascript
import dbHelper from './helpers/db-helper';

// Setup test database
await dbHelper.setupPostgreSQL();
await dbHelper.seedTestData();

// Cleanup after tests
await dbHelper.cleanupTestData();
```

### Scraper Helper (`scraper-helper.js`)
```javascript
import scraperHelper from './helpers/scraper-helper';

// Setup browser for scraping tests
await scraperHelper.setupBrowser();
await scraperHelper.createMockGeMPage();

// Extract data with selectors
const tenders = await scraperHelper.extractTenderData(selectors);
```

### Auth Helper (`auth-helper.js`)
```javascript
import authHelper from './helpers/auth-helper';

// Create test user
const user = await authHelper.createTestUser();
const token = authHelper.generateTestToken(user);

// Create auth headers
const headers = authHelper.createAuthHeaders(user);
```

## 📊 Test Reports

### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

### Performance Reports
```bash
# Run performance tests
npm run test:load

# Generate Artillery report
npx artillery report tests/reports/performance.json
```

### E2E Test Reports
```bash
# Run Cypress tests with reporting
npm run test:e2e

# View test videos and screenshots
ls tests/e2e/videos/
ls tests/e2e/screenshots/
```

## 🎯 Test Data Management

### Mock Data Generation
```javascript
// Generate realistic Indian tender data
const mockTender = {
  id: 'GEM/2024/B/12345',
  title: 'सरकारी कार्यालय के लिए आईटी उपकरण',
  department: 'सूचना प्रौद्योगिकी',
  state: 'महाराष्ट्र',
  budget: 5000000,
  status: 'Active'
};
```

### Real Data Testing
```bash
# Test with real government data
npm run test:real-data
```

## 🔍 Debugging Tests

### Debug Unit Tests
```bash
# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Debug specific test file
npm test -- --testNamePattern="TenderCard" --verbose
```

### Debug E2E Tests
```bash
# Open Cypress in interactive mode
npm run test:e2e:open

# Run with browser visible
npx cypress run --headed --no-exit
```

### Debug Scraper Tests
```bash
# Run scrapers with visible browser
HEADLESS=false npm run test:scraper
```

## 📈 Performance Benchmarks

### Response Time Targets
- **Search API**: < 1 second (median)
- **Filter API**: < 2 seconds (95th percentile)
- **Page Load**: < 3 seconds (mobile 3G)
- **Scraping**: < 30 seconds per portal

### Load Testing Targets
- **Concurrent Users**: 1,000+
- **Requests per Second**: 500+
- **Success Rate**: > 99%
- **Error Rate**: < 1%

## 🚨 Continuous Integration

### GitHub Actions
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: node tests/run-tests.js
```

### Pre-commit Hooks
```bash
# Install husky for pre-commit hooks
npm install --save-dev husky

# Add pre-commit test hook
npx husky add .husky/pre-commit "npm run test:unit"
```

## 🔒 Security Testing

### Authentication Tests
```javascript
// Test JWT token validation
test('should reject invalid tokens', async () => {
  const response = await request(app)
    .get('/api/tenders')
    .set('Authorization', 'Bearer invalid-token')
    .expect(401);
});
```

### Input Validation Tests
```javascript
// Test SQL injection prevention
test('should sanitize search input', async () => {
  const maliciousInput = "'; DROP TABLE tenders; --";
  const response = await request(app)
    .get('/api/tenders')
    .query({ search: maliciousInput })
    .expect(200);
  
  // Should not crash and return safe results
  expect(response.body.data).toBeInstanceOf(Array);
});
```

## 📚 Best Practices

### 1. Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Mock Strategy
- Mock external APIs and services
- Use real data for integration tests
- Keep mocks simple and focused

### 3. Performance Testing
- Test with realistic data volumes
- Simulate Indian network conditions
- Monitor memory usage and cleanup

### 4. Accessibility Testing
- Test keyboard navigation
- Verify ARIA labels
- Check color contrast

### 5. Internationalization Testing
- Test Hindi and English content
- Verify currency and date formats
- Test RTL layout support

## 🆘 Troubleshooting

### Common Issues

**1. Puppeteer Installation Issues**
```bash
# Install Chromium manually
npx puppeteer browsers install chrome
```

**2. Database Connection Issues**
```bash
# Check PostgreSQL service
sudo service postgresql status

# Reset test database
npm run db:reset:test
```

**3. Port Conflicts**
```bash
# Check if ports are in use
lsof -i :53337
lsof -i :5000

# Kill processes if needed
kill -9 <PID>
```

**4. Memory Issues in CI**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
```

## 📞 Support

For testing framework support:
- 📧 Email: testing@tendermatch.pro
- 📖 Documentation: [Testing Wiki](https://github.com/tendermatch/docs/wiki/testing)
- 🐛 Issues: [GitHub Issues](https://github.com/tendermatch/tendermatch-pro/issues)

## 📄 License

This testing framework is part of TenderMatch Pro and follows the same license terms.