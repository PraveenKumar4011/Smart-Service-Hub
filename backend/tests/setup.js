// Test setup file
import { jest } from '@jest/globals';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Mock console.log/error to avoid noise during tests unless needed
const originalConsole = { ...console };

beforeAll(() => {
  global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
  };
});

afterAll(() => {
  global.console = originalConsole;
});

// Clean up environment variables
beforeEach(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.PORT = '0'; // Use random port for tests
  process.env.DATABASE_FILE = ':memory:'; // Use in-memory database for tests
});

afterEach(() => {
  // Clear all timers
  jest.clearAllTimers();
  
  // Clear all mocks
  jest.clearAllMocks();
});