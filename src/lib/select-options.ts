import { SelectOptionProps } from "../types/types";

import { GRAPH_CONFIG } from "@/utils/constants";

export const GraphOptions: SelectOptionProps[] = [
  { key: GRAPH_CONFIG.TREND_OPTIONS.AVG, label: "Average" },
  { key: GRAPH_CONFIG.TREND_OPTIONS.MAX, label: "Max" },
];

export const YearOptions = (): SelectOptionProps[] => {
  const { START, END } = GRAPH_CONFIG.YEAR_RANGE;
  return Array.from({ length: END - START }, (_, i) => {
    const year = (START + i).toString();
    return { key: year, label: year };
  });
};
