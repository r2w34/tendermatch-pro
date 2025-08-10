module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    'backend/**/*.{js,jsx}',
    '!src/index.js',
    '!src/config/*.js',
    '!backend/config/*.js',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/config/setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@backend/(.*)$': '<rootDir>/backend/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(axios|@testing-library)/)'
  ],
  clearMocks: true,
  restoreMocks: true
};