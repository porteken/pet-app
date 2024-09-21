"use server";
import {
  LocationProps,
  TrendGraphDataProps,
  ReferenceGraphDataProps,
  FetchLocationProps,
} from "./types";
import { createClient } from "../utils/supabase/server";
import { SimpleLinearRegression } from "ml-regression-simple-linear";

import { cookies } from "next/headers";
import { DropdownItemProps, DropdownSectionProps } from "@nextui-org/react";

export async function FetchLocations(): Promise<FetchLocationProps> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  try {
    const { data: locations, error } = await supabase
      .from("locations")
      .select();
    if (error || !locations) {
      console.error("Error fetching location data:", error);
      return { locations: [], LocationOptions: [] };
    } else {
      const states = [...new Set(locations.map(({ state }) => state))].sort();

      // Group locations by state for Select location dropdown
      const LocationOptions: Partial<
        DropdownSectionProps<DropdownItemProps>
      >[] = states.map((state) => ({
        title: state,
        items: locations
          .filter((loc) => loc.state === state)
          .map(({ location_id, city }) => ({
            key: location_id,
            title: city,
          })),
      }));
      return { locations: locations, LocationOptions: LocationOptions };
    }
  } catch (err) {
    console.error("Error in FetchLocations:", err);
    return { locations: [], LocationOptions: [] };
  }
}

// Fetch data for the reference graph
export async function FetchReferenceGraphData(
  year: string,
  locationId: number,
): Promise<ReferenceGraphDataProps> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  try {
    const { data, error } = await supabase
      .from("pet_year")
      .select()
      .eq("location_id", locationId)
      .eq("year", year);

    if (error || !data) {
      console.error("Error fetching reference graph data server:", error);
      return { dates: [], pets: [] };
    }

    const dates = data.map(({ date }: { date: string }) => new Date(date));
    const pets = data.map(({ pet }: { pet: number }) => Number(pet));

    return { dates, pets };
  } catch (err) {
    console.error("Error in FetchReferenceGraphData server:", err);
    return { dates: [], pets: [] };
  }
}

// Fetch data for the trend graph
export async function FetchTrendGraphData(
  option: string,
  locationId: number,
): Promise<TrendGraphDataProps> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const type = option === "avg" ? "Average" : "Max";
  try {
    const { data, error } = await supabase
      .from(`pet_year_${option}`)
      .select()
      .eq("location_id", locationId);

    if (error || !data) {
      console.error("Error fetching trend graph data server:", error);
      return { years: [], year_pets: [], trendline_pets: [] };
    }

    const years = data.map(({ year }: { year: number }) => year);
    const year_pets = data.map(({ pet }: { pet: number }) => Number(pet));

    const reg = new SimpleLinearRegression(years, year_pets);
    const trendline_pets = years.map(
      (year: number) => Math.round(reg.predict(year) * 100) / 100,
    );

    return { years, year_pets, trendline_pets };
  } catch (err) {
    console.error("Error in FetchTrendGraphData server:", err);
    return { years: [], year_pets: [], trendline_pets: [] };
  }
}
