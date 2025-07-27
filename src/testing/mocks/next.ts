import { vi } from "vitest";

/**
 * Mock Next.js headers for testing
 */
export const createMockCookieStore = () => ({
  get: vi.fn(),
  set: vi.fn(),
});

/**
 * Setup mock for Next.js headers module
 */
export const mockNextHeaders = () => {
  vi.mock("next/headers", () => ({
    cookies: vi.fn(),
  }));
};

/**
 * Mock SimpleLinearRegression for testing
 */
export const createMockLinearRegression = () => ({
  predict: vi.fn(),
});

/**
 * Setup mock for SimpleLinearRegression module
 */
export const mockSimpleLinearRegression = () => {
  vi.mock("@/lib/utils/simple-linear-regression", () => ({
    SimpleLinearRegression: vi.fn(),
  }));
};
