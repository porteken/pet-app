import { vi } from "vitest";

export const createMockCookieStore = () => ({
  get: vi.fn(),
  set: vi.fn(),
});

export const mockNextHeaders = () => {
  vi.mock("next/headers", () => ({
    cookies: vi.fn(),
  }));
};

export const createMockLinearRegression = () => ({
  predict: vi.fn(),
});

export const mockSimpleLinearRegression = () => {
  vi.mock("@/lib/utils/simple-linear-regression", () => ({
    SimpleLinearRegression: vi.fn(),
  }));
};
