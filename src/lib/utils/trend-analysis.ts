import {
  getForecastHeatStressDescription,
  getHeatStressDescription,
  type HeatStressDescription,
} from "@/lib/utils/heat-stress";
import type { TrendGraphDataProperties } from "@/types/types";

export interface TrendGraphSnapshot {
  forecastData?: ForecastGraphData;
  increase_per_year: number;
  option: string;
  trendline_pets: number[];
  year_pets: number[];
  years: number[];
}

interface BuildTrendAnalysisResultOptions {
  enableForecast: boolean;
  fetchForecastData: () => Promise<ForecastGraphData | undefined>;
  fetchTrendGraphData: () => Promise<TrendGraphDataProperties>;
  option: string;
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
}: BuildTrendAnalysisResultOptions): Promise<TrendAnalysisResult> => {
  const trendDataPromise = fetchTrendGraphData();
  const forecastDataPromise = enableForecast ? fetchForecastData() : undefined;

  const { increase_per_year, trendline_pets, year_pets, years } =
    await trendDataPromise;
  const forecastData = forecastDataPromise
    ? await forecastDataPromise
    : undefined;

  if (years.length === 0 || year_pets.length === 0) {
    return {
      forecastHeatStress: undefined,
      heatStressDescription: undefined,
      snapshot: {
        forecastData,
        increase_per_year: 0,
        option,
        trendline_pets: [],
        year_pets: [],
        years: [],
      },
    };
  }

  const currentYear = years.at(-1)!;
  const currentPetValue = year_pets[years.length - 1];

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
    ),
    snapshot: {
      forecastData,
      increase_per_year,
      option,
      trendline_pets,
      year_pets,
      years,
    },
  };
};
