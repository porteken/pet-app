import type { mockFn } from "./mock-fn";

declare global {
  var mockFn: typeof mockFn;
}

export type GlobalMockFn = typeof mockFn;
