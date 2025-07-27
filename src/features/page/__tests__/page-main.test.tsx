import { describe, expect, it, vi } from "vitest";

// Mock Supabase
vi.mock("@/lib/config/supabase/client", () => ({
  default: {},
}));

// Mock router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// Mock actions
vi.mock("@/app/actions", () => ({
  setGraphMeasure: vi.fn(),
}));

// Mock API functions
vi.mock("@/lib/api/fetch-client", () => ({
  FetchReferenceGraphData: vi.fn(),
  FetchTrendGraphData: vi.fn(),
}));

import PageMain from "../page-main";

describe("PageMain", () => {
  it("should be importable", () => {
    expect(PageMain).toBeDefined();
  });

  it("should be a function component", () => {
    expect(typeof PageMain).toBe("function");
  });

  it("should have correct display name or be anonymous function", () => {
    expect(PageMain.name === "Main" || PageMain.name === "").toBe(true);
  });
});
