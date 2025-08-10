// Global test setup for TenderMatch Pro
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import React from 'react';

// Load test environment variables
process.env.NODE_ENV = 'test';

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock window object for browser APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock fetch API
global.fetch = jest.fn();

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock navigator
Object.defineProperty(navigator, 'language', {
  writable: true,
  value: 'en-IN'
});

Object.defineProperty(navigator, 'languages', {
  writable: true,
  value: ['en-IN', 'hi-IN', 'en']
});

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn()
};
global.navigator.geolocation = mockGeolocation;

// Mock console methods for cleaner test output
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('componentWillReceiveProps') ||
       args[0].includes('componentWillUpdate'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Global test utilities
global.testUtils = {
  // Wait for async operations
  waitFor: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Mock API responses
  mockApiResponse: (data, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data))
  }),
  
  // Mock error response
  mockApiError: (message, status = 500) => ({
    ok: false,
    status,
    json: () => Promise.resolve({ error: message }),
    text: () => Promise.resolve(JSON.stringify({ error: message }))
  }),
  
  // Generate test tender data
  generateTenderData: (overrides = {}) => ({
    id: 'GEM/2024/B/12345',
    title: 'Test Tender for IT Equipment',
    description: 'This is a test tender description',
    department: 'Information Technology',
    state: 'Maharashtra',
    city: 'Mumbai',
    budget: 5000000,
    publishedDate: '2024-01-15',
    deadlineDate: '2024-02-15',
    status: 'Active',
    category: 'IT Equipment',
    ...overrides
  }),
  
  // Generate test user data
  generateUserData: (overrides = {}) => ({
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    company: 'Test Company',
    phone: '+91-9876543210',
    verified: true,
    subscription: 'basic',
    ...overrides
  })
};

// Setup and teardown for each test
beforeEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset localStorage
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  // Reset sessionStorage
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
  
  // Reset fetch mock
  fetch.mockClear();
});

afterEach(() => {
  // Clean up any timers
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

// Error boundary for tests
export class TestErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Test Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div data-testid="error-boundary">Something went wrong.</div>;
    }

    return this.props.children;
  }
}