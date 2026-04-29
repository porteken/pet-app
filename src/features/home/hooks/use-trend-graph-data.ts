import { queryKeys } from "@/lib/api/query-client";
import { DEFAULT_GRAPH_SEASON, type GraphSeason } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";

const STALE_TIME_MS = 1000 * 60 * 5;

export const useTrendGraphData = (
  locationId: number | undefined,
  option: string,
  season: GraphSeason = DEFAULT_GRAPH_SEASON,
  enabled = true,
) => {
  return useQuery({
    enabled: locationId !== undefined && enabled,
    queryFn: async () => {
      const { FetchTrendGraphData } = await import("@/lib/api/fetch-client");
      return FetchTrendGraphData(option, locationId!, season);
    },
    queryKey: queryKeys.trendGraph(locationId!, option, season),
    staleTime: STALE_TIME_MS,
  });
};
