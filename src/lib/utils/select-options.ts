import { GRAPH_CONFIG, GRAPH_SEASONS } from "@/lib/constants";

import type { SelectOptionProperties } from "@/types/types";

export const GraphOptions: SelectOptionProperties[] = [
  { key: GRAPH_CONFIG.TREND_OPTIONS.AVG, label: "Average" },
  { key: GRAPH_CONFIG.TREND_OPTIONS.MAX, label: "Max" },
];

export const SeasonOptions: SelectOptionProperties[] = GRAPH_SEASONS.map(
  (season) => ({ key: season, label: season }),
);

export const YearOptions = (): SelectOptionProperties[] => {
  const { END, START } = GRAPH_CONFIG.YEAR_RANGE;

  return Array.from({ length: END - START + 1 }, (_, index) => {
    const year = (START + index).toString();

    return { key: year, label: year };
  });
};
