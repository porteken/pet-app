import {
  DEFAULT_GRAPH_SEASON,
  GRAPH_CONFIG,
  type GraphSeason,
} from "@/lib/constants";

export interface HeatStressDescription {
  colorClass: string;
  confidenceRange?: string;
  prefix: string;
  value: string;
}

type ThermalStressLevel =
  | "Extreme Cold Stress"
  | "Strong Cold Stress"
  | "Moderate Cold Stress"
  | "Slight Cold Stress"
  | "No Thermal Stress"
  | "Slight Heat Stress"
  | "Moderate Heat Stress"
  | "Strong Heat Stress"
  | "Extreme Heat Stress";

interface ThermalStressLegendItem {
  colorClass: string;
  fillClass: string;
  level: ThermalStressLevel;
  rangeLabel: string;
}

export const THERMAL_STRESS_LEGEND_ITEMS: readonly ThermalStressLegendItem[] = [
  {
    colorClass: "text-blue-900",
    fillClass: "bg-blue-900",
    level: "Extreme Cold Stress",
    rangeLabel: "< 4°C",
  },
  {
    colorClass: "text-blue-700",
    fillClass: "bg-blue-700",
    level: "Strong Cold Stress",
    rangeLabel: "4–8°C",
  },
  {
    colorClass: "text-sky-700",
    fillClass: "bg-sky-600",
    level: "Moderate Cold Stress",
    rangeLabel: "8–13°C",
  },
  {
    colorClass: "text-cyan-600",
    fillClass: "bg-cyan-400",
    level: "Slight Cold Stress",
    rangeLabel: "13–18°C",
  },
  {
    colorClass: "text-green-600",
    fillClass: "bg-green-500",
    level: "No Thermal Stress",
    rangeLabel: "18–23°C",
  },
  {
    colorClass: "text-yellow-600",
    fillClass: "bg-yellow-400",
    level: "Slight Heat Stress",
    rangeLabel: "23–29°C",
  },
  {
    colorClass: "text-amber-600",
    fillClass: "bg-amber-500",
    level: "Moderate Heat Stress",
    rangeLabel: "29–35°C",
  },
  {
    colorClass: "text-orange-600",
    fillClass: "bg-orange-500",
    level: "Strong Heat Stress",
    rangeLabel: "35–41°C",
  },
  {
    colorClass: "text-red-600",
    fillClass: "bg-red-500",
    level: "Extreme Heat Stress",
    rangeLabel: "> 41°C",
  },
];

interface HeatStressInfo {
  color: string;
  level: ThermalStressLevel;
  value: string;
}

function buildHeatStressInfo(
  item: ThermalStressLegendItem,
  petValue: number,
): HeatStressInfo {
  return {
    color: item.colorClass,
    level: item.level,
    value: petValue.toFixed(1),
  };
}

export function getForecastHeatStressDescription(
  petValue: number,
  year: number,
  lowerBound10?: number,
  upperBound90?: number,
): HeatStressDescription {
  const info = getHeatStressInfo(petValue);

  const hasValidBounds =
    lowerBound10 !== undefined &&
    upperBound90 !== undefined &&
    !Number.isNaN(lowerBound10) &&
    !Number.isNaN(upperBound90) &&
    Math.abs(upperBound90 - lowerBound10) > 0.1;

  const confidenceRange = hasValidBounds
    ? `(10-90%: ${lowerBound10.toFixed(1)}-${upperBound90.toFixed(1)}°C)`
    : undefined;

  return {
    colorClass: info.color,
    confidenceRange,
    prefix: `By end of ${year}, it could be`,
    value: info.value,
  };
}

export function getHeatStressDescription(
  petValue: number,
  measureType: string,
  year: number = GRAPH_CONFIG.YEAR_RANGE.END,
  season: GraphSeason = DEFAULT_GRAPH_SEASON,
): HeatStressDescription {
  const info = getHeatStressInfo(petValue);
  const measure = measureType === "avg" ? "average" : "max";
  const seasonLabel =
    season === DEFAULT_GRAPH_SEASON ? "annual" : season.toLowerCase();

  return {
    colorClass: info.color,
    prefix: `The ${year} ${seasonLabel} ${measure} thermal stress is`,
    value: info.value,
  };
}

export function getHeatStressInfo(petValue: number): HeatStressInfo {
  if (petValue < 4) {
    return buildHeatStressInfo(THERMAL_STRESS_LEGEND_ITEMS[0], petValue);
  }
  if (petValue <= 8) {
    return buildHeatStressInfo(THERMAL_STRESS_LEGEND_ITEMS[1], petValue);
  }
  if (petValue <= 13) {
    return buildHeatStressInfo(THERMAL_STRESS_LEGEND_ITEMS[2], petValue);
  }
  if (petValue <= 18) {
    return buildHeatStressInfo(THERMAL_STRESS_LEGEND_ITEMS[3], petValue);
  }
  if (petValue <= 23) {
    return buildHeatStressInfo(THERMAL_STRESS_LEGEND_ITEMS[4], petValue);
  }
  if (petValue <= 29) {
    return buildHeatStressInfo(THERMAL_STRESS_LEGEND_ITEMS[5], petValue);
  }
  if (petValue <= 35) {
    return buildHeatStressInfo(THERMAL_STRESS_LEGEND_ITEMS[6], petValue);
  }
  if (petValue <= 41) {
    return buildHeatStressInfo(THERMAL_STRESS_LEGEND_ITEMS[7], petValue);
  }

  return buildHeatStressInfo(THERMAL_STRESS_LEGEND_ITEMS[8], petValue);
}
