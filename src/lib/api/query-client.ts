"use client";

import { QueryClient } from "@tanstack/react-query";

import { FetchTrendGraphData } from "./fetch-client";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 1000 * 60 * 5,
      },
    },
  });

export const queryKeys = {
  trendGraph: (locationId: number, option: string) =>
    ["trend-graph", locationId, option] as const,
};

export const getTrendGraphQueryOptions = (
  locationId: number,
  option: string
) => ({
  queryFn: () => FetchTrendGraphData(option, locationId),
  queryKey: queryKeys.trendGraph(locationId, option),
});

export const prefetchTrendGraphData = (
  queryClient: QueryClient,
  locationId: number,
  option: string
) => {
  return queryClient.prefetchQuery({
    ...getTrendGraphQueryOptions(locationId, option),
  });
};

export const invalidateTrendGraphData = (queryClient: QueryClient) => {
  return queryClient.invalidateQueries({
    queryKey: ["trend-graph"],
  });
};
