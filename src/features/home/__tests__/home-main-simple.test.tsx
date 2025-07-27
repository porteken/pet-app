import { describe, expect, it, vi } from "vitest";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock Mantine components
vi.mock("@mantine/core", () => ({
  Button: vi.fn(() => ""),
  Loader: vi.fn(() => ""),
  Select: vi.fn(() => ""),
}));

// Mock map component
vi.mock("../map-component", () => ({
  default: vi.fn(() => ""),
}));

// Mock modal component
vi.mock("@/features/modal", () => ({
  default: vi.fn(() => ""),
}));

import Home from "../home-main";

describe("Home", () => {
  it("should be importable", () => {
    expect(Home).toBeDefined();
  });

  it("should be a function component", () => {
    expect(typeof Home).toBe("function");
  });

  it("should have correct display name or be anonymous function", () => {
    expect(Home.name === "Home" || Home.name === "").toBe(true);
  });
});
