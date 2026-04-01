import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

const loadEnvironmentModule = async () => import("../environment");

const setBaseEnvironment = () => {
  process.env.NEXT_PUBLIC_E2E_TEST = "false";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
};

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

describe("getPublicEnvironment", () => {
  it("returns the configured anon key when present", async () => {
    setBaseEnvironment();
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

    const { getPublicEnvironment } = await loadEnvironmentModule();

    expect(getPublicEnvironment()).toEqual({
      NEXT_PUBLIC_E2E_TEST: "false",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    });
  });

  it("falls back to the publishable key when the anon key is absent", async () => {
    setBaseEnvironment();
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY =
      "publishable-key";

    const { getPublicEnvironment } = await loadEnvironmentModule();

    expect(getPublicEnvironment()).toEqual({
      NEXT_PUBLIC_E2E_TEST: "false",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "publishable-key",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    });
  });

  it("throws when neither Supabase key is configured", async () => {
    setBaseEnvironment();

    const { getPublicEnvironment } = await loadEnvironmentModule();

    expect(() => getPublicEnvironment()).toThrow(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY: Required. Set NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY.",
    );
  });
});
