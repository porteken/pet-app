import { GRAPH_CONFIG } from "@/lib/utils/constants";
import { SelectOptionProperties } from "@/types/types";

export const GraphOptions: SelectOptionProperties[] = [
  { key: GRAPH_CONFIG.TREND_OPTIONS.AVG, label: "Average" },
  { key: GRAPH_CONFIG.TREND_OPTIONS.MAX, label: "Max" },
];

export const YearOptions = (): SelectOptionProperties[] => {
  const { END, START } = GRAPH_CONFIG.YEAR_RANGE;

  return Array.from({ length: END - START }, (_, index) => {
    const year = (START + index).toString();

    return { key: year, label: year };
  });
};
