// jest.setup.js
// Global setup for Jest tests

// Mock console methods
global.console = {
  log: jest.fn(),
  error: jest.fn(), 
  warn: jest.fn(),
  info: jest.fn()
};

// Add any global test utilities here