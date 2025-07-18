// src/setupTests.ts

// Load MSW server
import { server } from './mocks/server'; // Adjust the path if needed

// Establish API mocking before all tests
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up once the tests are done.
afterAll(() => server.close());

// Optional: Import custom matchers for jest-dom (recommended)
import '@testing-library/jest-dom';
