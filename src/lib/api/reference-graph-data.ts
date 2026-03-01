import { SupabaseClient } from "@supabase/supabase-js";

import type { ReferenceGraphDataProperties } from "@/types/types";

import { createClient } from "@/config/supabase/client";
import { mapReferenceRowsToGraphData } from "@/lib/api/graph-data";
import {
  formatSchemaValidationError,
  isSchemaValidationError,
  parseReferenceGraphRows,
} from "@/lib/api/schemas";
import { FetchError } from "@/lib/utils/errors";
import { validateLocationId, validateYear } from "@/lib/utils/validation";

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
  return mapReferenceRowsToGraphData(data);
}

async function fetchData(
  supabase: SupabaseClient,
  locationId: number,
  year: string
): Promise<
  Array<{
    date: string;
    location_id: number;
    pet: number;
    year?: string;
  }>
> {
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

  try {
    return parseReferenceGraphRows(data ?? []);
  } catch (validationError) {
    if (isSchemaValidationError(validationError)) {
      throw new FetchError(
        formatSchemaValidationError("Reference graph", validationError),
        validationError
      );
    }

    throw validationError;
  }
}
