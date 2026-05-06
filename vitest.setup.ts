import "@testing-library/jest-dom";

import { mockFn } from "@/testing/mock-fn";
import { server } from "@/testing/server";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Geist: () => ({
    variable: "--font-sans",
  }),
  Geist_Mono: () => ({
    variable: "--font-mono",
  }),
}));

globalThis.mockFn = mockFn;

const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  if (
    typeof args[0] === "string" &&
    (args[0].includes("Cannot get CSS styles from text's parentNode") ||
      (args[0].includes("of chart should be greater than 0") &&
        args[0].includes("The width(")))
  ) {
    return;
  }
  originalConsoleError(...args);
};

const originalConsoleWarn = console.warn;
console.warn = (...args: unknown[]) => {
  if (
    typeof args[0] === "string" &&
    (args[0].includes("Cannot get CSS styles from text's parentNode") ||
      (args[0].includes("of chart should be greater than 0") &&
        args[0].includes("The width(")))
  ) {
    return;
  }
  originalConsoleWarn(...args);
};

process.env.NEXT_PUBLIC_SUPABASE_URL ??= "https://mock-supabase.local";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??=
  "mock-supabase-publishable-key";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "bypass" });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
