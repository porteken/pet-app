"use server";
import { DropdownItemProps, DropdownSectionProps } from "@heroui/react";
import { SimpleLinearRegression } from "ml-regression-simple-linear";
import { cookies } from "next/headers";

import {
  TrendGraphDataProps,
  ReferenceGraphDataProps,
  FetchLocationProps,
} from "../types/types";
import { createClient } from "../utils/supabase/server";
import { DatabaseError } from "../utils/errors";

export async function FetchLocations(): Promise<FetchLocationProps> {
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

      const LocationOptions: Partial<
        DropdownSectionProps<DropdownItemProps>
      >[] = states.map(state => ({
        title: state,
        items: locations
          .filter(loc => loc.state === state)
          .sort((a, b) => a.city.localeCompare(b.city))
          .map(({ location_id, city }) => ({
            key: location_id,
            title: city,
          })),
      }));

      return { locations: locations, LocationOptions: LocationOptions };
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
): Promise<ReferenceGraphDataProps> {
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
): Promise<TrendGraphDataProps> {
  if (!locationId || Number.isNaN(locationId) || locationId <= 0) {
    console.error("Invalid locationId:", locationId);

    return { years: [], year_pets: [], trendline_pets: [] };
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

    return { years, year_pets, trendline_pets };
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
