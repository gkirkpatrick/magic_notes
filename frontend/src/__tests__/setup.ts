import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll } from 'vitest';
import { server } from './mocks/server';
import { resetMockData } from './mocks/handlers';

// Start MSW server before all tests
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'warn',
  });
});

// Reset handlers and mock data after each test
afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetMockData();
});

// Clean up MSW server after all tests
afterAll(() => {
  server.close();
});
