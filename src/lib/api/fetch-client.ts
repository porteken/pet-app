import { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/config/supabase/client";
import { mapTrendRowsToGraphData } from "@/lib/api/graph-data";
import {
  formatSchemaValidationError,
  isSchemaValidationError,
  parseForecastRows,
  parseHistoricalYearRows,
  parseTrendGraphRows,
} from "@/lib/api/schemas";
import { FetchError } from "@/lib/utils/errors";
import {
  validateLocationId,
  validateTrendOption,
} from "@/lib/utils/validation";
import type { TrendGraphDataProperties } from "@/types/types";

import { apiRequest, hasError } from "./api-client";

export async function FetchForecastData(
  locationId: number,
  yearsAhead: number,
): Promise<
  | undefined
  | {
      forecastValues: number[];
      forecastYears: number[];
      lowerBound10: number[];
      upperBound90: number[];
    }
> {
  if (!validateLocationId(locationId)) {
    throw new FetchError(`Invalid location ID: ${locationId}`);
  }

  if (globalThis.window == undefined) {
    throw new TypeError(
      "FetchForecastData can only be called in browser environment",
    );
  }

  const response = await apiRequest(async () => {
    const supabase = createClient();

    const { data: historicalData } = (await supabase
      .from("pet_year_avg")
      .select("year")
      .eq("location_id", locationId)
      .order("year", { ascending: false })
      .limit(1)) as {
      data: Array<{ year: number | string }> | null;
    };

    const validatedHistoricalData = parseWithFetchError(
      "Historical year",
      parseHistoricalYearRows,
      historicalData ?? [],
    );

    if (validatedHistoricalData.length === 0) {
      return;
    }

    const lastHistoricalYear = validatedHistoricalData[0].year;
    const targetYear = lastHistoricalYear + yearsAhead;

    const { data, error } = await supabase
      .from("pet_forecast")
      .select("year, pet, lower, upper")
      .eq("location_id", locationId)
      .gt("year", lastHistoricalYear)
      .lte("year", targetYear)
      .order("year", { ascending: true });

    if (error) {
      throw new FetchError("Database error fetching forecast data", error);
    }

    const validatedForecastData = parseWithFetchError(
      "Forecast",
      parseForecastRows,
      data ?? [],
    );

    if (validatedForecastData.length === 0) {
      return;
    }

    return {
      forecastValues: validatedForecastData.map(({ pet }) => pet),
      forecastYears: validatedForecastData.map(({ year }) => year),
      lowerBound10: validatedForecastData.map(({ lower }) => lower),
      upperBound90: validatedForecastData.map(({ upper }) => upper),
    };
  });

  if (hasError(response)) {
    throw new FetchError(
      `Failed to fetch forecast data for location ${locationId}: ${response.error.message}`,
      {
        code: response.error.code,
        context: { locationId, statusCode: response.error.status },
      },
    );
  }

  return response.data;
}

export async function FetchTrendGraphData(
  option: string,
  locationId: number,
): Promise<TrendGraphDataProperties> {
  if (globalThis.window == undefined) {
    throw new TypeError(
      "FetchTrendGraphData can only be called in browser environment",
    );
  }

  if (!validateTrendOption(option)) {
    throw new FetchError("Invalid trend option. Must be 'avg' or 'max'");
  }

  if (!validateLocationId(locationId)) {
    throw new FetchError(`Invalid location ID: ${locationId}`);
  }

  const response = await apiRequest(async () => {
    const supabase = createClient();
    const tableName = option === "avg" ? "pet_year_avg" : "pet_year_max";

    const data = await fetchTrendData(supabase, tableName, locationId);
    return mapTrendRowsToGraphData(data);
  });

  if (hasError(response)) {
    throw new FetchError(
      `Failed to fetch trend graph data for location ${locationId} (${option}): ${response.error.message}`,
      {
        code: response.error.code,
        context: { locationId, option, statusCode: response.error.status },
      },
    );
  }

  return response.data;
}

export { FetchReferenceGraphData } from "./reference-graph-data";

async function fetchTrendData(
  supabase: SupabaseClient,
  tableName: string,
  locationId: number,
): Promise<
  Array<{
    location_id: number;
    pet: number;
    year: number;
  }>
> {
  const { data, error } = await supabase
    .from(tableName)
    .select("year, pet, location_id")
    .eq("location_id", locationId)
    .order("year", { ascending: true });

  if (error) {
    throw new FetchError("Database error fetching trend data", error);
  }

  return parseWithFetchError("Trend graph", parseTrendGraphRows, data ?? []);
}

const parseWithFetchError = <T>(
  resource: string,
  parser: (payload: unknown) => T,
  payload: unknown,
): T => {
  try {
    return parser(payload);
  } catch (error) {
    if (isSchemaValidationError(error)) {
      throw new FetchError(formatSchemaValidationError(resource, error), error);
    }

    throw error;
  }
};
