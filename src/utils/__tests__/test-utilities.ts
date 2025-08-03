import type { ReactElement } from "react";

import { render } from "@testing-library/react";
import { vi } from "vitest";

export const renderWithProviders = (
  ui: ReactElement,
  options?: Record<string, unknown>
) => {
  return render(ui, {
    ...options,
  });
};

export const createMockFunction = () => vi.fn();

export const mockReload = vi.fn();

export const TEST_CONSTANTS = {
  ERROR_MESSAGE: "Test Error Message",
  ERROR_TITLE: "Test Error Title",
  MODAL_CONTENT: "Test Modal Content",
  MODAL_TITLE: "Test Modal Title",
} as const;

export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
