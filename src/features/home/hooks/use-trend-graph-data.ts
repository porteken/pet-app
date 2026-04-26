import { useQuery } from "@tanstack/react-query";

import { FetchTrendGraphData } from "@/lib/api/fetch-client";
import { queryKeys } from "@/lib/api/query-client";
import { DEFAULT_GRAPH_SEASON, type GraphSeason } from "@/lib/constants";

export const useTrendGraphData = (
  locationId: number | undefined,
  option: string,
  season: GraphSeason = DEFAULT_GRAPH_SEASON,
  enabled = true,
) => {
  return useQuery({
    enabled: enabled && locationId !== undefined,
    queryFn: () => FetchTrendGraphData(option, locationId!, season),
    queryKey: queryKeys.trendGraph(locationId!, option, season),
    staleTime: 1000 * 60 * 5,
  });
};
