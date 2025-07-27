"use server";
import { cookies } from "next/headers";

import { createClient } from "@/config/supabase/server";
import { DatabaseError } from "@/lib/utils/errors";
import { SimpleLinearRegression } from "@/lib/utils/simple-linear-regression";
import {
  FetchLocationProperties,
  LocationOptionSection,
  ReferenceGraphDataProperties,
  TrendGraphDataProperties,
} from "@/types/types";

export async function FetchLocations(): Promise<FetchLocationProperties> {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  try {
    const { data: locations, error } = await supabase
      .from("locations")
      .select();
    if (error || !locations) {
      throw new DatabaseError(
        "Failed to fetch location data from database",
        error
      );
    } else {
      const states = [...new Set(locations.map(({ state }) => state))].sort(
        (a, b) => a.localeCompare(b)
      );

      const LocationOptions: LocationOptionSection[] = states.map(state => ({
        items: locations
          .filter(loc => loc.state === state)
          .sort((a, b) => a.city.localeCompare(b.city))
          .map(({ city, location_id }) => ({
            key: location_id,
            title: city,
          })),
        title: state,
      }));

      return { LocationOptions, locations };
    }
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError("Database connection failed", error);
  }
}

export async function FetchReferenceGraphData(
  year: string,
  locationId: number
): Promise<ReferenceGraphDataProperties> {
  if (!locationId || Number.isNaN(locationId) || locationId <= 0) {
    throw new DatabaseError(`Invalid locationId: ${locationId}`);
  }

  // Validate year parameter
  if (!year || !/^\d{4}$/.test(year)) {
    throw new DatabaseError(
      `Invalid year format: ${year}. Must be a 4-digit year.`
    );
  }

  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  try {
    const { data, error } = await supabase
      .from("pet_year")
      .select()
      .eq("location_id", locationId)
      .eq("year", year);

    if (error || !data) {
      throw new DatabaseError(
        "Failed to fetch reference graph data from database",
        error
      );
    }

    const dates = data.map(({ date }: { date: string }) => new Date(date));
    const pets = data.map(({ pet }: { pet: number }) => Number(pet));

    return { dates, pets };
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError(
      "Database connection failed while fetching reference data",
      error
    );
  }
}

export async function FetchTrendGraphData(
  option: string,
  locationId: number
): Promise<TrendGraphDataProperties> {
  if (!locationId || Number.isNaN(locationId) || locationId <= 0) {
    return { trendline_pets: [], year_pets: [], years: [] };
  }

  // Validate option parameter
  if (!option || !["avg", "max"].includes(option)) {
    throw new DatabaseError(
      `Invalid option: ${option}. Must be 'avg' or 'max'`
    );
  }

  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  try {
    const { data, error } = await supabase
      .from(`pet_year_${option}`)
      .select()
      .eq("location_id", locationId);

    if (error || !data) {
      throw new DatabaseError(
        "Failed to fetch trend graph data from database",
        error
      );
    }

    const years = data.map(({ year }: { year: number }) => year);
    const year_pets = data.map(({ pet }: { pet: number }) => Number(pet));

    // Check if we have data before creating regression
    if (years.length === 0 || year_pets.length === 0) {
      return { trendline_pets: [], year_pets: [], years: [] };
    }

    const reg = new SimpleLinearRegression(years, year_pets);
    const trendline_pets = years.map(
      (year: number) => Math.round(reg.predict(year) * 100) / 100
    );

    return { trendline_pets, year_pets, years };
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError(
      "Database connection failed while fetching trend data",
      error
    );
  }
}
