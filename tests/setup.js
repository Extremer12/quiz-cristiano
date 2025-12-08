// Jest setup file
// This file runs before each test suite

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

// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};

// Setup DOM environment
document.body.innerHTML = '';

// Mock fetch if needed
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
    })
);

// Add custom matchers if needed
expect.extend({
    // Custom matchers can be added here
});

// Reset mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    document.body.innerHTML = '';
});
