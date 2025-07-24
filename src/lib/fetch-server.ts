"use server";
import { SimpleLinearRegression } from "ml-regression-simple-linear";
import { cookies } from "next/headers";

import {
  FetchLocationProperties,
  LocationOptionSection,
  ReferenceGraphDataProperties,
  TrendGraphDataProperties,
} from "../types/types";
import { DatabaseError } from "../utils/errors";
import { createClient } from "../utils/supabase/server";

export async function FetchLocations(): Promise<FetchLocationProperties> {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  try {
    const { data: locations, error } = await supabase
      .from("locations")
      .select();
    if (error || !locations) {
      console.error("Error fetching location data:", error);
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

      return { LocationOptions: LocationOptions, locations: locations };
    }
  } catch (error) {
    console.error("Error in FetchLocations:", error);
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
    console.error("Invalid locationId:", locationId);

    return { dates: [], pets: [] };
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
      console.error("Error fetching reference graph data server:", error);
      throw new DatabaseError(
        "Failed to fetch reference graph data from database",
        error
      );
    }

    const dates = data.map(({ date }: { date: string }) => new Date(date));
    const pets = data.map(({ pet }: { pet: number }) => Number(pet));

    return { dates, pets };
  } catch (error) {
    console.error("Error in FetchReferenceGraphData server:", error);
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
    console.error("Invalid locationId:", locationId);

    return { trendline_pets: [], year_pets: [], years: [] };
  }

  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  try {
    const { data, error } = await supabase
      .from(`pet_year_${option}`)
      .select()
      .eq("location_id", locationId);

    if (error || !data) {
      console.error("Error fetching trend graph data server:", error);
      throw new DatabaseError(
        "Failed to fetch trend graph data from database",
        error
      );
    }

    const years = data.map(({ year }: { year: number }) => year);
    const year_pets = data.map(({ pet }: { pet: number }) => Number(pet));

    const reg = new SimpleLinearRegression(years, year_pets);
    const trendline_pets = years.map(
      (year: number) => Math.round(reg.predict(year) * 100) / 100
    );

    return { trendline_pets, year_pets, years };
  } catch (error) {
    console.error("Error in FetchTrendGraphData server:", error);
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError(
      "Database connection failed while fetching trend data",
      error
    );
  }
}
