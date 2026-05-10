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

process.env.NEXT_PUBLIC_E2E_TEST ??= "false";
process.env.PGDATABASE ??= "pet";
process.env.PGHOST ??= "localhost";
process.env.PGPASSWORD ??= "postgres";
process.env.PGPORT ??= "5432";
process.env.PGSSLMODE ??= "disable";
process.env.PGUSER ??= "postgres";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "bypass" });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

if (typeof globalThis !== "undefined") {
  vi.spyOn(
    globalThis.HTMLElement.prototype,
    "hasPointerCapture",
  ).mockImplementation(vi.fn<() => boolean>());
  vi.spyOn(
    globalThis.HTMLElement.prototype,
    "releasePointerCapture",
  ).mockImplementation(vi.fn<() => void>());
  vi.spyOn(
    globalThis.HTMLElement.prototype,
    "setPointerCapture",
  ).mockImplementation(vi.fn<() => void>());
  vi.spyOn(
    globalThis.HTMLElement.prototype,
    "scrollIntoView",
  ).mockImplementation(vi.fn<() => void>());
}
