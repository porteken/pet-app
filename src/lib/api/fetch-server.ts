"use server";
import { cookies } from "next/headers";

import { createClient } from "@/config/supabase/server";
import {
  mapReferenceRowsToGraphData,
  mapTrendRowsToGraphData,
} from "@/lib/api/graph-data";
import {
  formatSchemaValidationError,
  isSchemaValidationError,
  parseLocationRows,
  parseRankingChangeRows,
  parseRankingForecastRows,
  parseRankingLocationRows,
  parseRankingPercentileRows,
  parseRankingPetRows,
  parseReferenceGraphRows,
  parseTrendGraphRows,
} from "@/lib/api/schemas";
import { DatabaseError } from "@/lib/utils/errors";
import {
  FetchLocationProperties,
  LocationOptionSection,
  ReferenceGraphDataProperties,
  TrendGraphDataProperties,
} from "@/types/types";

export async function FetchCityRankings(year: number): Promise<
  Array<{
    avg_pet: number;
    changePerDecade: number | undefined;
    city: string;
    FutureValueLower: number | undefined;
    FutureValueUpper: number | undefined;
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

  const sanitizedPetAvg = filterRowsWithPositiveLocationId(petAvg);
  const sanitizedPetMax = filterRowsWithPositiveLocationId(petMax);
  const sanitizedLocations = filterRowsWithPositiveLocationId(locations);
  const sanitizedPercentiles =
    filterRowsWithPositiveLocationId(percentiles_data);
  const sanitizedFuturePetData =
    filterRowsWithPositiveLocationId(futurePetData);

  const validatedPetAvg = parseWithDatabaseError(
    "City rankings PET average",
    parseRankingPetRows,
    sanitizedPetAvg
  );
  const validatedPetMax = parseWithDatabaseError(
    "City rankings PET max",
    parseRankingPetRows,
    sanitizedPetMax
  );
  const validatedLocations = parseWithDatabaseError(
    "City rankings locations",
    parseRankingLocationRows,
    sanitizedLocations
  );
  const validatedPercentiles = parseWithDatabaseError(
    "City rankings percentiles",
    parseRankingPercentileRows,
    sanitizedPercentiles
  );
  const validatedFuturePetData = parseWithDatabaseError(
    "City rankings forecast",
    parseRankingForecastRows,
    sanitizedFuturePetData
  );

  const futurePetMap = new Map<number, { lower: number; upper: number }>();
  for (const { location_id, lower, upper } of validatedFuturePetData) {
    futurePetMap.set(location_id, {
      lower,
      upper,
    });
  }

  if (petChangeError || !petChangeData) {
    throw new DatabaseError(
      "Failed to fetch pet change data from database",
      petChangeError
    );
  }

  const sanitizedPetChangeData =
    filterRowsWithPositiveLocationId(petChangeData);
  const validatedPetChanges = parseWithDatabaseError(
    "City rankings PET change",
    parseRankingChangeRows,
    sanitizedPetChangeData
  );

  const changePerDecadeMap = new Map<number, number>(
    validatedPetChanges.map(({ change, location_id }) => [location_id, change])
  );
  const petMaxMap = new Map<number, number>(
    validatedPetMax.map(({ location_id, pet }) => [location_id, pet])
  );
  const locationMap = new Map<
    number,
    {
      city: string;
      state: string;
    }
  >(
    validatedLocations.map(({ city, location_id, state }) => [
      location_id,
      { city, state },
    ])
  );
  const percentileMap = new Map<number, { p10: number; p90: number }>(
    validatedPercentiles.map(({ location_id, p10, p90 }) => [
      location_id,
      { p10, p90 },
    ])
  );

  const combinedData = validatedPetAvg.flatMap(({ location_id, pet }) => {
    const location = locationMap.get(location_id);
    const maxPet = petMaxMap.get(location_id);
    const percentiles = percentileMap.get(location_id);

    if (!location || maxPet === undefined || !percentiles) {
      return [];
    }

    const futurePet = futurePetMap.get(location_id);

    return [
      {
        avg_pet: pet,
        changePerDecade: changePerDecadeMap.get(location_id) ?? undefined,
        city: location.city,
        FutureValueLower: futurePet?.lower ?? undefined,
        FutureValueUpper: futurePet?.upper ?? undefined,
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

  const sanitizedLocations = filterRowsWithPositiveLocationId(locations);
  const validatedLocations = parseWithDatabaseError(
    "Locations",
    parseLocationRows,
    sanitizedLocations
  );

  const groupedByState = new Map<
    string,
    Array<{ key: number; title: string }>
  >();
  for (const { city, location_id, state } of validatedLocations) {
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

  return { LocationOptions, locations: validatedLocations };
}

export async function FetchReferenceGraphData(
  year: string,
  locationId: number
): Promise<ReferenceGraphDataProperties> {
  if (!isValidLocationId(locationId)) {
    throw new DatabaseError(`Invalid locationId: ${locationId}`);
  }

  if (!isValidYear(year)) {
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
    .eq("year", year)
    .order("date", { ascending: true });

  if (error || !data) {
    throw new DatabaseError(
      "Failed to fetch reference graph data from database",
      error
    );
  }

  const validatedRows = parseWithDatabaseError(
    "Reference graph",
    parseReferenceGraphRows,
    data
  );

  return mapReferenceRowsToGraphData(validatedRows);
}

export async function FetchTrendGraphData(
  option: string,
  locationId: number
): Promise<TrendGraphDataProperties> {
  if (!isValidLocationId(locationId)) {
    throw new DatabaseError(`Invalid locationId: ${locationId}`);
  }

  if (!isValidTrendOption(option)) {
    throw new DatabaseError(
      `Invalid option: ${option}. Must be 'avg' or 'max'`
    );
  }

  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { data, error } = await supabase
    .from(`pet_year_${option}`)
    .select()
    .eq("location_id", locationId)
    .order("year", { ascending: true });

  if (error || !data) {
    throw new DatabaseError(
      "Failed to fetch trend graph data from database",
      error
    );
  }

  const validatedRows = parseWithDatabaseError(
    "Trend graph",
    parseTrendGraphRows,
    data
  );

  return mapTrendRowsToGraphData(validatedRows);
}

function filterRowsWithPositiveLocationId<
  T extends {
    location_id?: unknown;
  },
>(rows: T[]): T[] {
  return rows.filter(row => {
    const locationId = Number(row.location_id);
    return Number.isInteger(locationId) && locationId > 0;
  });
}

function isValidLocationId(locationId: number): boolean {
  return Number.isInteger(locationId) && locationId > 0;
}

function isValidTrendOption(option: string): boolean {
  return option === "avg" || option === "max";
}

function isValidYear(year: string): boolean {
  return /^\d{4}$/.test(year);
}

const parseWithDatabaseError = <T>(
  resource: string,
  parser: (payload: unknown) => T,
  payload: unknown
): T => {
  try {
    return parser(payload);
  } catch (error) {
    if (isSchemaValidationError(error)) {
      throw new DatabaseError(
        formatSchemaValidationError(resource, error),
        error
      );
    }

    throw error;
  }
};
