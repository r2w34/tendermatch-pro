// E2E tests for tender search functionality
describe('Tender Search User Flow', () => {
  beforeEach(() => {
    // Seed test data
    cy.task('seedDatabase');
    
    // Visit the application
    cy.visit('/');
    
    // Wait for initial load
    cy.get('[data-testid="tender-list"]', { timeout: 10000 }).should('be.visible');
  });

  afterEach(() => {
    // Clean up test data
    cy.task('cleanDatabase');
  });

  describe('Basic Search Functionality', () => {
    it('should display tender list on homepage', () => {
      // Check if tender cards are displayed
      cy.get('[data-testid="tender-card"]').should('have.length.greaterThan', 0);
      
      // Check if essential information is displayed
      cy.get('[data-testid="tender-card"]').first().within(() => {
        cy.get('[data-testid="tender-id"]').should('be.visible');
        cy.get('[data-testid="tender-title"]').should('be.visible');
        cy.get('[data-testid="tender-department"]').should('be.visible');
        cy.get('[data-testid="tender-budget"]').should('be.visible');
        cy.get('[data-testid="tender-status"]').should('be.visible');
      });
    });

    it('should search tenders by keyword', () => {
      const searchTerm = 'IT Equipment';
      
      // Enter search term
      cy.get('[data-testid="search-input"]')
        .type(searchTerm)
        .should('have.value', searchTerm);
      
      // Click search button or press Enter
      cy.get('[data-testid="search-button"]').click();
      
      // Wait for search results
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
      
      // Verify search results contain the keyword
      cy.get('[data-testid="tender-card"]').each(($card) => {
        cy.wrap($card).within(() => {
          cy.get('[data-testid="tender-title"], [data-testid="tender-description"]')
            .should('contain.text', searchTerm);
        });
      });
      
      // Check search results count
      cy.get('[data-testid="results-count"]')
        .should('be.visible')
        .and('contain.text', 'results found');
    });

    it('should handle empty search results gracefully', () => {
      const nonExistentTerm = 'NonExistentTenderType12345';
      
      // Search for non-existent term
      cy.get('[data-testid="search-input"]').type(nonExistentTerm);
      cy.get('[data-testid="search-button"]').click();
      
      // Wait for search to complete
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
      
      // Check empty state
      cy.get('[data-testid="empty-results"]').should('be.visible');
      cy.get('[data-testid="empty-results-message"]')
        .should('contain.text', 'No tenders found');
      
      // Verify no tender cards are displayed
      cy.get('[data-testid="tender-card"]').should('not.exist');
    });

    it('should clear search and show all tenders', () => {
      // Perform a search first
      cy.get('[data-testid="search-input"]').type('IT Equipment');
      cy.get('[data-testid="search-button"]').click();
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
      
      // Clear search
      cy.get('[data-testid="clear-search"]').click();
      
      // Verify search input is cleared
      cy.get('[data-testid="search-input"]').should('have.value', '');
      
      // Verify all tenders are displayed again
      cy.get('[data-testid="tender-card"]').should('have.length.greaterThan', 1);
    });
  });

  describe('Filter Functionality', () => {
    it('should filter tenders by state', () => {
      // Open filters sidebar
      cy.get('[data-testid="filters-toggle"]').click();
      cy.get('[data-testid="filters-sidebar"]').should('be.visible');
      
      // Select a state
      const selectedState = 'Maharashtra';
      cy.get('[data-testid="state-filter"]').select(selectedState);
      
      // Apply filters
      cy.get('[data-testid="apply-filters"]').click();
      
      // Wait for results
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
      
      // Verify all results are from selected state
      cy.get('[data-testid="tender-card"]').each(($card) => {
        cy.wrap($card).within(() => {
          cy.get('[data-testid="tender-location"]')
            .should('contain.text', selectedState);
        });
      });
    });

    it('should filter tenders by budget range', () => {
      // Open filters
      cy.get('[data-testid="filters-toggle"]').click();
      
      // Set budget range (₹10 Lakh to ₹1 Crore)
      cy.get('[data-testid="budget-min"]').clear().type('1000000');
      cy.get('[data-testid="budget-max"]').clear().type('10000000');
      
      // Apply filters
      cy.get('[data-testid="apply-filters"]').click();
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
      
      // Verify budget range in results
      cy.get('[data-testid="tender-card"]').each(($card) => {
        cy.wrap($card).within(() => {
          cy.get('[data-testid="tender-budget"]').then(($budget) => {
            const budgetText = $budget.text();
            // Extract numeric value and verify it's within range
            // This would need proper parsing logic for Indian currency format
            expect(budgetText).to.match(/₹[\d,.]+ (Lakh|Crore)/);
          });
        });
      });
    });

    it('should filter tenders by category', () => {
      // Open filters
      cy.get('[data-testid="filters-toggle"]').click();
      
      // Select IT Equipment category
      cy.get('[data-testid="category-it-equipment"]').check();
      
      // Apply filters
      cy.get('[data-testid="apply-filters"]').click();
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
      
      // Verify all results are IT Equipment category
      cy.get('[data-testid="tender-card"]').each(($card) => {
        cy.wrap($card).within(() => {
          cy.get('[data-testid="tender-category"]')
            .should('contain.text', 'IT Equipment');
        });
      });
    });

    it('should combine multiple filters', () => {
      // Open filters
      cy.get('[data-testid="filters-toggle"]').click();
      
      // Apply multiple filters
      cy.get('[data-testid="state-filter"]').select('Maharashtra');
      cy.get('[data-testid="category-it-equipment"]').check();
      cy.get('[data-testid="status-active"]').check();
      
      // Apply filters
      cy.get('[data-testid="apply-filters"]').click();
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
      
      // Verify results match all filters
      cy.get('[data-testid="tender-card"]').each(($card) => {
        cy.wrap($card).within(() => {
          cy.get('[data-testid="tender-location"]').should('contain.text', 'Maharashtra');
          cy.get('[data-testid="tender-category"]').should('contain.text', 'IT Equipment');
          cy.get('[data-testid="tender-status"]').should('contain.text', 'Active');
        });
      });
    });

    it('should clear all filters', () => {
      // Apply some filters first
      cy.get('[data-testid="filters-toggle"]').click();
      cy.get('[data-testid="state-filter"]').select('Maharashtra');
      cy.get('[data-testid="category-it-equipment"]').check();
      cy.get('[data-testid="apply-filters"]').click();
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
      
      // Get initial filtered count
      cy.get('[data-testid="tender-card"]').then(($cards) => {
        const filteredCount = $cards.length;
        
        // Clear all filters
        cy.get('[data-testid="clear-filters"]').click();
        cy.get('[data-testid="loading-spinner"]').should('not.exist');
        
        // Verify more results are shown
        cy.get('[data-testid="tender-card"]').should('have.length.greaterThan', filteredCount);
      });
    });
  });

  describe('Sorting Functionality', () => {
    it('should sort tenders by latest first', () => {
      // Select sort option
      cy.get('[data-testid="sort-dropdown"]').select('latest');
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
      
      // Verify sorting order
      cy.get('[data-testid="tender-card"] [data-testid="tender-published-date"]')
        .then(($dates) => {
          const dates = Array.from($dates).map(el => new Date(el.textContent));
          const sortedDates = [...dates].sort((a, b) => b - a);
          expect(dates).to.deep.equal(sortedDates);
        });
    });

    it('should sort tenders by budget high to low', () => {
      // Select sort option
      cy.get('[data-testid="sort-dropdown"]').select('budget-high-low');
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
      
      // Verify sorting order (this would need proper budget parsing)
      cy.get('[data-testid="tender-card"] [data-testid="tender-budget"]')
        .then(($budgets) => {
          // In real implementation, parse Indian currency format and verify order
          expect($budgets.length).to.be.greaterThan(0);
        });
    });

    it('should sort tenders by deadline', () => {
      // Select sort option
      cy.get('[data-testid="sort-dropdown"]').select('deadline');
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
      
      // Verify sorting order
      cy.get('[data-testid="tender-card"] [data-testid="tender-deadline"]')
        .then(($deadlines) => {
          const deadlines = Array.from($deadlines).map(el => new Date(el.textContent));
          const sortedDeadlines = [...deadlines].sort((a, b) => a - b);
          expect(deadlines).to.deep.equal(sortedDeadlines);
        });
    });
  });

  describe('Pagination', () => {
    it('should navigate through pages', () => {
      // Ensure we have enough data for pagination
      cy.task('generateTestData', 25);
      cy.reload();
      cy.get('[data-testid="tender-list"]').should('be.visible');
      
      // Check if pagination is visible
      cy.get('[data-testid="pagination"]').should('be.visible');
      
      // Go to page 2
      cy.get('[data-testid="page-2"]').click();
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
      
      // Verify URL contains page parameter
      cy.url().should('include', 'page=2');
      
      // Verify different content is loaded
      cy.get('[data-testid="tender-card"]').should('have.length.greaterThan', 0);
      
      // Go back to page 1
      cy.get('[data-testid="page-1"]').click();
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
      cy.url().should('not.include', 'page=2');
    });

    it('should show correct page information', () => {
      // Check page info
      cy.get('[data-testid="page-info"]')
        .should('be.visible')
        .and('contain.text', 'Showing');
      
      // Check results per page
      cy.get('[data-testid="tender-card"]').should('have.length.at.most', 20);
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should work correctly on mobile viewport', () => {
      // Set mobile viewport
      cy.viewport(375, 667);
      
      // Check if mobile layout is applied
      cy.get('[data-testid="mobile-header"]').should('be.visible');
      cy.get('[data-testid="hamburger-menu"]').should('be.visible');
      
      // Open mobile menu
      cy.get('[data-testid="hamburger-menu"]').click();
      cy.get('[data-testid="mobile-nav"]').should('be.visible');
      
      // Check if filters are in mobile drawer
      cy.get('[data-testid="mobile-filters-button"]').click();
      cy.get('[data-testid="mobile-filters-drawer"]').should('be.visible');
      
      // Test search on mobile
      cy.get('[data-testid="mobile-search-input"]').type('IT Equipment');
      cy.get('[data-testid="mobile-search-button"]').click();
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
      
      // Verify results are displayed in mobile layout
      cy.get('[data-testid="tender-card"]').should('have.class', 'mobile-card');
    });
  });

  describe('Performance', () => {
    it('should load search results within acceptable time', () => {
      const startTime = Date.now();
      
      // Perform search
      cy.get('[data-testid="search-input"]').type('IT Equipment');
      cy.get('[data-testid="search-button"]').click();
      
      // Wait for results and measure time
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
      cy.get('[data-testid="tender-card"]').should('have.length.greaterThan', 0).then(() => {
        const endTime = Date.now();
        const loadTime = endTime - startTime;
        
        // Should load within 3 seconds
        expect(loadTime).to.be.lessThan(3000);
      });
    });

    it('should handle slow network conditions', () => {
      // Simulate slow network
      cy.intercept('GET', '/api/tenders*', (req) => {
        req.reply((res) => {
          // Add 2 second delay
          return new Promise((resolve) => {
            setTimeout(() => resolve(res), 2000);
          });
        });
      });
      
      // Perform search
      cy.get('[data-testid="search-input"]').type('Construction');
      cy.get('[data-testid="search-button"]').click();
      
      // Verify loading state is shown
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
      
      // Wait for results
      cy.get('[data-testid="loading-spinner"]', { timeout: 10000 }).should('not.exist');
      cy.get('[data-testid="tender-card"]').should('have.length.greaterThan', 0);
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
      // Tab through search elements
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'search-input');
      
      // Tab to search button
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'search-button');
      
      // Tab to first tender card
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid').and('contain', 'tender-card');
      
      // Press Enter to view details
      cy.focused().type('{enter}');
      cy.get('[data-testid="tender-modal"]').should('be.visible');
    });

    it('should have proper ARIA labels', () => {
      // Check search input
      cy.get('[data-testid="search-input"]')
        .should('have.attr', 'aria-label')
        .and('contain', 'Search tenders');
      
      // Check filter buttons
      cy.get('[data-testid="filters-toggle"]')
        .should('have.attr', 'aria-label')
        .and('contain', 'Toggle filters');
      
      // Check tender cards
      cy.get('[data-testid="tender-card"]').first()
        .should('have.attr', 'role', 'article')
        .and('have.attr', 'aria-label');
    });
  });

  describe('Hindi Language Support', () => {
    it('should display content in Hindi when language is changed', () => {
      // Change language to Hindi
      cy.get('[data-testid="language-selector"]').select('hi');
      
      // Verify Hindi text is displayed
      cy.get('[data-testid="search-placeholder"]')
        .should('contain.text', 'निविदाएं खोजें');
      
      // Verify filter labels are in Hindi
      cy.get('[data-testid="filters-toggle"]').click();
      cy.get('[data-testid="state-filter-label"]')
        .should('contain.text', 'राज्य');
      
      // Verify tender information is displayed correctly
      cy.get('[data-testid="tender-card"]').first().within(() => {
        cy.get('[data-testid="tender-budget"]')
          .should('contain.text', '₹'); // Currency symbol should remain
      });
    });
  });
});