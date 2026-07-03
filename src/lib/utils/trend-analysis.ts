import { DEFAULT_GRAPH_SEASON, type GraphSeason } from "@/lib/constants";
import {
  getForecastHeatStressDescription,
  getHeatStressDescription,
  type HeatStressDescription,
} from "@/lib/utils/thermal-stress";

import type { TrendGraphDataProperties } from "@/types/types";

export interface TrendGraphSnapshot {
  forecastData?: ForecastGraphData;
  increase_per_year: number;
  option: string;
  season: GraphSeason;
  trendline_pets: number[];
  year_pets: number[];
  years: number[];
}

export interface ForecastGraphData {
  forecastValues: number[];
  forecastYears: number[];
  lowerBound10: number[];
  upperBound90: number[];
}

interface TrendAnalysisResult {
  forecastHeatStress: HeatStressDescription | undefined;
  heatStressDescription: HeatStressDescription | undefined;
  snapshot: TrendGraphSnapshot;
}

function computeForecastHeatStress(
  forecastData: ForecastGraphData,
): HeatStressDescription | undefined {
  if (
    forecastData.forecastValues.length === 0 ||
    forecastData.lowerBound10.length === 0 ||
    forecastData.upperBound90.length === 0
  ) {
    return undefined;
  }

  const finalForecastYear = forecastData.forecastYears.at(-1);
  const finalForecastValue = forecastData.forecastValues.at(-1);
  const finalLowerBound10 = forecastData.lowerBound10.at(-1);
  const finalUpperBound90 = forecastData.upperBound90.at(-1);

  if (
    finalForecastYear === undefined ||
    finalForecastValue === undefined ||
    finalLowerBound10 === undefined ||
    finalUpperBound90 === undefined ||
    Number.isNaN(finalLowerBound10) ||
    Number.isNaN(finalUpperBound90)
  ) {
    return undefined;
  }

  return getForecastHeatStressDescription(
    finalForecastValue,
    finalForecastYear,
    finalLowerBound10,
    finalUpperBound90,
  );
}

// Pure derivation over already-fetched trend/forecast data — pairs with
// useTrendGraphData/useForecastData so the fetching itself is left to
// React Query instead of being re-implemented here.
export const deriveTrendAnalysis = (
  trendData: TrendGraphDataProperties,
  forecastData: ForecastGraphData | undefined,
  option: string,
  season: GraphSeason = DEFAULT_GRAPH_SEASON,
): TrendAnalysisResult => {
  const { increase_per_year, trendline_pets, year_pets, years } = trendData;
  const snapshot: TrendGraphSnapshot = {
    forecastData,
    increase_per_year,
    option,
    season,
    trendline_pets,
    year_pets,
    years,
  };

  if (snapshot.years.length === 0 || snapshot.year_pets.length === 0) {
    return {
      forecastHeatStress: undefined,
      heatStressDescription: undefined,
      snapshot,
    };
  }

  const currentYear = snapshot.years.at(-1);
  const currentPetValue = snapshot.year_pets[snapshot.years.length - 1];

  if (currentYear === undefined || currentPetValue === undefined) {
    return {
      forecastHeatStress: undefined,
      heatStressDescription: undefined,
      snapshot,
    };
  }

  return {
    forecastHeatStress: forecastData
      ? computeForecastHeatStress(forecastData)
      : undefined,
    heatStressDescription: getHeatStressDescription(
      currentPetValue,
      option,
      currentYear,
      season,
    ),
    snapshot,
  };
};
