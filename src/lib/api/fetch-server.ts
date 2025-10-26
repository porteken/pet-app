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
    changeFrom2000: null | number;
    city: string;
    FutureValue: null | number;
    location_id: number;
    max_pet: number;
    p25: number;
    p75: number;
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
      petAvgError
    );
  }

  const { data: pet2000Data, error: pet2000Error } = await supabase
    .from(`pet_year_avg`)
    .select("location_id, pet")
    .eq("year", 2000);

  if (pet2000Error || !pet2000Data) {
    throw new DatabaseError(
      "Failed to fetch PET data from year 2000 from database",
      pet2000Error
    );
  }

  const pet2000Map = new Map<number, number>();
  for (const { location_id, pet } of pet2000Data) {
    pet2000Map.set(location_id, Number(pet));
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
    .select("location_id,year,p25,p75")
    .eq("year", year);
  if (percentileError || !percentiles_data) {
    throw new DatabaseError(
      "Failed to fetch percentiles from database",
      percentileError
    );
  }

  const combinedData = petAvg
    .map(({ location_id, pet }) => {
      const pet_max = petMax.find(loc => loc.location_id === location_id);
      const location = locations.find(loc => loc.location_id === location_id);
      const percentiles = percentiles_data.filter(
        loc => loc.location_id === location_id
      );
      const pet2000 = pet2000Map.get(location_id);
      const avgPet = Number(pet);
      const maxPet = Number(pet_max!.pet);

      return location && percentiles
        ? {
            avg_pet: avgPet,
            // eslint-disable-next-line unicorn/no-null
            changeFrom2000: pet2000 === undefined ? null : avgPet - pet2000,
            city: location.city,
            FutureValue:
              pet2000 === undefined
                ? // eslint-disable-next-line unicorn/no-null
                  null
                : ((avgPet - pet2000) / (year - 2000)) * (2100 - year) + avgPet,
            location_id,
            max_pet: maxPet,
            p25: percentiles[0].p25,
            p75: percentiles[0].p75,
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
