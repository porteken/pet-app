import { vi } from "vitest";

type MockFunction = (...args: unknown[]) => unknown;

export function mockFn<T extends MockFunction = MockFunction>(
  implementation?: T,
) {
  return vi.fn<T>(implementation);
}
