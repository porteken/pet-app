import { describe, expect, it } from "vitest";

import {
  clearAllMocks,
  setupActionsTest,
  setupApiClientTest,
  setupApiServerTest,
} from "@/testing/test-utilities";

describe("Test Utilities", () => {
  describe("setupApiClientTest", () => {
    it("should setup mocks for API client tests", async () => {
      const { mockSupabaseClient, mockValidation } = await setupApiClientTest();

      expect(mockSupabaseClient).toBeDefined();
      expect(mockValidation).toBeDefined();
      expect(mockSupabaseClient.from).toBeDefined();
      expect(typeof mockSupabaseClient.from).toBe("function");
    });
  });

  describe("setupApiServerTest", () => {
    it("should setup mocks for API server tests", async () => {
      const { mockCookieStore, mockLinearRegression, mockSupabaseClient } =
        await setupApiServerTest();

      expect(mockCookieStore).toBeDefined();
      expect(mockLinearRegression).toBeDefined();
      expect(mockSupabaseClient).toBeDefined();
    });

    it("should create proper cookie store mock", async () => {
      const { mockCookieStore } = await setupApiServerTest();

      expect(mockCookieStore.get).toBeDefined();
      expect(mockCookieStore.set).toBeDefined();
      expect(typeof mockCookieStore.get).toBe("function");
      expect(typeof mockCookieStore.set).toBe("function");
    });
  });

  describe("setupActionsTest", () => {
    it("should setup mocks for Next.js actions", async () => {
      const { mockCookieStore } = await setupActionsTest();

      expect(mockCookieStore).toBeDefined();
      expect(mockCookieStore.get).toBeDefined();
      expect(mockCookieStore.set).toBeDefined();
    });
  });

  describe("clearAllMocks", () => {
    it("should not throw when called", () => {
      expect(() => clearAllMocks()).not.toThrow();
    });
  });
});
