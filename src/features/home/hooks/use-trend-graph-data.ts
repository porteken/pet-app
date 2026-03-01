import { useQuery } from "@tanstack/react-query";

import { FetchTrendGraphData } from "@/lib/api/fetch-client";
import { queryKeys } from "@/lib/api/query-client";

export const useTrendGraphData = (
  locationId: number | undefined,
  option: string,
  enabled = true
) => {
  return useQuery({
    enabled: enabled && locationId !== undefined,
    queryFn: () => FetchTrendGraphData(option, locationId!),
    queryKey: queryKeys.trendGraph(locationId!, option),
    staleTime: 1000 * 60 * 5,
  });
};
