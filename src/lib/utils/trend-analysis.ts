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

interface BuildTrendAnalysisResultOptions {
  enableForecast: boolean;
  fetchForecastData: () => Promise<ForecastGraphData | undefined>;
  fetchTrendGraphData: () => Promise<TrendGraphDataProperties>;
  option: string;
  season?: GraphSeason;
}

interface ForecastGraphData {
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

export const buildTrendAnalysisResult = async ({
  enableForecast,
  fetchForecastData,
  fetchTrendGraphData,
  option,
  season = DEFAULT_GRAPH_SEASON,
}: BuildTrendAnalysisResultOptions): Promise<TrendAnalysisResult> => {
  const trendDataPromise = fetchTrendGraphData();
  const forecastDataPromise = enableForecast ? fetchForecastData() : undefined;

  const { increase_per_year, trendline_pets, year_pets, years } =
    await trendDataPromise;
  const forecastData = forecastDataPromise
    ? await forecastDataPromise
    : undefined;

  const snapshot = {
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

  const currentYear = snapshot.years.at(-1)!;
  const currentPetValue = snapshot.year_pets[snapshot.years.length - 1];

  const forecastHeatStress =
    enableForecast && forecastData
      ? computeForecastHeatStress(forecastData)
      : undefined;

  return {
    forecastHeatStress,
    heatStressDescription: getHeatStressDescription(
      currentPetValue,
      option,
      currentYear,
      season,
    ),
    snapshot,
  };
};
