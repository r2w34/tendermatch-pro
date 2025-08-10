// Unit tests for TenderCard component
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TenderCard from '../../../src/components/tenders/TenderCard';
import { formatCurrency, formatDate } from '../../../src/utils/formatters';

// Mock the formatters
jest.mock('../../../src/utils/formatters', () => ({
  formatCurrency: jest.fn(),
  formatDate: jest.fn(),
  calculateDaysLeft: jest.fn(),
  getStatusColor: jest.fn(),
  getCategoryColor: jest.fn()
}));

describe('TenderCard Component', () => {
  const mockTender = {
    id: 'GEM/2024/B/12345',
    title: 'Supply of IT Equipment for Government Office',
    description: 'Procurement of laptops, desktops, and networking equipment',
    department: 'Information Technology',
    state: 'Maharashtra',
    city: 'Mumbai',
    budget: 5000000,
    publishedDate: '2024-01-15',
    deadlineDate: '2024-02-15',
    status: 'Active',
    category: 'IT Equipment'
  };

  const mockProps = {
    tender: mockTender,
    isFavorite: false,
    onToggleFavorite: jest.fn(),
    onViewDetails: jest.fn()
  };

  beforeEach(() => {
    // Setup mock implementations
    formatCurrency.mockImplementation((amount) => `₹${(amount / 100000).toFixed(2)} Lakh`);
    formatDate.mockImplementation((date) => '15/01/2024');
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders tender card with all essential information', () => {
      render(<TenderCard {...mockProps} />);

      // Check if tender ID is displayed
      expect(screen.getByText('GEM/2024/B/12345')).toBeInTheDocument();
      
      // Check if title is displayed (truncated if too long)
      expect(screen.getByText(/Supply of IT Equipment/)).toBeInTheDocument();
      
      // Check if department is displayed
      expect(screen.getByText('Information Technology')).toBeInTheDocument();
      
      // Check if location is displayed
      expect(screen.getByText('Maharashtra, Mumbai')).toBeInTheDocument();
      
      // Check if status is displayed
      expect(screen.getByText('Active')).toBeInTheDocument();
      
      // Check if category is displayed
      expect(screen.getByText('IT Equipment')).toBeInTheDocument();
    });

    test('displays formatted budget correctly', () => {
      render(<TenderCard {...mockProps} />);
      
      expect(formatCurrency).toHaveBeenCalledWith(5000000);
      expect(screen.getByText('₹50.00 Lakh')).toBeInTheDocument();
    });

    test('displays formatted dates correctly', () => {
      render(<TenderCard {...mockProps} />);
      
      expect(formatDate).toHaveBeenCalledWith('2024-01-15');
      expect(formatDate).toHaveBeenCalledWith('2024-02-15');
    });

    test('renders favorite button with correct state', () => {
      const { rerender } = render(<TenderCard {...mockProps} />);
      
      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      expect(favoriteButton).toBeInTheDocument();
      
      // Test unfavorited state
      expect(favoriteButton).not.toHaveClass('favorited');
      
      // Test favorited state
      rerender(<TenderCard {...mockProps} isFavorite={true} />);
      expect(favoriteButton).toHaveClass('favorited');
    });

    test('renders view details button', () => {
      render(<TenderCard {...mockProps} />);
      
      const viewDetailsButton = screen.getByRole('button', { name: /view details/i });
      expect(viewDetailsButton).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    test('calls onToggleFavorite when favorite button is clicked', async () => {
      render(<TenderCard {...mockProps} />);
      
      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      fireEvent.click(favoriteButton);
      
      await waitFor(() => {
        expect(mockProps.onToggleFavorite).toHaveBeenCalledWith(mockTender.id);
      });
    });

    test('calls onViewDetails when view details button is clicked', async () => {
      render(<TenderCard {...mockProps} />);
      
      const viewDetailsButton = screen.getByRole('button', { name: /view details/i });
      fireEvent.click(viewDetailsButton);
      
      await waitFor(() => {
        expect(mockProps.onViewDetails).toHaveBeenCalledWith(mockTender);
      });
    });

    test('calls onViewDetails when card is clicked', async () => {
      render(<TenderCard {...mockProps} />);
      
      const card = screen.getByTestId('tender-card');
      fireEvent.click(card);
      
      await waitFor(() => {
        expect(mockProps.onViewDetails).toHaveBeenCalledWith(mockTender);
      });
    });
  });

  describe('Status Indicators', () => {
    test('displays correct status styling for active tender', () => {
      render(<TenderCard {...mockProps} />);
      
      const statusBadge = screen.getByText('Active');
      expect(statusBadge).toHaveClass('status-active');
    });

    test('displays correct status styling for closing soon tender', () => {
      const closingSoonTender = { ...mockTender, status: 'Closing Soon' };
      render(<TenderCard {...mockProps} tender={closingSoonTender} />);
      
      const statusBadge = screen.getByText('Closing Soon');
      expect(statusBadge).toHaveClass('status-closing-soon');
    });

    test('displays correct status styling for closed tender', () => {
      const closedTender = { ...mockTender, status: 'Closed' };
      render(<TenderCard {...mockProps} tender={closedTender} />);
      
      const statusBadge = screen.getByText('Closed');
      expect(statusBadge).toHaveClass('status-closed');
    });
  });

  describe('Responsive Design', () => {
    test('adapts layout for mobile screens', () => {
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<TenderCard {...mockProps} />);
      
      const card = screen.getByTestId('tender-card');
      expect(card).toHaveClass('mobile-layout');
    });

    test('uses desktop layout for larger screens', () => {
      // Mock window.innerWidth for desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(<TenderCard {...mockProps} />);
      
      const card = screen.getByTestId('tender-card');
      expect(card).toHaveClass('desktop-layout');
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      render(<TenderCard {...mockProps} />);
      
      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-label', expect.stringContaining(mockTender.title));
      
      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      expect(favoriteButton).toHaveAttribute('aria-label');
    });

    test('supports keyboard navigation', () => {
      render(<TenderCard {...mockProps} />);
      
      const card = screen.getByTestId('tender-card');
      expect(card).toHaveAttribute('tabIndex', '0');
      
      // Test Enter key
      fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
      expect(mockProps.onViewDetails).toHaveBeenCalledWith(mockTender);
      
      // Test Space key
      fireEvent.keyDown(card, { key: ' ', code: 'Space' });
      expect(mockProps.onViewDetails).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    test('handles missing tender data gracefully', () => {
      const incompleteTender = {
        id: 'GEM/2024/B/12346',
        title: 'Incomplete Tender'
        // Missing other required fields
      };

      render(<TenderCard {...mockProps} tender={incompleteTender} />);
      
      expect(screen.getByText('GEM/2024/B/12346')).toBeInTheDocument();
      expect(screen.getByText('Incomplete Tender')).toBeInTheDocument();
      
      // Should not crash and should display fallback values
      expect(screen.getByText('N/A')).toBeInTheDocument(); // For missing department
    });

    test('handles invalid budget values', () => {
      const invalidBudgetTender = { ...mockTender, budget: null };
      
      render(<TenderCard {...mockProps} tender={invalidBudgetTender} />);
      
      expect(formatCurrency).toHaveBeenCalledWith(0); // Should default to 0
    });
  });

  describe('Performance', () => {
    test('memoizes expensive calculations', () => {
      const { rerender } = render(<TenderCard {...mockProps} />);
      
      // First render
      expect(formatCurrency).toHaveBeenCalledTimes(1);
      
      // Re-render with same props
      rerender(<TenderCard {...mockProps} />);
      
      // Should not call formatCurrency again due to memoization
      expect(formatCurrency).toHaveBeenCalledTimes(1);
      
      // Re-render with different tender
      const newTender = { ...mockTender, budget: 10000000 };
      rerender(<TenderCard {...mockProps} tender={newTender} />);
      
      // Should call formatCurrency again
      expect(formatCurrency).toHaveBeenCalledTimes(2);
    });
  });

  describe('Hindi Language Support', () => {
    test('displays content in Hindi when language is set to Hindi', () => {
      // Mock language context
      const mockLanguageContext = { language: 'hi', t: jest.fn(key => `hindi_${key}`) };
      
      // This would require proper i18n setup in the component
      // For now, we'll test that the component can handle Hindi text
      const hindiTender = {
        ...mockTender,
        title: 'सरकारी कार्यालय के लिए आईटी उपकरण की आपूर्ति',
        department: 'सूचना प्रौद्योगिकी'
      };

      render(<TenderCard {...mockProps} tender={hindiTender} />);
      
      expect(screen.getByText('सरकारी कार्यालय के लिए आईटी उपकरण की आपूर्ति')).toBeInTheDocument();
      expect(screen.getByText('सूचना प्रौद्योगिकी')).toBeInTheDocument();
    });
  });
});