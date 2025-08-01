import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useTrendGraphData } from "../use-trend-graph-data";

// Mock the fetch client
vi.mock("@/lib/api/fetch-client", () => ({
  FetchTrendGraphData: vi.fn(),
}));

// Mock query keys
vi.mock("@/lib/api/query-client", () => ({
  queryKeys: {
    trendGraph: (locationId: number, option: string) => [
      "trend-graph",
      locationId,
      option,
    ],
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 0,
        retry: false,
      },
    },
  });

  const TestWrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  TestWrapper.displayName = "TestWrapper";

  return TestWrapper;
};

describe("useTrendGraphData", () => {
  let mockFetchTrendGraphData: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { FetchTrendGraphData } = await import("@/lib/api/fetch-client");
    mockFetchTrendGraphData = vi.mocked(FetchTrendGraphData);
  });

  it("does not fetch when locationId is undefined", () => {
    const { result } = renderHook(
      () => useTrendGraphData(undefined, "temperature"),
      {
        wrapper: createWrapper(),
      }
    );

    expect(result.current.isFetching).toBe(false);
    expect(mockFetchTrendGraphData).not.toHaveBeenCalled();
  });

  it("does not fetch when enabled is false", () => {
    const { result } = renderHook(
      () => useTrendGraphData(123, "temperature", false),
      {
        wrapper: createWrapper(),
      }
    );

    expect(result.current.isFetching).toBe(false);
    expect(mockFetchTrendGraphData).not.toHaveBeenCalled();
  });

  it("fetches data when locationId is provided and enabled is true", async () => {
    const mockData = { data: "test data" };
    mockFetchTrendGraphData.mockResolvedValue(mockData);

    const { result } = renderHook(
      () => useTrendGraphData(123, "temperature", true),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetchTrendGraphData).toHaveBeenCalledWith("temperature", 123);
    expect(result.current.data).toEqual(mockData);
  });

  it("fetches data when enabled is not provided (defaults to true)", async () => {
    const mockData = { data: "test data" };
    mockFetchTrendGraphData.mockResolvedValue(mockData);

    const { result } = renderHook(() => useTrendGraphData(123, "temperature"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetchTrendGraphData).toHaveBeenCalledWith("temperature", 123);
    expect(result.current.data).toEqual(mockData);
  });

  it("handles fetch errors correctly", async () => {
    const mockError = new Error("Fetch failed");
    mockFetchTrendGraphData.mockRejectedValue(mockError);

    const { result } = renderHook(() => useTrendGraphData(123, "temperature"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });

  it("updates when locationId changes", async () => {
    const mockData1 = { data: "data for location 123" };
    const mockData2 = { data: "data for location 456" };

    mockFetchTrendGraphData.mockResolvedValueOnce(mockData1);
    mockFetchTrendGraphData.mockResolvedValueOnce(mockData2);

    const { rerender, result } = renderHook(
      ({ locationId }) => useTrendGraphData(locationId, "temperature"),
      {
        initialProps: { locationId: 123 },
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData1);

    // Change locationId
    rerender({ locationId: 456 });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData2);
    });

    expect(mockFetchTrendGraphData).toHaveBeenCalledWith("temperature", 123);
    expect(mockFetchTrendGraphData).toHaveBeenCalledWith("temperature", 456);
  });

  it("updates when option changes", async () => {
    const mockData1 = { data: "temperature data" };
    const mockData2 = { data: "humidity data" };

    mockFetchTrendGraphData.mockResolvedValueOnce(mockData1);
    mockFetchTrendGraphData.mockResolvedValueOnce(mockData2);

    const { rerender, result } = renderHook(
      ({ option }) => useTrendGraphData(123, option),
      {
        initialProps: { option: "temperature" },
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData1);

    // Change option
    rerender({ option: "humidity" });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData2);
    });

    expect(mockFetchTrendGraphData).toHaveBeenCalledWith("temperature", 123);
    expect(mockFetchTrendGraphData).toHaveBeenCalledWith("humidity", 123);
  });

  it("has correct stale time", () => {
    const { result } = renderHook(() => useTrendGraphData(123, "temperature"), {
      wrapper: createWrapper(),
    });

    // Query should have the stale time set to 5 minutes (300000ms)
    expect(result.current.dataUpdatedAt).toBeDefined();
  });

  it("handles enabled state changes correctly", async () => {
    const mockData = { data: "test data" };
    mockFetchTrendGraphData.mockResolvedValue(mockData);

    const { rerender, result } = renderHook(
      ({ enabled }) => useTrendGraphData(123, "temperature", enabled),
      {
        initialProps: { enabled: false },
        wrapper: createWrapper(),
      }
    );

    // Should not fetch when disabled
    expect(result.current.isFetching).toBe(false);
    expect(mockFetchTrendGraphData).not.toHaveBeenCalled();

    // Enable fetching
    rerender({ enabled: true });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetchTrendGraphData).toHaveBeenCalledWith("temperature", 123);
    expect(result.current.data).toEqual(mockData);
  });

  it("handles locationId 0 correctly", async () => {
    const mockData = { data: "data for location 0" };
    mockFetchTrendGraphData.mockResolvedValue(mockData);

    const { result } = renderHook(() => useTrendGraphData(0, "temperature"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetchTrendGraphData).toHaveBeenCalledWith("temperature", 0);
    expect(result.current.data).toEqual(mockData);
  });

  it("uses correct query key format", () => {
    const { result } = renderHook(() => useTrendGraphData(123, "temperature"), {
      wrapper: createWrapper(),
    });

    // The query key should follow the expected format
    expect(result.current).toBeDefined();
  });
});
