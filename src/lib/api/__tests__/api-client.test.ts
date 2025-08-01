import { beforeEach, describe, expect, it, vi } from "vitest";

import { FetchError } from "@/lib/utils/errors";

import { apiRequest, type ApiResponse, hasError } from "../api-client";

// Mock Sentry
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

// Mock FetchError
vi.mock("@/lib/utils/errors", () => ({
  FetchError: class FetchError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "FetchError";
    }
  },
}));

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
      // No error handler provided, so no assertions needed for handler calls
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
        await new Promise(resolve => setTimeout(resolve, 10));
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

    it("should correctly narrow types for error response", () => {
      const errorResponse: ApiResponse<{ name: string }> = {
        data: undefined,
        error: {
          code: "TEST_ERROR",
          message: "Test error message",
          status: 400,
        },
      };

      if (hasError(errorResponse)) {
        expect(errorResponse.data).toBeUndefined();
        expect(errorResponse.error).toBeDefined();
        expect(errorResponse.error.message).toBe("Test error message");
        expect(errorResponse.error.code).toBe("TEST_ERROR");
        expect(errorResponse.error.status).toBe(400);
      }
    });

    it("should correctly narrow types for success response", () => {
      const successResponse: ApiResponse<{ name: string }> = {
        data: { name: "Test Data" },
        error: undefined,
      };

      if (!hasError(successResponse)) {
        expect(successResponse.data).toBeDefined();
        expect(successResponse.data.name).toBe("Test Data");
        expect(successResponse.error).toBeUndefined();
      }
    });

    it("should work with different error configurations", () => {
      const testCases = [
        {
          error: {
            message: "Minimal error",
          },
        },
        {
          error: {
            code: "ERROR_CODE",
            message: "Error with code",
          },
        },
        {
          error: {
            message: "Error with status",
            status: 404,
          },
        },
        {
          error: {
            code: "FULL_ERROR",
            message: "Complete error",
            status: 500,
          },
        },
      ];

      for (const testCase of testCases) {
        const errorResponse: ApiResponse<any> = {
          data: undefined,
          error: testCase.error,
        };

        expect(hasError(errorResponse)).toBe(true);
      }
    });
  });

  describe("Type Safety", () => {
    it("should maintain type safety for different data types", async () => {
      interface User {
        email: string;
        id: number;
        name: string;
      }

      const mockUser: User = {
        email: "john@example.com",
        id: 1,
        name: "John Doe",
      };

      const mockRequestFunction = vi.fn().mockResolvedValue(mockUser);
      const result: ApiResponse<User> = await apiRequest(mockRequestFunction);

      if (!hasError(result)) {
        expect(result.data.id).toBe(1);
        expect(result.data.name).toBe("John Doe");
        expect(result.data.email).toBe("john@example.com");
      }
    });

    it("should handle generic array types", async () => {
      const mockData = [1, 2, 3, 4, 5];
      const mockRequestFunction = vi.fn().mockResolvedValue(mockData);
      const result: ApiResponse<number[]> =
        await apiRequest(mockRequestFunction);

      if (!hasError(result)) {
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data.length).toBe(5);
        expect(result.data[0]).toBe(1);
      }
    });

    it("should handle complex nested types", async () => {
      interface ComplexData {
        metadata: {
          page: number;
          total: number;
        };
        users: { id: number; name: string }[];
      }

      const mockData: ComplexData = {
        metadata: {
          page: 1,
          total: 100,
        },
        users: [
          { id: 1, name: "User 1" },
          { id: 2, name: "User 2" },
        ],
      };

      const mockRequestFunction = vi.fn().mockResolvedValue(mockData);
      const result: ApiResponse<ComplexData> =
        await apiRequest(mockRequestFunction);

      if (!hasError(result)) {
        expect(result.data.users.length).toBe(2);
        expect(result.data.metadata.total).toBe(100);
      }
    });
  });

  describe("Error Integration", () => {
    it("should properly handle custom error types", async () => {
      class CustomError extends Error {
        constructor(
          message: string,
          public code: string
        ) {
          super(message);
          this.name = "CustomError";
        }
      }

      const customError = new CustomError(
        "Custom error message",
        "CUSTOM_CODE"
      );
      const mockRequestFunction = vi.fn().mockRejectedValue(customError);

      const result = await apiRequest(mockRequestFunction);

      expect(result.error).toEqual({
        code: "UNKNOWN_ERROR",
        message: "Custom error message",
        status: 500,
      });
    });

    it("should handle error objects with additional properties", async () => {
      const errorWithProperties = {
        code: "BAD_REQUEST",
        message: "Object error",
        status: 400,
      };

      const mockRequestFunction = vi
        .fn()
        .mockRejectedValue(errorWithProperties);
      const result = await apiRequest(mockRequestFunction);

      expect(result.error).toEqual({
        code: "UNKNOWN_ERROR",
        message: "An unknown error occurred",
        status: 500,
      });
    });
  });
});
