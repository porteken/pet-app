import { beforeEach, describe, expect, it, vi } from "vitest";

import { FetchError } from "@/lib/utils/errors";

import { apiRequest, type ApiResponse, hasError } from "../api-client";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

vi.mock("@/lib/utils/errors", () => ({
  FetchError: class MockFetchError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "FetchError";
    }
  },
}));

const createDelay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

describe("api-client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("apiRequest", () => {
    it("should return successful response when request succeeds", async () => {
      const mockData = { id: 1, name: "Test Data" };
      const mockRequestFunction = vi.fn().mockResolvedValue(mockData);

      const result = await apiRequest(mockRequestFunction);

      expect(result).toEqual({
        data: mockData,
        error: undefined,
      });
      expect(mockRequestFunction).toHaveBeenCalledTimes(1);
    });

    it("should return error response when request fails with Error", async () => {
      const mockError = new Error("Test error message");
      const mockRequestFunction = vi.fn().mockRejectedValue(mockError);

      const result = await apiRequest(mockRequestFunction);

      expect(result).toEqual({
        data: undefined,
        error: {
          code: "UNKNOWN_ERROR",
          message: "Test error message",
          status: 500,
        },
      });
      expect(mockRequestFunction).toHaveBeenCalledTimes(1);
    });

    it("should return error response when request fails with FetchError", async () => {
      const mockError = new FetchError("Fetch failed");
      const mockRequestFunction = vi.fn().mockRejectedValue(mockError);

      const result = await apiRequest(mockRequestFunction);

      expect(result).toEqual({
        data: undefined,
        error: {
          code: "FETCH_ERROR",
          message: "Fetch failed",
          status: 500,
        },
      });
      expect(mockRequestFunction).toHaveBeenCalledTimes(1);
    });

    it("should return error response when request fails with non-Error object", async () => {
      const mockError = "String error";
      const mockRequestFunction = vi.fn().mockRejectedValue(mockError);

      const result = await apiRequest(mockRequestFunction);

      expect(result).toEqual({
        data: undefined,
        error: {
          code: "UNKNOWN_ERROR",
          message: "An unknown error occurred",
          status: 500,
        },
      });
      expect(mockRequestFunction).toHaveBeenCalledTimes(1);
    });

    it("should call error handler when provided and error is an Error instance", async () => {
      const mockError = new Error("Test error");
      const mockRequestFunction = vi.fn().mockRejectedValue(mockError);
      const mockErrorHandler = vi.fn();

      await apiRequest(mockRequestFunction, mockErrorHandler);

      expect(mockErrorHandler).toHaveBeenCalledWith(mockError);
      expect(mockErrorHandler).toHaveBeenCalledTimes(1);
    });

    it("should call error handler when provided and error is a FetchError instance", async () => {
      const mockError = new FetchError("Fetch error");
      const mockRequestFunction = vi.fn().mockRejectedValue(mockError);
      const mockErrorHandler = vi.fn();

      await apiRequest(mockRequestFunction, mockErrorHandler);

      expect(mockErrorHandler).toHaveBeenCalledWith(mockError);
      expect(mockErrorHandler).toHaveBeenCalledTimes(1);
    });

    it("should not call error handler when error is not an Error instance", async () => {
      const mockError = "String error";
      const mockRequestFunction = vi.fn().mockRejectedValue(mockError);
      const mockErrorHandler = vi.fn();

      await apiRequest(mockRequestFunction, mockErrorHandler);

      expect(mockErrorHandler).not.toHaveBeenCalled();
    });

    it("should not call error handler when not provided", async () => {
      const mockError = new Error("Test error");
      const mockRequestFunction = vi.fn().mockRejectedValue(mockError);

      const result = await apiRequest(mockRequestFunction);

      expect(result.error).toBeDefined();
    });

    it("should handle successful request with different data types", async () => {
      const testCases = [
        { data: "string data" },
        { data: 12_345 },
        { data: true },
        { data: [] },
        { data: {} },
        { data: undefined },
        { data: undefined },
      ];

      for (const testCase of testCases) {
        const mockRequestFunction = vi.fn().mockResolvedValue(testCase.data);
        const result = await apiRequest(mockRequestFunction);

        expect(result).toEqual({
          data: testCase.data,
          error: undefined,
        });
      }
    });

    it("should handle multiple concurrent requests", async () => {
      const mockData1 = { id: 1 };
      const mockData2 = { id: 2 };
      const mockRequestFunction1 = vi.fn().mockResolvedValue(mockData1);
      const mockRequestFunction2 = vi.fn().mockResolvedValue(mockData2);

      const [result1, result2] = await Promise.all([
        apiRequest(mockRequestFunction1),
        apiRequest(mockRequestFunction2),
      ]);

      expect(result1.data).toEqual(mockData1);
      expect(result2.data).toEqual(mockData2);
      expect(result1.error).toBeUndefined();
      expect(result2.error).toBeUndefined();
    });

    it("should handle async request function correctly", async () => {
      const mockData = { async: true };
      const mockRequestFunction = vi.fn(async () => {
        await createDelay(10);
        return mockData;
      });

      const result = await apiRequest(mockRequestFunction);

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeUndefined();
    });
  });

  describe("hasError", () => {
    it("should return true for error response", () => {
      const errorResponse: ApiResponse<any> = {
        data: undefined,
        error: {
          code: "TEST_ERROR",
          message: "Test error message",
          status: 400,
        },
      };

      expect(hasError(errorResponse)).toBe(true);
    });

    it("should return false for successful response", () => {
      const successResponse: ApiResponse<any> = {
        data: { id: 1, name: "Test" },
        error: undefined,
      };

      expect(hasError(successResponse)).toBe(false);
    });
  });
});
