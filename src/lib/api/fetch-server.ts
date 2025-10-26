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

export async function FetchCityRankings(
  year: number,
  measureType: "avg" | "max"
): Promise<
  Array<{
    changeFrom2000: null | number;
    city: string;
    location_id: number;
    p25: number;
    p75: number;
    pet: number;
    rank: number;
    state: string;
  }>
> {
  if (!year || Number.isNaN(year) || year < 2000 || year > 2100) {
    throw new DatabaseError(
      `Invalid year: ${year}. Must be between 2000 and 2100.`
    );
  }

  if (!measureType || !["avg", "max"].includes(measureType)) {
    throw new DatabaseError(
      `Invalid measureType: ${measureType}. Must be 'avg' or 'max'`
    );
  }

  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  // Fetch PET data for the specified year and measure type
  const { data: petData, error: petError } = await supabase
    .from(`pet_year_${measureType}`)
    .select("location_id, pet")
    .eq("year", year);

  if (petError || !petData) {
    throw new DatabaseError(
      "Failed to fetch PET ranking data from database",
      petError
    );
  }
  // eslint-disable-next-line no-console -- Debugging line
  console.log(`Found ${petData.length} PET data entries`);

  // Fetch PET data from year 2000 for comparison
  const { data: pet2000Data, error: pet2000Error } = await supabase
    .from(`pet_year_${measureType}`)
    .select("location_id, pet")
    .eq("year", 2000);

  if (pet2000Error || !pet2000Data) {
    throw new DatabaseError(
      "Failed to fetch PET data from year 2000 from database",
      pet2000Error
    );
  }

  // Create map of 2000 PET values by location_id
  const pet2000Map = new Map<number, number>();
  for (const { location_id, pet } of pet2000Data) {
    pet2000Map.set(location_id, Number(pet));
  }

  // Fetch location information
  const { data: locations, error: locError } = await supabase
    .from("locations")
    .select("location_id, city, state");

  if (locError || !locations) {
    throw new DatabaseError(
      "Failed to fetch location data from database",
      locError
    );
  }

  // Fetch all historical PET data for percentile calculation (per city)
  const { data: historicalData, error: histError } = await supabase
    .from(`pet_year_${measureType}`)
    .select("location_id, pet");

  if (histError || !historicalData) {
    throw new DatabaseError(
      "Failed to fetch historical PET data from database",
      histError
    );
  }

  // Calculate per-city percentiles from all historical data
  const cityPercentiles = new Map<number, { p25: number; p75: number }>();

  // Group historical data by location_id
  const dataByLocation: Record<number, number[]> = {};
  for (const { location_id, pet } of historicalData) {
    if (!dataByLocation[location_id]) {
      dataByLocation[location_id] = [];
    }
    dataByLocation[location_id].push(Number(pet));
  }

  // Calculate percentiles for each city
  for (const [locationId, petValues] of Object.entries(dataByLocation)) {
    const sorted = petValues.toSorted((a, b) => a - b);
    const p25Index = Math.floor(sorted.length * 0.25);
    const p75Index = Math.floor(sorted.length * 0.75);
    cityPercentiles.set(Number(locationId), {
      p25: sorted[p25Index],
      p75: sorted[p75Index],
    });
  }

  // Combine PET data with location information, percentiles, and change from 2000
  const combinedData = petData
    .map(({ location_id, pet }) => {
      const location = locations.find(loc => loc.location_id === location_id);
      const percentiles = cityPercentiles.get(location_id);
      const pet2000 = pet2000Map.get(location_id);
      const currentPet = Number(pet);

      return location && percentiles
        ? {
            // eslint-disable-next-line unicorn/no-null -- null needed for missing data
            changeFrom2000: pet2000 === undefined ? null : currentPet - pet2000,
            city: location.city,
            location_id,
            p25: percentiles.p25,
            p75: percentiles.p75,
            pet: currentPet,
            state: location.state,
          }
        : undefined;
    })
    .filter(Boolean);

  // eslint-disable-next-line no-console -- Debugging line
  console.log(`Combined data has ${combinedData.length} entries`);

  // Sort by PET descending and add rank
  const rankings = combinedData
    .toSorted((a, b) => b!.pet - a!.pet) // Sort by PET descending
    .map((item, index) => ({
      ...item!,
      rank: index + 1,
    }));

  // eslint-disable-next-line no-console -- Debugging line
  console.log(`Returning ${rankings.length} rankings`);

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
