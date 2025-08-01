import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getTrendGraphQueryOptions,
  invalidateTrendGraphData,
  prefetchTrendGraphData,
  queryClient,
  queryKeys,
} from "../query-client";

// Mock the fetch client
vi.mock("../fetch-client", () => ({
  FetchTrendGraphData: vi.fn(),
}));

// Helper function to get the mocked function
async function getMockFetchTrendGraphData() {
  const fetchClient = await import("../fetch-client");
  return vi.mocked(fetchClient.FetchTrendGraphData);
}

describe("queryClient", () => {
  it("is properly configured", () => {
    expect(queryClient).toBeDefined();
    expect(queryClient.getDefaultOptions().queries?.retry).toBe(1);
    expect(queryClient.getDefaultOptions().queries?.staleTime).toBe(300_000); // 5 minutes
  });

  it("has correct default options", () => {
    const defaultOptions = queryClient.getDefaultOptions();

    expect(defaultOptions.queries?.retry).toBe(1);
    expect(defaultOptions.queries?.staleTime).toBe(1000 * 60 * 5); // 5 minutes
  });
});

describe("queryKeys", () => {
  it("generates correct trend graph query key", () => {
    const locationId = 123;
    const option = "temperature";

    const key = queryKeys.trendGraph(locationId, option);

    expect(key).toEqual(["trend-graph", locationId, option]);
  });

  it("generates different keys for different parameters", () => {
    const key1 = queryKeys.trendGraph(123, "temperature");
    const key2 = queryKeys.trendGraph(456, "temperature");
    const key3 = queryKeys.trendGraph(123, "humidity");

    expect(key1).not.toEqual(key2);
    expect(key1).not.toEqual(key3);
    expect(key2).not.toEqual(key3);
  });

  it("generates consistent keys for same parameters", () => {
    const key1 = queryKeys.trendGraph(123, "temperature");
    const key2 = queryKeys.trendGraph(123, "temperature");

    expect(key1).toEqual(key2);
  });

  it("handles different data types correctly", () => {
    const key1 = queryKeys.trendGraph(0, "temperature");
    const key2 = queryKeys.trendGraph(-1, "humidity");
    const key3 = queryKeys.trendGraph(999_999, "pressure");

    expect(key1).toEqual(["trend-graph", 0, "temperature"]);
    expect(key2).toEqual(["trend-graph", -1, "humidity"]);
    expect(key3).toEqual(["trend-graph", 999_999, "pressure"]);
  });
});

describe("getTrendGraphQueryOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns correct query options", () => {
    const locationId = 123;
    const option = "temperature";

    const queryOptions = getTrendGraphQueryOptions(locationId, option);

    expect(queryOptions).toHaveProperty("queryFn");
    expect(queryOptions).toHaveProperty("queryKey");
    expect(queryOptions.queryKey).toEqual(["trend-graph", locationId, option]);
  });

  it("query function calls FetchTrendGraphData with correct parameters", async () => {
    const locationId = 456;
    const option = "humidity";
    const mockData = {
      trendline_pets: [1, 2, 3],
      year_pets: [10, 20, 30],
      years: [2021, 2022, 2023],
    };

    const mockFetchTrendGraphData = await getMockFetchTrendGraphData();
    mockFetchTrendGraphData.mockResolvedValue(mockData);

    const queryOptions = getTrendGraphQueryOptions(locationId, option);
    const result = await queryOptions.queryFn();

    expect(mockFetchTrendGraphData).toHaveBeenCalledWith(option, locationId);
    expect(result).toEqual(mockData);
  });

  it("query function handles different parameter types", async () => {
    const testCases = [
      { locationId: 0, option: "temperature" },
      { locationId: 999, option: "humidity" },
      { locationId: -1, option: "pressure" },
    ];

    const mockFetchTrendGraphData = await getMockFetchTrendGraphData();

    for (const { locationId, option } of testCases) {
      mockFetchTrendGraphData.mockClear();
      mockFetchTrendGraphData.mockResolvedValue({
        trendline_pets: [1, 2, 3],
        year_pets: [10, 20, 30],
        years: [2021, 2022, 2023],
      });

      const queryOptions = getTrendGraphQueryOptions(locationId, option);
      await queryOptions.queryFn();

      expect(mockFetchTrendGraphData).toHaveBeenCalledWith(option, locationId);
    }
  });

  it("query function propagates errors from FetchTrendGraphData", async () => {
    const locationId = 123;
    const option = "temperature";
    const error = new Error("Fetch failed");

    const mockFetchTrendGraphData = await getMockFetchTrendGraphData();
    mockFetchTrendGraphData.mockRejectedValue(error);

    const queryOptions = getTrendGraphQueryOptions(locationId, option);

    await expect(queryOptions.queryFn()).rejects.toThrow("Fetch failed");
  });
});

describe("prefetchTrendGraphData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear any existing queries
    queryClient.clear();
  });

  it("calls queryClient.prefetchQuery with correct options", () => {
    const prefetchSpy = vi
      .spyOn(queryClient, "prefetchQuery")
      .mockResolvedValue();

    const locationId = 123;
    const option = "temperature";

    prefetchTrendGraphData(locationId, option);

    expect(prefetchSpy).toHaveBeenCalledWith({
      queryFn: expect.any(Function),
      queryKey: ["trend-graph", locationId, option],
    });
  });

  it("returns the promise from queryClient.prefetchQuery", () => {
    const mockPromise = Promise.resolve();
    const prefetchSpy = vi
      .spyOn(queryClient, "prefetchQuery")
      .mockReturnValue(mockPromise);

    const result = prefetchTrendGraphData(123, "temperature");

    expect(result).toBe(mockPromise);
    expect(prefetchSpy).toHaveBeenCalled();
  });

  it("handles prefetch errors gracefully", async () => {
    const error = new Error("Prefetch failed");
    vi.spyOn(queryClient, "prefetchQuery").mockRejectedValue(error);

    await expect(prefetchTrendGraphData(123, "temperature")).rejects.toThrow(
      "Prefetch failed"
    );
  });

  it("prefetches data with different parameters", () => {
    const prefetchSpy = vi
      .spyOn(queryClient, "prefetchQuery")
      .mockResolvedValue();

    const testCases = [
      { locationId: 123, option: "temperature" },
      { locationId: 456, option: "humidity" },
      { locationId: 789, option: "pressure" },
    ];

    for (const { locationId, option } of testCases) {
      prefetchTrendGraphData(locationId, option);
    }

    expect(prefetchSpy).toHaveBeenCalledTimes(3);

    for (const [index, { locationId, option }] of testCases.entries()) {
      expect(prefetchSpy).toHaveBeenNthCalledWith(index + 1, {
        queryFn: expect.any(Function),
        queryKey: ["trend-graph", locationId, option],
      });
    }
  });
});

describe("invalidateTrendGraphData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it("calls queryClient.invalidateQueries with correct query key", () => {
    const invalidateSpy = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue();

    invalidateTrendGraphData();

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["trend-graph"],
    });
  });

  it("returns the promise from queryClient.invalidateQueries", () => {
    const mockPromise = Promise.resolve();
    const invalidateSpy = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockReturnValue(mockPromise);

    const result = invalidateTrendGraphData();

    expect(result).toBe(mockPromise);
    expect(invalidateSpy).toHaveBeenCalled();
  });

  it("invalidates all trend graph queries", async () => {
    const invalidateSpy = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue();

    // Add some queries to the cache first
    queryClient.setQueryData(queryKeys.trendGraph(123, "temperature"), {
      data: "test1",
    });
    queryClient.setQueryData(queryKeys.trendGraph(456, "humidity"), {
      data: "test2",
    });
    queryClient.setQueryData(["other-query"], { data: "other" });

    await invalidateTrendGraphData();

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["trend-graph"],
    });
  });

  it("handles invalidation errors gracefully", async () => {
    const error = new Error("Invalidation failed");
    vi.spyOn(queryClient, "invalidateQueries").mockRejectedValue(error);

    await expect(invalidateTrendGraphData()).rejects.toThrow(
      "Invalidation failed"
    );
  });
});

describe("Integration tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it("prefetch and invalidate work together", async () => {
    const mockData = {
      trendline_pets: [1, 2, 3],
      year_pets: [10, 20, 30],
      years: [2021, 2022, 2023],
    };
    const mockFetchTrendGraphData = await getMockFetchTrendGraphData();
    mockFetchTrendGraphData.mockResolvedValue(mockData);

    const prefetchSpy = vi
      .spyOn(queryClient, "prefetchQuery")
      .mockResolvedValue();
    const invalidateSpy = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue();

    // Prefetch data
    await prefetchTrendGraphData(123, "temperature");

    // Verify prefetch was called
    expect(prefetchSpy).toHaveBeenCalledWith({
      queryFn: expect.any(Function),
      queryKey: ["trend-graph", 123, "temperature"],
    });

    // Invalidate data
    await invalidateTrendGraphData();

    // Verify invalidate was called
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["trend-graph"],
    });
  });

  it("query options work with actual query client", async () => {
    const mockData = {
      trendline_pets: [4, 5, 6],
      year_pets: [40, 50, 60],
      years: [2020, 2021, 2022],
    };
    const mockFetchTrendGraphData = await getMockFetchTrendGraphData();
    mockFetchTrendGraphData.mockResolvedValue(mockData);

    const locationId = 999;
    const option = "integration-test";

    const queryOptions = getTrendGraphQueryOptions(locationId, option);

    // Use the query options with the actual query client
    const result = await queryClient.fetchQuery(queryOptions);

    expect(result).toEqual(mockData);
    expect(mockFetchTrendGraphData).toHaveBeenCalledWith(option, locationId);
  });
});
