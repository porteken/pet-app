"use client";

import { QueryClient } from "@tanstack/react-query";

import { FetchTrendGraphData } from "./fetch-client";

/**
 * Create a singleton query client to be used across the application
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Query key factories
export const queryKeys = {
  trendGraph: (locationId: number, option: string) =>
    ["trend-graph", locationId, option] as const,
};

// Query options factories for prefetching
export const getTrendGraphQueryOptions = (
  locationId: number,
  option: string
) => ({
  queryFn: () => FetchTrendGraphData(option, locationId),
  queryKey: queryKeys.trendGraph(locationId, option),
});

// Helper function to prefetch trend graph data
export const prefetchTrendGraphData = (locationId: number, option: string) => {
  return queryClient.prefetchQuery({
    ...getTrendGraphQueryOptions(locationId, option),
  });
};

// Helper function to invalidate trend graph data
export const invalidateTrendGraphData = () => {
  return queryClient.invalidateQueries({
    queryKey: ["trend-graph"],
  });
};
