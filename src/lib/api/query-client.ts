"use client";

import { DEFAULT_GRAPH_SEASON, type GraphSeason } from "@/lib/constants";
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
  trendGraph: (
    locationId: number,
    option: string,
    season: GraphSeason = DEFAULT_GRAPH_SEASON,
  ) => ["trend-graph", locationId, option, season] as const,
};

export const getTrendGraphQueryOptions = (
  locationId: number,
  option: string,
  season: GraphSeason = DEFAULT_GRAPH_SEASON,
) => ({
  queryFn: () => FetchTrendGraphData(option, locationId, season),
  queryKey: queryKeys.trendGraph(locationId, option, season),
});

export const prefetchTrendGraphData = (
  queryClient: QueryClient,
  locationId: number,
  option: string,
  season: GraphSeason = DEFAULT_GRAPH_SEASON,
) => {
  return queryClient.prefetchQuery({
    ...getTrendGraphQueryOptions(locationId, option, season),
  });
};

export const invalidateTrendGraphData = (queryClient: QueryClient) => {
  return queryClient.invalidateQueries({
    queryKey: ["trend-graph"],
  });
};
