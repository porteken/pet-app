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

  const [
    { data: petAvg, error: petAvgError },
    { data: petMax, error: petMaxError },
    { data: locations, error: locError },
    { data: percentiles_data, error: percentileError },
    { data: futurePetData, error: futurePetError },
    { data: petChangeData, error: petChangeError },
  ] = await Promise.all([
    supabase.from("pet_year_avg").select("location_id, pet").eq("year", year),
    supabase.from("pet_year_max").select("location_id, pet").eq("year", year),
    supabase.from("locations").select("location_id, city, state"),
    supabase
      .from("pet_percentiles")
      .select("location_id,year,p10,p90")
      .eq("year", year),
    supabase
      .from("pet_forecast")
      .select("location_id, lower, upper")
      .eq("year", 2100),
    supabase.from("pet_change").select("location_id, change"),
  ]);

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

  if (locError || !locations) {
    throw new DatabaseError(
      "Failed to fetch location data from database",
      locError
    );
  }

  if (percentileError || !percentiles_data) {
    throw new DatabaseError(
      "Failed to fetch percentiles from database",
      percentileError
    );
  }

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

  if (petChangeError || !petChangeData) {
    throw new DatabaseError(
      "Failed to fetch pet change data from database",
      petChangeError
    );
  }

  const changePerDecadeMap = new Map<number, number>(
    petChangeData.map(({ change, location_id }) => [
      location_id,
      Number(change),
    ])
  );
  const petMaxMap = new Map<number, number>(
    petMax.map(({ location_id, pet }) => [location_id, Number(pet)])
  );
  const locationMap = new Map<
    number,
    {
      city: string;
      state: string;
    }
  >(
    locations.map(({ city, location_id, state }) => [
      location_id,
      { city, state },
    ])
  );
  const percentileMap = new Map<number, { p10: number; p90: number }>(
    percentiles_data.map(({ location_id, p10, p90 }) => [
      location_id,
      { p10: Number(p10), p90: Number(p90) },
    ])
  );

  const combinedData = petAvg.flatMap(({ location_id, pet }) => {
    const location = locationMap.get(location_id);
    const maxPet = petMaxMap.get(location_id);
    const percentiles = percentileMap.get(location_id);

    if (!location || maxPet === undefined || !percentiles) {
      return [];
    }

    const futurePet = futurePetMap.get(location_id);

    return [
      {
        avg_pet: Number(pet),
        changePerDecade: changePerDecadeMap.get(location_id) ?? null,
        city: location.city,
        FutureValueLower: futurePet?.lower ?? null,
        FutureValueUpper: futurePet?.upper ?? null,
        location_id,
        max_pet: maxPet,
        p10: percentiles.p10,
        p90: percentiles.p90,
        state: location.state,
      },
    ];
  });

  const rankings = combinedData
    .toSorted((a, b) => b.avg_pet - a.avg_pet)
    .map((item, index) => ({
      ...item,
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

  const groupedByState = new Map<
    string,
    Array<{ key: number; title: string }>
  >();
  for (const { city, location_id, state } of locations) {
    const stateLocations = groupedByState.get(state);
    if (stateLocations) {
      stateLocations.push({ key: location_id, title: city });
    } else {
      groupedByState.set(state, [{ key: location_id, title: city }]);
    }
  }

  const LocationOptions: LocationOptionSection[] = [...groupedByState.entries()]
    .toSorted((a, b) => a[0].localeCompare(b[0]))
    .map(([state, stateLocations]) => ({
      items: stateLocations.toSorted((a, b) => a.title.localeCompare(b.title)),
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
