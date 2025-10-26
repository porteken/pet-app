import type { ForecastData } from "@/types/types";

import { TimeSeriesForecast } from "./time-series-forecast";

export function calculateForecast(
  years: number[],
  yearPets: number[],
  yearsAhead: number
): ForecastData {
  if (years.length === 0 || yearPets.length === 0) {
    return {
      forecastValues: [],
      forecastYears: [],
      lowerBound: [],
      upperBound: [],
    };
  }

  const ts = new TimeSeriesForecast(yearPets);
  const lastYear = Math.max(...years);
  const forecastYears: number[] = [];
  const forecastValues: number[] = [];
  const lowerBound: number[] = [];
  const upperBound: number[] = [];

  const lastYearPrediction = ts.forecastWithConfidence(0, 0.8);
  forecastYears.push(lastYear);
  forecastValues.push(lastYearPrediction.prediction);
  lowerBound.push(lastYearPrediction.lowerBound);
  upperBound.push(lastYearPrediction.upperBound);

  for (let index = 1; index <= yearsAhead; index++) {
    const futureYear = lastYear + index;
    const {
      lowerBound: lower,
      prediction,
      upperBound: upper,
    } = ts.forecastWithConfidence(index, 0.8);

    forecastYears.push(futureYear);
    forecastValues.push(prediction);
    lowerBound.push(lower);
    upperBound.push(upper);
  }

  return {
    forecastValues,
    forecastYears,
    lowerBound,
    upperBound,
  };
}
