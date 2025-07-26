import { createClient, SupabaseClient } from "@supabase/supabase-js";

import type { TrendGraphDataProperties } from "../types/types";

interface PetYearAvgMaxData {
  location_id: number;
  pet: number;
  year: number;
}

class FetchError extends Error {
  constructor(
    message: string,
    public readonly _originalError?: unknown
  ) {
    super(message);
    this.name = "FetchError";
  }
}

const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseKey);
};

const calculateTrendline = (years: number[], yearPets: number[]): number[] => {
  const n = years.length;
  const sumX = years.reduce((a, b) => a + b, 0);
  const sumY = yearPets.reduce((a, b) => a + b, 0);
  const sumXY = years.reduce((sum, x, index) => sum + x * yearPets[index], 0);
  const sumXX = years.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return years.map(x => slope * x + intercept);
};

export async function FetchTrendGraphData(
  option: string,
  locationId: number
): Promise<TrendGraphDataProperties> {
  if (!validateTrendOption(option)) {
    throw new Error("Invalid trend option. Must be 'avg' or 'max'");
  }

  if (!validateLocationId(locationId)) {
    throw new Error(`Invalid location ID: ${locationId}`);
  }

  const supabase = createSupabaseClient();
  const tableName = option === "avg" ? "pet_year_avg" : "pet_year_max";

  try {
    const data = await fetchTrendData(supabase, tableName, locationId);

    if (data.length === 0) {
      throw new Error(`No data found for location ${locationId}`);
    }

    const { yearPets, years } = processTrendData(data);
    const trendlinePets = calculateTrendline(years, yearPets);

    return {
      trendline_pets: trendlinePets,
      year_pets: yearPets,
      years,
    };
  } catch (error) {
    const message =
      error instanceof FetchError
        ? error.message
        : `Unexpected error in FetchTrendGraphData: ${error}`;
    throw new Error(message);
  }
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

  validateYears(years);
  validateYearPets(yearPets);

  return { yearPets, years };
}

function validateLocationId(locationId: number): boolean {
  return Number.isInteger(locationId) && locationId > 0;
}

function validateTrendOption(option: string): boolean {
  return option === "avg" || option === "max";
}

function validateYearPets(yearPets: number[]): void {
  if (yearPets.some(pet => Number.isNaN(pet) || pet < 0)) {
    throw new FetchError("Invalid pet count data detected");
  }
}

function validateYears(years: number[]): void {
  if (
    years.some(year => !Number.isInteger(year) || year < 1900 || year > 2100)
  ) {
    throw new FetchError("Invalid year data detected");
  }
}

export { FetchReferenceGraphData } from "./reference-graph-data";
