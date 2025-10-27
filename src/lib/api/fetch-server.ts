/* eslint-disable unicorn/no-null */
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

export async function FetchCityRankings(year: number): Promise<
  Array<{
    avg_pet: number;
    changePerDecade: null | number;
    city: string;
    FutureValueLower: null | number;
    FutureValueUpper: null | number;
    location_id: number;
    max_pet: number;
    p10: number;
    p90: number;
    rank: number;
    state: string;
  }>
> {
  if (!year || Number.isNaN(year) || year < 2000 || year > 2100) {
    throw new DatabaseError(
      `Invalid year: ${year}. Must be between 2000 and 2100.`
    );
  }

  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { data: petAvg, error: petAvgError } = await supabase
    .from(`pet_year_avg`)
    .select("location_id, pet")
    .eq("year", year);
  const { data: petMax, error: petMaxError } = await supabase
    .from(`pet_year_max`)
    .select("location_id, pet")
    .eq("year", year);

  if (petAvgError || !petAvg) {
    throw new DatabaseError(
      "Failed to fetch PET average data from database",
      petAvgError
    );
  }
  if (petMaxError || !petMax) {
    throw new DatabaseError(
      "Failed to fetch PET max data from database",
      petMaxError
    );
  }

  const { data: locations, error: locError } = await supabase
    .from("locations")
    .select("location_id, city, state");

  if (locError || !locations) {
    throw new DatabaseError(
      "Failed to fetch location data from database",
      locError
    );
  }

  const { data: percentiles_data, error: percentileError } = await supabase
    .from(`pet_percentiles`)
    .select("location_id,year,p10,p90")
    .eq("year", year);
  if (percentileError || !percentiles_data) {
    throw new DatabaseError(
      "Failed to fetch percentiles from database",
      percentileError
    );
  }
  console.log(percentiles_data);

  const { data: futurePetData, error: futurePetError } = await supabase
    .from("pet_forecast")
    .select("location_id, lower, upper")
    .eq("year", 2100);
  if (futurePetError || !futurePetData) {
    throw new DatabaseError(
      "Failed to fetch future PET data from database",
      futurePetError
    );
  }

  const futurePetMap = new Map<number, { lower: number; upper: number }>();
  for (const { location_id, lower, upper } of futurePetData) {
    futurePetMap.set(location_id, {
      lower: Number(lower),
      upper: Number(upper),
    });
  }

  const { data: petChangeData, error: petChangeError } = await supabase
    .from("pet_change")
    .select("location_id, change");

  if (petChangeError || !petChangeData) {
    throw new DatabaseError(
      "Failed to fetch pet change data from database",
      petChangeError
    );
  }

  const changePerDecadeMap = new Map<number, number>();
  for (const { change, location_id } of petChangeData) {
    changePerDecadeMap.set(location_id, Number(change));
  }

  const combinedData = petAvg
    .map(({ location_id, pet }) => {
      const pet_max = petMax.find(loc => loc.location_id === location_id);
      const location = locations.find(loc => loc.location_id === location_id);
      const percentiles = percentiles_data.filter(
        loc => loc.location_id === location_id
      );
      const avgPet = Number(pet);
      const maxPet = Number(pet_max!.pet);

      const futurePet = futurePetMap.get(location_id);
      const forecast2100Lower = futurePet?.lower ?? null;
      const forecast2100Upper = futurePet?.upper ?? null;

      const changePerDecade = changePerDecadeMap.get(location_id) ?? null;

      return location && percentiles
        ? {
            avg_pet: avgPet,
            changePerDecade,
            city: location.city,
            FutureValueLower: forecast2100Lower,
            FutureValueUpper: forecast2100Upper,
            location_id,
            max_pet: maxPet,
            p10: percentiles[0].p10,
            p90: percentiles[0].p90,
            state: location.state,
          }
        : undefined;
    })
    .filter(Boolean);

  const rankings = combinedData
    .toSorted((a, b) => b!.avg_pet - a!.avg_pet)
    .map((item, index) => ({
      ...item!,
      rank: index + 1,
    }));

  return rankings;
}

export async function FetchLocations(): Promise<FetchLocationProperties> {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { data: locations, error } = await supabase.from("locations").select();

  if (error || !locations) {
    throw new DatabaseError(
      "Failed to fetch location data from database",
      error
    );
  }

  const states = [...new Set(locations.map(({ state }) => state))].toSorted(
    (a, b) => a.localeCompare(b)
  );

  const LocationOptions: LocationOptionSection[] = states.map(state => ({
    items: locations
      .filter(loc => loc.state === state)
      .toSorted((a, b) => a.city.localeCompare(b.city))
      .map(({ city, location_id }) => ({
        key: location_id,
        title: city,
      })),
    title: state,
  }));

  return { LocationOptions, locations };
}

export async function FetchReferenceGraphData(
  year: string,
  locationId: number
): Promise<ReferenceGraphDataProperties> {
  if (!locationId || Number.isNaN(locationId) || locationId <= 0) {
    throw new DatabaseError(`Invalid locationId: ${locationId}`);
  }

  if (!year || !/^\d{4}$/.test(year)) {
    throw new DatabaseError(
      `Invalid year format: ${year}. Must be a 4-digit year.`
    );
  }

  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

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
}

export async function FetchTrendGraphData(
  option: string,
  locationId: number
): Promise<TrendGraphDataProperties> {
  if (!locationId || Number.isNaN(locationId) || locationId <= 0) {
    return {
      increase_per_year: 0,
      trendline_pets: [],
      year_pets: [],
      years: [],
    };
  }

  if (!option || !["avg", "max"].includes(option)) {
    throw new DatabaseError(
      `Invalid option: ${option}. Must be 'avg' or 'max'`
    );
  }

  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

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

  if (years.length === 0 || year_pets.length === 0) {
    return {
      increase_per_year: 0,
      trendline_pets: [],
      year_pets: [],
      years: [],
    };
  }

  const reg = new SimpleLinearRegression(years, year_pets);
  const trendline_pets = years.map(
    (year: number) => Math.round(reg.predict(year) * 100) / 100
  );

  return { increase_per_year: reg.slope, trendline_pets, year_pets, years };
}
