import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { ReferenceGraphDataProps } from "../types/types";

interface PetYearReferenceData {
  date: string;
  pet: number;
  location_id: number;
  year: string;
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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseKey);
};

function validateYear(year: string): boolean {
  return /^\d{4}$/.test(year);
}

function validateLocation(locationId: number): boolean {
  return Number.isInteger(locationId) && locationId > 0;
}

function logValidationError(message: string): void {
  logMessage(message, "error");
}

function logNoDataWarning(locationId: number, year: string): void {
  if (process.env.NODE_ENV === "development") {
    console.warn(`No data found for location ${locationId} in year ${year}`);
  }
}

function logMessage(message: string, level: "error" | "warn" = "error"): void {
  if (process.env.NODE_ENV === "development") {
    if (level === "error" && console.error) {
      console.error(message);
    } else if (level === "warn" && console.warn) {
      console.warn(message);
    } else {
      console.log(`[${level.toUpperCase()}] ${message}`);
    }
  }
}

function createEmptyResult(): ReferenceGraphDataProps {
  return { dates: [], pets: [] };
}

function validateDates(dates: Date[]): void {
  if (dates.some(date => Number.isNaN(date.getTime()))) {
    throw new FetchError("Invalid date data detected");
  }
}

function validatePets(pets: number[]): void {
  if (pets.some(pet => Number.isNaN(pet))) {
    throw new FetchError("Invalid pet count data detected");
  }
}

function processData(data: PetYearReferenceData[]): ReferenceGraphDataProps {
  const dates = data.map(({ date }) => new Date(date));
  const pets = data.map(({ pet }) => Number(pet));

  validateDates(dates);
  validatePets(pets);

  return { dates, pets };
}

async function fetchData(
  supabase: SupabaseClient,
  locationId: number,
  year: string
): Promise<PetYearReferenceData[]> {
  try {
    const { data, error } = await supabase
      .from("pet_year")
      .select()
      .eq("location_id", locationId)
      .eq("year", year)
      .order("date", { ascending: true });

    if (error) {
      throw new FetchError(
        `Database error fetching reference data for location ${locationId}, year ${year}: ${error.message}`,
        error
      );
    }

    return data || [];
  } catch (error) {
    if (error instanceof FetchError) {
      throw error;
    }
    throw new FetchError(
      `Unexpected error fetching reference data for location ${locationId}, year ${year}: ${error}`,
      error
    );
  }
}

function handleValidationFailure(message: string): ReferenceGraphDataProps {
  logValidationError(message);
  return createEmptyResult();
}

function handleNoData(
  locationId: number,
  year: string
): ReferenceGraphDataProps {
  logNoDataWarning(locationId, year);
  return createEmptyResult();
}

function handleProcessingError(error: unknown): ReferenceGraphDataProps {
  let message: string;

  if (error instanceof FetchError) {
    message = error.message;
  } else if (error instanceof Error) {
    message = `Unexpected error in FetchReferenceGraphData: ${error.message}`;
  } else {
    message = `Unexpected error in FetchReferenceGraphData: ${String(error)}`;
  }

  logMessage(message);
  return createEmptyResult();
}

export async function FetchReferenceGraphData(
  year: string,
  locationId: number
): Promise<ReferenceGraphDataProps> {
  try {
    const supabase = createSupabaseClient();

    if (!validateYear(year)) {
      return handleValidationFailure(
        "Invalid year format. Must be a 4-digit year."
      );
    }

    if (!validateLocation(locationId)) {
      return handleValidationFailure(`Invalid location ID: ${locationId}`);
    }

    const data = await fetchData(supabase, locationId, year);

    if (data.length === 0) {
      return handleNoData(locationId, year);
    }

    return processData(data);
  } catch (error) {
    return handleProcessingError(error);
  }
}
