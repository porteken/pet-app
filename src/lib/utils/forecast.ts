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

  // Use time series forecasting with Holt's linear trend method
  const ts = new TimeSeriesForecast(yearPets);
  const lastYear = Math.max(...years);
  const forecastYears: number[] = [];
  const forecastValues: number[] = [];
  const lowerBound: number[] = [];
  const upperBound: number[] = [];

  // Add the last historical year as the first point to connect the lines
  // Use 0 steps ahead for current position
  const lastYearPrediction = ts.forecastWithConfidence(0, 0.8);
  forecastYears.push(lastYear);
  forecastValues.push(lastYearPrediction.prediction);
  lowerBound.push(lastYearPrediction.lowerBound);
  upperBound.push(lastYearPrediction.upperBound);

  // Generate future predictions using time series forecast
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
