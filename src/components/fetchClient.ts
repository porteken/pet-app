import { SimpleLinearRegression } from "ml-regression-simple-linear";

import { ERROR_MESSAGES } from "../utils/constants";
import { createClient } from "../utils/supabase/client";
import { validateTrendOption, validateYear } from "../utils/validation";

import { ReferenceGraphDataProps, TrendGraphDataProps } from "./types";

interface PetYearAvgMaxData {
  year: number;
  pet: number;
  location_id: number;
}

interface PetYearReferenceData {
  date: string;
  pet: number;
  location_id: number;
  year: string;
}

// Error types for better error handling
class FetchError extends Error {
  constructor(
    message: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = "FetchError";
  }
}

// Utility functions
const createSupabaseClient = () => {
  try {
    return createClient();
  } catch (error) {
    throw new FetchError("Failed to create Supabase client", error);
  }
};

const calculateTrendline = (years: number[], yearPets: number[]): number[] => {
  if (years.length < 2 || yearPets.length < 2) {
    return [];
  }

  try {
    const regression = new SimpleLinearRegression(years, yearPets);
    return years.map(year => Math.round(regression.predict(year) * 100) / 100);
  } catch (error) {
    console.error("Error calculating trendline:", error);
    return [];
  }
};

// Fetch data for the trend graph
export async function FetchTrendGraphData(
  option: string,
  locationId: number
): Promise<TrendGraphDataProps> {
  // Input validation
  if (!validateTrendOption(option)) {
    console.error(ERROR_MESSAGES.INVALID_TREND_OPTION);
    return { years: [], year_pets: [], trendline_pets: [] };
  }

  if (!Number.isInteger(locationId) || locationId <= 0) {
    console.error(`Invalid location ID: ${locationId}`);
    return { years: [], year_pets: [], trendline_pets: [] };
  }

  const supabase = createSupabaseClient();
  const tableName = `pet_year_${option}`;

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select("year, pet, location_id")
      .eq("location_id", locationId)
      .order("year", { ascending: true });

    if (error) {
      throw new FetchError(`Database error fetching from ${tableName}`, error);
    }

    if (!data || data.length === 0) {
      console.warn(`No data found for location ${locationId} in ${tableName}`);
      return { years: [], year_pets: [], trendline_pets: [] };
    }

    // Type-safe data extraction
    const typedData = data as PetYearAvgMaxData[];

    const years = typedData.map(({ year }) => year);
    const yearPets = typedData.map(({ pet }) => Number(pet));

    // Validate data integrity
    if (
      years.some(year => !Number.isInteger(year) || year < 1900 || year > 2100)
    ) {
      throw new FetchError("Invalid year data detected");
    }

    if (yearPets.some(pet => isNaN(pet) || pet < 0)) {
      throw new FetchError("Invalid pet count data detected");
    }

    const trendlinePets = calculateTrendline(years, yearPets);

    return {
      years,
      year_pets: yearPets,
      trendline_pets: trendlinePets,
    };
  } catch (error) {
    const errorMessage =
      error instanceof FetchError
        ? error.message
        : `Unexpected error in FetchTrendGraphData: ${error}`;

    console.error(errorMessage, error);
    return { years: [], year_pets: [], trendline_pets: [] };
  }
}

// Fetch data for the reference graph
export async function FetchReferenceGraphData(
  year: string,
  locationId: number
): Promise<ReferenceGraphDataProps> {
  // Input validation
  if (!year || typeof year !== "string") {
    console.error(ERROR_MESSAGES.INVALID_YEAR_FORMAT);
    return { dates: [], pets: [] };
  }

  if (!Number.isInteger(locationId) || locationId <= 0) {
    console.error(ERROR_MESSAGES.INVALID_LOCATION_ID);
    return { dates: [], pets: [] };
  }

  // Validate year format
  if (!validateYear(year)) {
    console.error(ERROR_MESSAGES.INVALID_YEAR_FORMAT);
    return { dates: [], pets: [] };
  }

  const supabase = createSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("pet_year")
      .select("date, pet, location_id, year")
      .eq("location_id", locationId)
      .eq("year", year)
      .order("date", { ascending: true });

    if (error) {
      throw new FetchError("Database error fetching from pet_year", error);
    }

    if (!data || data.length === 0) {
      console.warn(`No data found for location ${locationId} and year ${year}`);
      return { dates: [], pets: [] };
    }

    // Type-safe data extraction and validation
    const typedData = data as PetYearReferenceData[];

    const dates: Date[] = [];
    const pets: number[] = [];

    for (const item of typedData) {
      const date = new Date(item.date);

      // Validate date
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date found: ${item.date}, skipping`);
        continue;
      }

      const petCount = Number(item.pet);

      // Validate pet count
      if (isNaN(petCount) || petCount < 0) {
        console.warn(`Invalid pet count found: ${item.pet}, skipping`);
        continue;
      }

      dates.push(date);
      pets.push(petCount);
    }

    return { dates, pets };
  } catch (error) {
    const errorMessage =
      error instanceof FetchError
        ? error.message
        : `Unexpected error in FetchReferenceGraphData: ${error}`;

    console.error(errorMessage, error);
    return { dates: [], pets: [] };
  }
}
