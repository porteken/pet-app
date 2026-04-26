import { cookies } from "next/headers";

import { FetchLocations } from "@/lib/api/fetch-server";
import {
  DEFAULT_FORECAST_ENABLED,
  DEFAULT_FORECAST_YEARS_AHEAD,
  DEFAULT_GRAPH_MEASURE,
  DEFAULT_GRAPH_SEASON,
  ERROR_MESSAGES,
  FORECAST_ENABLED_COOKIE_NAME,
  FORECAST_YEARS_AHEAD_COOKIE_NAME,
  GRAPH_MEASURE_COOKIE_NAME,
  GRAPH_SEASON_COOKIE_NAME,
  MAX_FORECAST_YEARS_AHEAD,
  MIN_FORECAST_YEARS_AHEAD,
  normalizeGraphSeason,
} from "@/lib/constants";

export const getGraphMeasureFromCookies = async (): Promise<string> => {
  const cookieStore = await cookies();
  return (
    cookieStore.get(GRAPH_MEASURE_COOKIE_NAME)?.value || DEFAULT_GRAPH_MEASURE
  );
};

export const getGraphSeasonFromCookies = async () => {
  const cookieStore = await cookies();

  return normalizeGraphSeason(
    cookieStore.get(GRAPH_SEASON_COOKIE_NAME)?.value || DEFAULT_GRAPH_SEASON,
  );
};

export const getForecastPreferencesFromCookies = async (): Promise<{
  enabled: boolean;
  yearsAhead: number;
}> => {
  const cookieStore = await cookies();
  const forecastEnabledRaw = cookieStore.get(
    FORECAST_ENABLED_COOKIE_NAME,
  )?.value;
  const forecastYearsAheadRaw = cookieStore.get(
    FORECAST_YEARS_AHEAD_COOKIE_NAME,
  )?.value;

  const enabled =
    forecastEnabledRaw === undefined
      ? DEFAULT_FORECAST_ENABLED
      : forecastEnabledRaw === "true";

  const parsedYearsAhead = Number(forecastYearsAheadRaw);
  const yearsAhead =
    Number.isInteger(parsedYearsAhead) &&
    parsedYearsAhead >= MIN_FORECAST_YEARS_AHEAD &&
    parsedYearsAhead <= MAX_FORECAST_YEARS_AHEAD
      ? parsedYearsAhead
      : DEFAULT_FORECAST_YEARS_AHEAD;

  return {
    enabled,
    yearsAhead,
  };
};

export const getLocationData = async () => {
  const { LocationOptions, locations } = await FetchLocations();

  if (!locations || locations.length === 0) {
    throw new Error(ERROR_MESSAGES.NO_DATA);
  }

  return { LocationOptions, locations };
};
