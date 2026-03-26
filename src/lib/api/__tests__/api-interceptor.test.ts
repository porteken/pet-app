import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { server } from "@/testing/server";

import {
  apiRequest,
  apiRequestWithRetry,
  handleApiResponse,
} from "../api-interceptor";

vi.mock("@/lib/utils/errors", () => ({
  createError: vi.fn(),
  NetworkError: vi.fn(
    class MockNetworkError extends Error {
      context: unknown;
      originalError: unknown;
      statusCode: number;

      constructor(
        message: string,
        statusCode: number,
        originalError?: unknown,
        context?: unknown,
      ) {
        super(message);
        this.name = "NetworkError";
        this.statusCode = statusCode;
        this.originalError = originalError;
        this.context = context;
      }
    },
  ),
}));

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

beforeAll(() => {
  server.close();
});

afterAll(() => {
  server.listen({ onUnhandledRequest: "bypass" });
});

describe("handleApiResponse", () => {
  let mockCreateError: any;
  let MockedNetworkError: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { createError, NetworkError } = await import("@/lib/utils/errors");
    mockCreateError = vi.mocked(createError);
    MockedNetworkError = vi.mocked(NetworkError);
  });

  it("returns parsed JSON for successful responses", async () => {
    const mockData = { data: [1, 2, 3], message: "success" };
    const mockResponse = {
      json: vi.fn().mockResolvedValue(mockData),
      ok: true,
      url: "https://api.example.com/test",
    };

    const result = await handleApiResponse(mockResponse as any);

    expect(result).toEqual(mockData);
    expect(mockResponse.json).toHaveBeenCalledWith();
  });

  it("throws error for failed responses", async () => {
    const errorMessage = "Not found";
    const mockResponse = {
      json: vi.fn().mockResolvedValue({ message: errorMessage }),
      ok: false,
      status: 404,
      url: "https://api.example.com/test",
    };

    mockCreateError.mockReturnValue(new Error("Custom error"));

    await expect(handleApiResponse(mockResponse as any)).rejects.toThrow();

    expect(mockCreateError).toHaveBeenCalledWith(
      errorMessage,
      404,
      undefined,
      undefined,
      {
        url: "https://api.example.com/test",
      },
    );
  });

  it("includes context in error creation", async () => {
    const context = { action: "fetch", userId: 123 };
    const mockResponse = {
      json: vi.fn().mockResolvedValue({ error: "Server error" }),
      ok: false,
      status: 500,
      url: "https://api.example.com/test",
    };

    mockCreateError.mockReturnValue(new Error("Custom error"));

    await expect(
      handleApiResponse(mockResponse as any, context),
    ).rejects.toThrow();

    expect(mockCreateError).toHaveBeenCalledWith(
      "Server error",
      500,
      undefined,
      undefined,
      {
        ...context,
        url: "https://api.example.com/test",
      },
    );
  });

  it("handles JSON parsing errors", async () => {
    const mockResponse = {
      json: vi.fn().mockRejectedValue(new Error("Invalid JSON")),
      ok: true,
      url: "https://api.example.com/test",
    };

    await expect(handleApiResponse(mockResponse as any)).rejects.toThrow();

    expect(MockedNetworkError).toHaveBeenCalledWith(
      "Failed to parse server response",
      500,
      expect.any(Error),
      undefined,
    );
  });

  it("extracts error message from response.message", async () => {
    const errorMessage = "Validation failed";
    const mockResponse = {
      json: vi.fn().mockResolvedValue({ message: errorMessage }),
      ok: false,
      status: 400,
      url: "https://api.example.com/test",
    };

    mockCreateError.mockReturnValue(new Error("Custom error"));

    await expect(handleApiResponse(mockResponse as any)).rejects.toThrow();

    expect(mockCreateError).toHaveBeenCalledWith(
      errorMessage,
      400,
      undefined,
      undefined,
      expect.objectContaining({ url: "https://api.example.com/test" }),
    );
  });

  it("extracts error message from response.error", async () => {
    const errorMessage = "Authentication failed";
    const mockResponse = {
      json: vi.fn().mockResolvedValue({ error: errorMessage }),
      ok: false,
      status: 401,
      url: "https://api.example.com/test",
    };

    mockCreateError.mockReturnValue(new Error("Custom error"));

    await expect(handleApiResponse(mockResponse as any)).rejects.toThrow();

    expect(mockCreateError).toHaveBeenCalledWith(
      errorMessage,
      401,
      undefined,
      undefined,
      expect.objectContaining({ url: "https://api.example.com/test" }),
    );
  });

  it("extracts error message from response.detail", async () => {
    const errorMessage = "Resource not found";
    const mockResponse = {
      json: vi.fn().mockResolvedValue({ detail: errorMessage }),
      ok: false,
      status: 404,
      url: "https://api.example.com/test",
    };

    mockCreateError.mockReturnValue(new Error("Custom error"));

    await expect(handleApiResponse(mockResponse as any)).rejects.toThrow();

    expect(mockCreateError).toHaveBeenCalledWith(
      errorMessage,
      404,
      undefined,
      undefined,
      expect.objectContaining({ url: "https://api.example.com/test" }),
    );
  });

  it("handles string error responses", async () => {
    const errorMessage = "Server error";
    const mockResponse = {
      json: vi.fn().mockResolvedValue(errorMessage),
      ok: false,
      status: 500,
      url: "https://api.example.com/test",
    };

    mockCreateError.mockReturnValue(new Error("Custom error"));

    await expect(handleApiResponse(mockResponse as any)).rejects.toThrow();

    expect(mockCreateError).toHaveBeenCalledWith(
      errorMessage,
      500,
      undefined,
      undefined,
      expect.objectContaining({ url: "https://api.example.com/test" }),
    );
  });

  it("handle Validation failed", async () => {
    const mockResponse = {
      json: vi.fn().mockResolvedValue({ unknown: "format" }),
      ok: false,
      status: 422,
      url: "https://api.example.com/test",
    };

    mockCreateError.mockReturnValue(new Error("Custom error"));

    await expect(handleApiResponse(mockResponse as any)).rejects.toThrow();

    expect(mockCreateError).toHaveBeenCalledWith(
      "Validation failed. Please check your input.",
      422,
      undefined,
      undefined,
      expect.objectContaining({ url: "https://api.example.com/test" }),
    );
  });
  it("uses default error message for unknown error format", async () => {
    const mockResponse = {
      json: vi.fn().mockResolvedValue({ unknown: "format" }),
      ok: false,
      status: 654,
      url: "https://api.example.com/test",
    };

    mockCreateError.mockReturnValue(new Error("Custom error"));

    await expect(handleApiResponse(mockResponse as any)).rejects.toThrow();

    expect(mockCreateError).toHaveBeenCalledWith(
      `Request failed with status 654`,
      654,
      undefined,
      undefined,
      expect.objectContaining({ url: "https://api.example.com/test" }),
    );
  });
  it("uses service error when service is unavailable", async () => {
    const mockResponse = {
      json: vi.fn().mockResolvedValue({ unknown: "format" }),
      ok: false,
      status: 503,
      url: "https://api.example.com/test",
    };

    mockCreateError.mockReturnValue(new Error("Custom error"));

    await expect(handleApiResponse(mockResponse as any)).rejects.toThrow();

    expect(mockCreateError).toHaveBeenCalledWith(
      `Service unavailable. Please try again later.`,
      503,
      undefined,
      undefined,
      expect.objectContaining({ url: "https://api.example.com/test" }),
    );
  });
  it("uses gateway error when gateway is bad", async () => {
    const mockResponse = {
      json: vi.fn().mockResolvedValue({ unknown: "format" }),
      ok: false,
      status: 502,
      url: "https://api.example.com/test",
    };

    mockCreateError.mockReturnValue(new Error("Custom error"));

    await expect(handleApiResponse(mockResponse as any)).rejects.toThrow();

    expect(mockCreateError).toHaveBeenCalledWith(
      `Bad gateway. The server is temporarily unavailable.`,
      502,
      undefined,
      undefined,
      expect.objectContaining({ url: "https://api.example.com/test" }),
    );
  });
  it("uses internal error when Internal Service error", async () => {
    const mockResponse = {
      json: vi.fn().mockResolvedValue({ unknown: "format" }),
      ok: false,
      status: 500,
      url: "https://api.example.com/test",
    };

    mockCreateError.mockReturnValue(new Error("Custom error"));

    await expect(handleApiResponse(mockResponse as any)).rejects.toThrow();

    expect(mockCreateError).toHaveBeenCalledWith(
      `Internal server error. Please try again later.`,
      500,
      undefined,
      undefined,
      expect.objectContaining({ url: "https://api.example.com/test" }),
    );
  });
  it("uses not found error when not found", async () => {
    const mockResponse = {
      json: vi.fn().mockResolvedValue({ unknown: "format" }),
      ok: false,
      status: 404,
      url: "https://api.example.com/test",
    };

    mockCreateError.mockReturnValue(new Error("Custom error"));

    await expect(handleApiResponse(mockResponse as any)).rejects.toThrow();

    expect(mockCreateError).toHaveBeenCalledWith(
      `The requested resource was not found.`,
      404,
      undefined,
      undefined,
      expect.objectContaining({ url: "https://api.example.com/test" }),
    );
  });
  it("uses access denied error when access denied", async () => {
    const mockResponse = {
      json: vi.fn().mockResolvedValue({ unknown: "format" }),
      ok: false,
      status: 403,
      url: "https://api.example.com/test",
    };

    mockCreateError.mockReturnValue(new Error("Custom error"));

    await expect(handleApiResponse(mockResponse as any)).rejects.toThrow();

    expect(mockCreateError).toHaveBeenCalledWith(
      `Access denied. You don't have permission to perform this action.`,
      403,
      undefined,
      undefined,
      expect.objectContaining({ url: "https://api.example.com/test" }),
    );
  });
  it("uses authentication required error when not authenticated", async () => {
    const mockResponse = {
      json: vi.fn().mockResolvedValue({ unknown: "format" }),
      ok: false,
      status: 401,
      url: "https://api.example.com/test",
    };

    mockCreateError.mockReturnValue(new Error("Custom error"));

    await expect(handleApiResponse(mockResponse as any)).rejects.toThrow();

    expect(mockCreateError).toHaveBeenCalledWith(
      `Authentication required. Please log in.`,
      401,
      undefined,
      undefined,
      expect.objectContaining({ url: "https://api.example.com/test" }),
    );
  });
  it("uses invalid request error when bad request", async () => {
    const mockResponse = {
      json: vi.fn().mockResolvedValue({ unknown: "format" }),
      ok: false,
      status: 400,
      url: "https://api.example.com/test",
    };

    mockCreateError.mockReturnValue(new Error("Custom error"));

    await expect(handleApiResponse(mockResponse as any)).rejects.toThrow();

    expect(mockCreateError).toHaveBeenCalledWith(
      `Invalid request. Please check your input.`,
      400,
      undefined,
      undefined,
      expect.objectContaining({ url: "https://api.example.com/test" }),
    );
  });

  it("uses default error message when JSON parsing fails", async () => {
    const mockResponse = {
      json: vi.fn().mockRejectedValue(new Error("Invalid JSON")),
      ok: false,
      status: 429,
      url: "https://api.example.com/test",
    };

    mockCreateError.mockReturnValue(new Error("Custom error"));

    await expect(handleApiResponse(mockResponse as any)).rejects.toThrow();

    expect(mockCreateError).toHaveBeenCalledWith(
      "Too many requests. Please try again later.",
      429,
      undefined,
      undefined,
      expect.objectContaining({ url: "https://api.example.com/test" }),
    );
  });
});

describe("apiRequest", () => {
  let mockCreateError: any;
  let MockedNetworkError: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { createError, NetworkError } = await import("@/lib/utils/errors");
    mockCreateError = vi.mocked(createError);
    MockedNetworkError = vi.mocked(NetworkError);
  });

  it("makes successful API requests", async () => {
    const mockData = { result: "success" };
    const mockResponse = {
      json: vi.fn().mockResolvedValue(mockData),
      ok: true,
      url: "https://api.example.com/test",
    };

    mockFetch.mockResolvedValue(mockResponse);

    const result = await apiRequest("https://api.example.com/test");

    expect(result).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.example.com/test",
      expect.objectContaining({
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
  });

  it("includes custom headers", async () => {
    const mockData = { result: "success" };
    const mockResponse = {
      json: vi.fn().mockResolvedValue(mockData),
      ok: true,
      url: "https://api.example.com/test",
    };

    mockFetch.mockResolvedValue(mockResponse);

    const options = {
      headers: {
        Authorization: "Bearer token123",
        "X-Custom-Header": "custom-value",
      },
    };

    await apiRequest("https://api.example.com/test", options);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.example.com/test",
      expect.objectContaining({
        headers: {
          Authorization: "Bearer token123",
          "Content-Type": "application/json",
          "X-Custom-Header": "custom-value",
        },
      }),
    );
  });

  it("includes method in context for error handling", async () => {
    const mockResponse = {
      json: vi.fn().mockResolvedValue({ message: "Bad request" }),
      ok: false,
      status: 400,
      url: "https://api.example.com/test",
    };

    mockFetch.mockResolvedValue(mockResponse);
    mockCreateError.mockReturnValue(new Error("Custom error"));

    const context = { userId: 123 };

    await expect(
      apiRequest("https://api.example.com/test", { method: "POST" }, context),
    ).rejects.toThrow();

    expect(mockCreateError).toHaveBeenCalledWith(
      "Bad request",
      400,
      undefined,
      undefined,
      expect.objectContaining({
        method: "POST",
        url: "https://api.example.com/test",
        userId: 123,
      }),
    );
  });

  it("handles network errors", async () => {
    const networkError = new TypeError("fetch failed");
    mockFetch.mockRejectedValue(networkError);

    await expect(apiRequest("https://api.example.com/test")).rejects.toThrow();

    expect(MockedNetworkError).toHaveBeenCalledWith(
      "Network connection failed",
      0,
      networkError,
      undefined,
    );
  });

  it("re-throws custom errors", async () => {
    const customError = new Error("Custom error");
    mockFetch.mockRejectedValue(customError);

    await expect(apiRequest("https://api.example.com/test")).rejects.toThrow(
      customError,
    );
  });
});

describe("apiRequestWithRetry", () => {
  let mockCreateError: any;
  let MockedNetworkError: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    const { createError, NetworkError } = await import("@/lib/utils/errors");
    mockCreateError = vi.mocked(createError);
    MockedNetworkError = vi.mocked(NetworkError);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("succeeds on first attempt", async () => {
    const mockData = { result: "success" };
    const mockResponse = {
      json: vi.fn().mockResolvedValue(mockData),
      ok: true,
      url: "https://api.example.com/test",
    };

    mockFetch.mockResolvedValue(mockResponse);

    const result = await apiRequestWithRetry("https://api.example.com/test");

    expect(result).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("retries on server errors", async () => {
    const mockData = { result: "success" };
    const successResponse = {
      json: vi.fn().mockResolvedValue(mockData),
      ok: true,
      url: "https://api.example.com/test",
    };

    const errorResponse = {
      json: vi.fn().mockResolvedValue({ message: "Server error" }),
      ok: false,
      status: 500,
      url: "https://api.example.com/test",
    };

    mockFetch
      .mockResolvedValueOnce(errorResponse)
      .mockResolvedValueOnce(errorResponse)
      .mockResolvedValueOnce(successResponse);

    const mockError = new Error("Server error");
    (mockError as any).statusCode = 500;
    mockCreateError.mockReturnValue(mockError);

    const promise = apiRequestWithRetry("https://api.example.com/test", {}, 3);

    await vi.runAllTimersAsync();

    const result = await promise;

    expect(result).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("does not retry client errors (except 429)", async () => {
    const errorResponse = {
      json: vi.fn().mockResolvedValue({ message: "Bad request" }),
      ok: false,
      status: 400,
      url: "https://api.example.com/test",
    };

    mockFetch.mockResolvedValue(errorResponse);

    const mockError = Object.create(MockedNetworkError.prototype);
    mockError.message = "Bad request";
    mockError.statusCode = 400;
    mockError.name = "NetworkError";
    mockCreateError.mockReturnValue(mockError);

    await expect(
      apiRequestWithRetry("https://api.example.com/test"),
    ).rejects.toThrow();

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("retries on 429 (rate limiting)", async () => {
    const mockData = { result: "success" };
    const successResponse = {
      json: vi.fn().mockResolvedValue(mockData),
      ok: true,
      url: "https://api.example.com/test",
    };

    const rateLimitResponse = {
      json: vi.fn().mockResolvedValue({ message: "Rate limited" }),
      ok: false,
      status: 429,
      url: "https://api.example.com/test",
    };

    mockFetch
      .mockResolvedValueOnce(rateLimitResponse)
      .mockResolvedValueOnce(successResponse);

    const mockError = new Error("Rate limited");
    (mockError as any).statusCode = 429;
    mockCreateError.mockReturnValue(mockError);

    const promise = apiRequestWithRetry("https://api.example.com/test");

    await vi.runAllTimersAsync();

    const result = await promise;

    expect(result).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
