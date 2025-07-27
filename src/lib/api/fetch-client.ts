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

export async function FetchTrendGraphData(
  option: string,
  locationId: number
): Promise<TrendGraphDataProperties> {
  // Check if we're in a browser environment before creating the Supabase client
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
      trendline_pets: trendlinePets,
      year_pets: yearPets,
      years,
    };
  });

  if (hasError(response)) {
    const message = `Unexpected error in FetchTrendGraphData: Error: ${response.error.message}`;
    throw new Error(message);
  }

  return response.data;
}

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

  try {
    validateYears(years);
    validateYearPets(yearPets);
  } catch (error) {
    throw new FetchError(
      error instanceof Error ? error.message : "Validation error"
    );
  }

  return { yearPets, years };
}

export { FetchReferenceGraphData } from "./reference-graph-data";
