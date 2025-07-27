/**
 * MSW Server Setup - Configure MSW for testing environment
 * Following Bulletproof React pattern
 */

import { setupServer } from "msw/node";

import { handlers } from "./handlers";

// Setup MSW server for Node.js testing environment
export const server = setupServer(...handlers);

// Establish API mocking before all tests
export const startMockServer = () => {
  server.listen({
    onUnhandledRequest: "error",
  });
};

// Reset handlers after each test
export const resetMockServer = () => {
  server.resetHandlers();
};

// Clean up after all tests are done
export const stopMockServer = () => {
  server.close();
};
