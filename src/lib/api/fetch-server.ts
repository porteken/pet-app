/* eslint-disable unicorn/no-null */
"use server";
import { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { createClient } from "@/config/supabase/server";
import { DatabaseError } from "@/lib/utils/errors";
import { calculateForecast } from "@/lib/utils/forecast";
import { SimpleLinearRegression } from "@/lib/utils/simple-linear-regression";
import {
  FetchLocationProperties,
  LocationOptionSection,
  ReferenceGraphDataProperties,
  TrendGraphDataProperties,
} from "@/types/types";
type HistoricalDataRecord = {
  location_id: any;
  pet: any;
  year: any;
};
const fetchTask = async (
  locationIdsInChunk: any[],
  supabase: SupabaseClient<any, "public", "public", any, any>
) => {
  const pageSize = 500;
  let allChunkData: HistoricalDataRecord[] = [];
  let page = 0;
  let moreDataExists = true;

  while (moreDataExists) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error: historicalError } = await supabase
      .from(`pet_year_avg`)
      .select("location_id, year, pet")

      .in("location_id", locationIdsInChunk)
      .order("year", { ascending: true })
      .range(from, to);

    if (historicalError) {
      throw new DatabaseError(
        "Failed to fetch historical data from database",
        historicalError
      );
    }

    if (data && data.length > 0) {
      allChunkData = [...allChunkData, ...data];

      if (data.length < pageSize) {
        moreDataExists = false;
      } else {
        page++;
      }
    } else {
      moreDataExists = false;
    }
  }
  return allChunkData;
};

export async function FetchCityRankings(year: number): Promise<
  Array<{
    avg_pet: number;
    changeFrom2000: null | number;
    city: string;
    FutureValueLower: null | number;
    FutureValueUpper: null | number;
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

  let historicalData: HistoricalDataRecord[] = [];

  const locationChunkSize = 1000;

  const promises = [];
  for (let index = 0; index < locations.length; index += locationChunkSize) {
    const locationChunk = locations.slice(index, index + locationChunkSize);
    const locationIdsInChunk = locationChunk.map(loc => loc.location_id);

    promises.push(fetchTask(locationIdsInChunk, supabase));
  }

  const historicalDataArrays = await Promise.all(promises);

  historicalData = historicalDataArrays.flat();

  const historicalByLocation = new Map<
    number,
    Array<{ pet: number; year: number }>
  >();
  for (const { location_id, pet, year: dataYear } of historicalData) {
    if (!historicalByLocation.has(location_id)) {
      historicalByLocation.set(location_id, []);
    }
    historicalByLocation.get(location_id)!.push({
      pet: Number(pet),
      year: dataYear,
    });
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

      const locationHistory = historicalByLocation.get(location_id);
      const { forecast2100Lower, forecast2100Upper } = calculate2100Forecast(
        locationHistory,
        year
      );

      return location && percentiles
        ? {
            avg_pet: avgPet,

            changeFrom2000: pet2000 === undefined ? null : avgPet - pet2000,
            city: location.city,
            FutureValueLower: forecast2100Lower,
            FutureValueUpper: forecast2100Upper,
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

function calculate2100Forecast(
  locationHistory: Array<{ pet: number; year: number }> | undefined,
  year: number
): {
  forecast2100Lower: null | number;

  forecast2100Upper: null | number;
} {
  let forecast2100Lower: null | number = null;

  let forecast2100Upper: null | number = null;

  if (locationHistory && locationHistory.length >= 2) {
    const years = locationHistory.map(d => d.year);

    const values = locationHistory.map(d => d.pet);

    const yearsAhead = 2100 - year;

    const forecastResult = calculateForecast(years, values, yearsAhead);

    const forecast2100Value = forecastResult.forecastValues.at(-1);

    const lower25 = forecastResult.lowerBound25.at(-1);

    const upper75 = forecastResult.upperBound75.at(-1);

    if (
      forecast2100Value !== undefined &&
      lower25 !== undefined &&
      upper75 !== undefined &&
      forecastResult.forecastValues.length > 0
    ) {
      forecast2100Lower = lower25;

      forecast2100Upper = upper75;

      return { forecast2100Lower, forecast2100Upper };
    }
  }

  if (locationHistory && locationHistory.length > 1) {
    const years = locationHistory.map(d => d.year);

    const values = locationHistory.map(d => d.pet);

    const regression = new SimpleLinearRegression(years, values);

    const { lowerBound, upperBound } = regression.predictWithConfidence(
      2100,

      0.5
    );

    forecast2100Lower = lowerBound;

    forecast2100Upper = upperBound;
  }

  return { forecast2100Lower, forecast2100Upper };
}
