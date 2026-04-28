import { vi } from "vitest";

type MockFunction = (...args: any[]) => any;

export function mockFn<T extends MockFunction = MockFunction>(
  implementation?: T,
) {
  return vi.fn<T>(implementation);
}
