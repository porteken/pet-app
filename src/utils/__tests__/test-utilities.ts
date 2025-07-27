/**
 * Shared test utilities and helpers
 */
import type { ReactElement } from "react";

import { render } from "@testing-library/react";
import { vi } from "vitest";

// Custom render function for tests that might need providers in the future
export const renderWithProviders = (
  ui: ReactElement,
  options?: Record<string, unknown>
) => {
  return render(ui, {
    // wrapper: AllTheProviders, // Add providers here when needed
    ...options,
  });
};

// Common test data factories
// Using Vitest mock functions
export const createMockFunction = () => vi.fn();

// Mock implementations
export const mockReload = vi.fn();

// Test constants
export const TEST_CONSTANTS = {
  ERROR_MESSAGE: "Test Error Message",
  ERROR_TITLE: "Test Error Title",
  MODAL_CONTENT: "Test Modal Content",
  MODAL_TITLE: "Test Modal Title",
} as const;

export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
