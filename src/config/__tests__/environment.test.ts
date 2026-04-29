import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

const loadEnvironmentModule = async () => import("../environment");

const setBaseEnvironment = () => {
  process.env.NEXT_PUBLIC_E2E_TEST = "false";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
};

describe("environment", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
  });

  describe("getPublicEnvironment", () => {
    it("returns the configured publishable key when present", async () => {
      setBaseEnvironment();
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable-key";

      const { getPublicEnvironment } = await loadEnvironmentModule();

      expect(getPublicEnvironment()).toEqual({
        NEXT_PUBLIC_E2E_TEST: "false",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      });
    });

    it("throws when Supabase key is absent", async () => {
      setBaseEnvironment();

      const { getPublicEnvironment } = await loadEnvironmentModule();

      expect(() => getPublicEnvironment()).toThrow(
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      );
    });
  });
});
