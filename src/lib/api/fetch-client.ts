import { SupabaseClient } from "@supabase/supabase-js";

import type { TrendGraphDataProperties } from "@/types/types";

import { createClient } from "@/config/supabase/client";
import { FetchError } from "@/lib/utils/errors";
import { SimpleLinearRegression } from "@/lib/utils/simple-linear-regression";
import {
  validateLocationId,
  validateTrendOption,
  validateYearPets,
  validateYears,
} from "@/lib/utils/validation";

interface PetYearAvgMaxData {
  location_id: number;
  pet: number;
  year: number;
}

import { apiRequest, hasError } from "./api-client";

export async function FetchForecastData(
  locationId: number,
  yearsAhead: number
): Promise<
  | undefined
  | {
      forecastValues: number[];
      forecastYears: number[];
      lowerBound10: number[];
      upperBound90: number[];
    }
> {
  if (globalThis.window === undefined) {
    throw new Error(
      "FetchForecastData can only be called in browser environment"
    );
  }

  if (!validateLocationId(locationId)) {
    throw new FetchError(`Invalid location ID: ${locationId}`);
  }

  const response = await apiRequest(async () => {
    const supabase = createClient();

    const { data: historicalData } = await supabase
      .from("pet_year_avg")
      .select("year")
      .eq("location_id", locationId)
      .order("year", { ascending: false })
      .limit(1);

    if (!historicalData || historicalData.length === 0) {
      return;
    }

    const lastHistoricalYear = historicalData[0].year;
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

    if (!data || data.length === 0) {
      return;
    }

    return {
      forecastValues: data.map(d => Number(d.pet)),
      forecastYears: data.map(d => d.year),
      lowerBound10: data.map(d => Number(d.lower)),
      upperBound90: data.map(d => Number(d.upper)),
    };
  });

  if (hasError(response)) {
    throw new FetchError(
      `Failed to fetch forecast data for location ${locationId}: ${response.error.message}`,
      {
        code: response.error.code,
        context: { locationId, statusCode: response.error.status },
      }
    );
  }

  return response.data;
}

export async function FetchTrendGraphData(
  option: string,
  locationId: number
): Promise<TrendGraphDataProperties> {
  if (globalThis.window === undefined) {
    throw new Error(
      "FetchTrendGraphData can only be called in browser environment"
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

    if (data.length === 0) {
      throw new Error(`No data found for location ${locationId}`);
    }

    const { yearPets, years } = processTrendData(data);
    const reg = new SimpleLinearRegression(years, yearPets);
    const trendlinePets = years.map(year => reg.predict(year));

    return {
      increase_per_year: reg.slope,
      trendline_pets: trendlinePets,
      year_pets: yearPets,
      years,
    };
  });

  if (hasError(response)) {
    throw new FetchError(
      `Failed to fetch trend graph data for location ${locationId} (${option}): ${response.error.message}`,
      {
        code: response.error.code,
        context: { locationId, option, statusCode: response.error.status },
      }
    );
  }

  return response.data;
}

export { FetchReferenceGraphData } from "./reference-graph-data";

async function fetchTrendData(
  supabase: SupabaseClient,
  tableName: string,
  locationId: number
): Promise<PetYearAvgMaxData[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select("year, pet, location_id")
    .eq("location_id", locationId)
    .order("year", { ascending: true });

  if (error) {
    throw new FetchError("Database error fetching trend data", error);
  }

  return data || [];
}

function processTrendData(data: PetYearAvgMaxData[]): {
  yearPets: number[];
  years: number[];
} {
  const years = data.map(({ year }) => year);
  const yearPets = data.map(({ pet }) => Number(pet));

  validateYears(years);
  validateYearPets(yearPets);

  return { yearPets, years };
}
