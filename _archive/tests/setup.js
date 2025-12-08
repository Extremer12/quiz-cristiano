// Jest setup file
// Global test configuration and mocks

// Polyfills para Node.js
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore specific console methods
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Mock environment variables for testing
process.env.NODE_ENV = "test";
process.env.PAYPAL_CLIENT_ID = "test-client-id";
process.env.PAYPAL_CLIENT_SECRET = "test-client-secret";
process.env.PAYPAL_WEBHOOK_ID = "test-webhook-id";

// Global test utilities
global.mockPayPalEvent = (eventType, resource = {}) => {
  return {
    id: `WH-${Date.now()}`,
    event_type: eventType,
    resource: {
      id: `RESOURCE-${Date.now()}`,
      ...resource,
    },
    create_time: new Date().toISOString(),
  };
};

global.mockPayPalHeaders = () => {
  return {
    "paypal-transmission-id": "test-transmission-id",
    "paypal-cert-id": "test-cert-id",
    "paypal-transmission-sig": "test-signature",
    "paypal-transmission-time": new Date().toISOString(),
  };
};
