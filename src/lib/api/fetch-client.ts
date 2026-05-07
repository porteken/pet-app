import { createClient } from "@/config/supabase/client";
import { mapTrendRowsToGraphData } from "@/lib/api/graph-data";
import {
  formatSchemaValidationError,
  isSchemaValidationError,
  parseForecastRows,
  parseHistoricalYearRows,
  parseTrendGraphRows,
} from "@/lib/api/schemas";
import {
  DEFAULT_GRAPH_SEASON,
  type GraphSeason,
  normalizeGraphSeason,
} from "@/lib/constants";
import { FetchError } from "@/lib/utils/errors";
import {
  validateLocationId,
  validateTrendOption,
} from "@/lib/utils/validation";

import { apiRequest, hasError } from "./api-client";

import type { TrendGraphDataProperties } from "@/types/types";
import type { SupabaseClient } from "@supabase/supabase-js";

interface ForecastQueryWindow {
  lastHistoricalYear: number;
  targetYear: number;
}

function isMissingSeasonColumnError(
  error: unknown,
  relationName: string,
): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const code = "code" in error ? error.code : undefined;
  const message = "message" in error ? error.message : undefined;

  if (typeof message !== "string") {
    return false;
  }

  return (
    (code === "42703" &&
      message.includes(`column ${relationName}.season does not exist`)) ||
    (code === "PGRST204" &&
      message.includes("'season'") &&
      message.includes(`'${relationName}'`))
  );
}

async function fetchHistoricalYear(
  supabase: SupabaseClient,
  locationId: number,
  season: GraphSeason,
) {
  const primaryQuery = await supabase
    .from("pet_year_stats")
    .select("year")
    .eq("location_id", locationId)
    .eq("season", season)
    .order("year", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!isMissingSeasonColumnError(primaryQuery.error, "pet_year_stats")) {
    return primaryQuery;
  }

  return supabase
    .from("pet_year_stats")
    .select("year")
    .eq("location_id", locationId)
    .order("year", { ascending: false })
    .limit(1)
    .maybeSingle();
}

async function fetchForecastRows(
  supabase: SupabaseClient,
  locationId: number,
  season: GraphSeason,
  queryWindow: ForecastQueryWindow,
) {
  const primaryQuery = await supabase
    .from("pet_forecast")
    .select("year, pet, lower, upper")
    .eq("location_id", locationId)
    .eq("season", season)
    .gt("year", queryWindow.lastHistoricalYear)
    .lte("year", queryWindow.targetYear)
    .order("year", { ascending: true });

  if (!isMissingSeasonColumnError(primaryQuery.error, "pet_forecast")) {
    return primaryQuery;
  }

  return supabase
    .from("pet_forecast")
    .select("year, pet, lower, upper")
    .eq("location_id", locationId)
    .gt("year", queryWindow.lastHistoricalYear)
    .lte("year", queryWindow.targetYear)
    .order("year", { ascending: true });
}

async function fetchTrendRows(
  supabase: SupabaseClient,
  locationId: number,
  season: GraphSeason,
  option: string,
) {
  const columns = `year, pet:${option}_pet, location_id`;

  const primaryQuery = await supabase
    .from("pet_year_stats")
    .select(columns)
    .eq("location_id", locationId)
    .eq("season", season)
    .order("year", { ascending: true });

  if (!isMissingSeasonColumnError(primaryQuery.error, "pet_year_stats")) {
    return primaryQuery;
  }

  return supabase
    .from("pet_year_stats")
    .select(columns)
    .eq("location_id", locationId)
    .order("year", { ascending: true });
}

export async function FetchForecastData(
  locationId: number,
  yearsAhead: number,
  season: GraphSeason = DEFAULT_GRAPH_SEASON,
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

  const resolvedSeason = normalizeGraphSeason(season);

  const response = await apiRequest(async () => {
    const supabase = createClient();

    const { data: historicalData, error: historicalError } =
      await fetchHistoricalYear(supabase, locationId, resolvedSeason);

    if (historicalError) {
      throw new FetchError(
        "Database error fetching historical data",
        historicalError,
      );
    }

    if (!historicalData) {
      return undefined;
    }

    const validatedHistoricalData = parseWithFetchError(
      "Historical year",
      parseHistoricalYearRows,
      [historicalData],
    );

    if (validatedHistoricalData.length === 0) {
      return undefined;
    }

    const firstHistorical = validatedHistoricalData[0];
    if (!firstHistorical) {
      return undefined;
    }
    const lastHistoricalYear = firstHistorical.year;
    const targetYear = lastHistoricalYear + yearsAhead;

    const { data, error } = await fetchForecastRows(
      supabase,
      locationId,
      resolvedSeason,
      { lastHistoricalYear, targetYear },
    );

    if (error) {
      throw new FetchError("Database error fetching forecast data", error);
    }

    const validatedForecastData = parseWithFetchError(
      "Forecast",
      parseForecastRows,
      data ?? [],
    );

    if (validatedForecastData.length === 0) {
      return undefined;
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
  season: GraphSeason = DEFAULT_GRAPH_SEASON,
): Promise<TrendGraphDataProperties> {
  if (globalThis.window == undefined) {
    throw new TypeError(
      "FetchTrendGraphData can only be called in browser environment",
    );
  }

  const resolvedSeason = normalizeGraphSeason(season);

  if (!validateTrendOption(option)) {
    throw new FetchError("Invalid trend option. Must be 'avg' or 'max'");
  }

  if (!validateLocationId(locationId)) {
    throw new FetchError(`Invalid location ID: ${locationId}`);
  }

  const response = await apiRequest(async () => {
    const supabase = createClient();
    const data = await fetchTrendData(
      supabase,
      locationId,
      resolvedSeason,
      option,
    );
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
  locationId: number,
  season: GraphSeason,
  option: string,
): Promise<
  Array<{
    location_id: number;
    pet: number;
    year: number;
  }>
> {
  const { data, error } = await fetchTrendRows(
    supabase,
    locationId,
    season,
    option,
  );

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
