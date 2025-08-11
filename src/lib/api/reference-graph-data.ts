import { SupabaseClient } from "@supabase/supabase-js";

import type { ReferenceGraphDataProperties } from "@/types/types";

import { createClient } from "@/config/supabase/client";
import { FetchError } from "@/lib/utils/errors";
import {
  validateDates,
  validateLocationId,
  validatePets,
  validateYear,
} from "@/lib/utils/validation";

interface PetYearReferenceData {
  date: string;
  location_id: number;
  pet: number;
  year: string;
}

export async function FetchReferenceGraphData(
  year: string,
  locationId: number
): Promise<ReferenceGraphDataProperties> {
  const supabase = createClient();

  if (!validateYear(year)) {
    throw new FetchError("Invalid year format. Must be a 4-digit year.");
  }

  if (!validateLocationId(locationId)) {
    throw new FetchError(`Invalid location ID: ${locationId}`);
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
