// Unit tests for utility formatters
import { 
  formatCurrency, 
  formatDate, 
  formatDateDisplay,
  formatCurrencyInWords,
  calculateDaysLeft,
  getStatusColor,
  getCategoryColor,
  truncateText 
} from '../../../src/utils/formatters';

describe('Formatters Utility Functions', () => {
  describe('formatCurrency', () => {
    test('should format amounts in crores correctly', () => {
      expect(formatCurrency(50000000)).toBe('₹5.00 Crore');
      expect(formatCurrency(125000000)).toBe('₹12.50 Crore');
    });

    test('should format amounts in lakhs correctly', () => {
      expect(formatCurrency(500000)).toBe('₹5.00 Lakh');
      expect(formatCurrency(2500000)).toBe('₹25.00 Lakh');
    });

    test('should format amounts in thousands correctly', () => {
      expect(formatCurrency(50000)).toBe('₹50 Thousand');
      expect(formatCurrency(125000)).toBe('₹125 Thousand');
    });

    test('should format small amounts with Indian locale', () => {
      expect(formatCurrency(5000)).toBe('₹5,000');
      expect(formatCurrency(999)).toBe('₹999');
    });

    test('should handle zero and negative amounts', () => {
      expect(formatCurrency(0)).toBe('₹0');
      expect(formatCurrency(-1000)).toBe('₹-1,000');
    });
  });

  describe('formatDate', () => {
    test('should format date in DD/MM/YYYY format', () => {
      expect(formatDate('2024-01-15')).toBe('15/01/2024');
      expect(formatDate('2024-12-31')).toBe('31/12/2024');
    });

    test('should handle different date input formats', () => {
      expect(formatDate(new Date('2024-01-15'))).toBe('15/01/2024');
      expect(formatDate('2024-01-15T10:30:00Z')).toBe('15/01/2024');
    });
  });

  describe('formatDateDisplay', () => {
    test('should format date with month names', () => {
      const result = formatDateDisplay('2024-01-15');
      expect(result).toMatch(/15.*Jan.*2024/);
    });
  });

  describe('formatCurrencyInWords', () => {
    test('should format currency in Indian words style', () => {
      expect(formatCurrencyInWords(50000000)).toBe('₹5 Crore');
      expect(formatCurrencyInWords(2500000)).toBe('₹25 Lakh');
      expect(formatCurrencyInWords(150000)).toBe('₹1 Lakh 50 Thousand');
    });

    test('should handle complex amounts', () => {
      expect(formatCurrencyInWords(12345678)).toBe('₹1 Crore 23 Lakh 45 Thousand 678');
    });
  });

  describe('calculateDaysLeft', () => {
    test('should calculate days left correctly', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(calculateDaysLeft(tomorrow.toISOString())).toBe('1 day left');

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      expect(calculateDaysLeft(nextWeek.toISOString())).toBe('7 days left');
    });

    test('should handle today deadline', () => {
      const today = new Date().toISOString();
      expect(calculateDaysLeft(today)).toBe('Today');
    });

    test('should handle expired deadlines', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(calculateDaysLeft(yesterday.toISOString())).toBe('Expired');
    });
  });

  describe('getStatusColor', () => {
    test('should return correct colors for different statuses', () => {
      expect(getStatusColor('Active')).toBe('bg-green-100 text-green-800');
      expect(getStatusColor('Closing Soon')).toBe('bg-orange-100 text-orange-800');
      expect(getStatusColor('Closed')).toBe('bg-red-100 text-red-800');
      expect(getStatusColor('Unknown')).toBe('bg-gray-100 text-gray-800');
    });
  });

  describe('getCategoryColor', () => {
    test('should return correct colors for different categories', () => {
      expect(getCategoryColor('IT Equipment')).toBe('bg-blue-100 text-blue-800');
      expect(getCategoryColor('Construction')).toBe('bg-yellow-100 text-yellow-800');
      expect(getCategoryColor('Medical Equipment')).toBe('bg-red-100 text-red-800');
      expect(getCategoryColor('Unknown Category')).toBe('bg-gray-100 text-gray-800');
    });
  });

  describe('truncateText', () => {
    test('should truncate text longer than max length', () => {
      const longText = 'This is a very long text that should be truncated';
      expect(truncateText(longText, 20)).toBe('This is a very long ...');
    });

    test('should not truncate text shorter than max length', () => {
      const shortText = 'Short text';
      expect(truncateText(shortText, 20)).toBe('Short text');
    });

    test('should handle exact length text', () => {
      const exactText = 'Exactly twenty chars';
      expect(truncateText(exactText, 20)).toBe('Exactly twenty chars');
    });
  });

  describe('Indian Market Specific Tests', () => {
    test('should handle Indian currency symbols correctly', () => {
      const formatted = formatCurrency(1000000);
      expect(formatted).toContain('₹');
      expect(formatted).toContain('Lakh');
    });

    test('should format dates in Indian format', () => {
      const indianDate = formatDate('2024-01-15');
      expect(indianDate).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    test('should handle Hindi numerals context', () => {
      // Test that the formatter can handle Indian numbering system
      expect(formatCurrency(100000)).toBe('₹1.00 Lakh');
      expect(formatCurrency(10000000)).toBe('₹1.00 Crore');
    });
  });

  describe('Edge Cases', () => {
    test('should handle null and undefined inputs', () => {
      expect(formatCurrency(null)).toBe('₹0');
      expect(formatCurrency(undefined)).toBe('₹0');
      expect(truncateText(null, 10)).toBe('');
      expect(truncateText(undefined, 10)).toBe('');
    });

    test('should handle very large numbers', () => {
      const largeBudget = 1000000000; // 100 crore
      expect(formatCurrency(largeBudget)).toBe('₹100.00 Crore');
    });

    test('should handle invalid dates', () => {
      expect(calculateDaysLeft('invalid-date')).toBe('Expired');
    });
  });
});