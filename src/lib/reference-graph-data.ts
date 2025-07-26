import { createClient, SupabaseClient } from "@supabase/supabase-js";

import type { ReferenceGraphDataProperties } from "../types/types";

interface PetYearReferenceData {
  date: string;
  location_id: number;
  pet: number;
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

export async function FetchReferenceGraphData(
  year: string,
  locationId: number
): Promise<ReferenceGraphDataProperties> {
  const supabase = createSupabaseClient();

  if (!validateYear(year)) {
    throw new Error("Invalid year format. Must be a 4-digit year.");
  }

  if (!validateLocation(locationId)) {
    throw new Error(`Invalid location ID: ${locationId}`);
  }

  const data = await fetchData(supabase, locationId, year);

  if (data.length === 0) {
    throw new Error(`No data found for location ${locationId} in year ${year}`);
  }

  return processData(data);
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

function processData(
  data: PetYearReferenceData[]
): ReferenceGraphDataProperties {
  const dates = data.map(({ date }) => new Date(date));
  const pets = data.map(({ pet }) => Number(pet));

  validateDates(dates);
  validatePets(pets);

  return { dates, pets };
}

function validateDates(dates: Date[]): void {
  if (dates.some(date => Number.isNaN(date.getTime()))) {
    throw new FetchError("Invalid date data detected");
  }
}

function validateLocation(locationId: number): boolean {
  return Number.isInteger(locationId) && locationId > 0;
}

function validatePets(pets: number[]): void {
  if (pets.some(pet => Number.isNaN(pet))) {
    throw new FetchError("Invalid pet count data detected");
  }
}

function validateYear(year: string): boolean {
  return /^\d{4}$/.test(year);
}
