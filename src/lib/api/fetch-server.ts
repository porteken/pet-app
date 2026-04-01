"use server";
import { cookies } from "next/headers";
import { cache } from "react";

import { createClient } from "@/config/supabase/server";
import {
  mapReferenceRowsToGraphData,
  mapTrendRowsToGraphData,
} from "@/lib/api/graph-data";
import {
  formatSchemaValidationError,
  isSchemaValidationError,
  parseLocationRows,
  parseRankingViewRows,
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

function assertQueryData<T>(
  label: string,
  data: T | null,
  error: unknown,
): asserts data is T {
  if (error || !data) {
    throw new DatabaseError(`Failed to fetch ${label} from database`, error);
  }
}

export async function FetchCityRankings(year: number): Promise<
  Array<{
    avg_pet: number;
    changePerDecade: number | undefined;
    city: string;
    FutureValueLower: number | undefined;
    FutureValueUpper: number | undefined;
    location_id: number;
    max_pet: number | undefined;
    p10: number | undefined;
    p90: number | undefined;
    rank: number;
    state: string;
  }>
> {
  if (!year || Number.isNaN(year) || year < 2000 || year > 2100) {
    throw new DatabaseError(
      `Invalid year: ${year}. Must be between 2000 and 2100.`,
    );
  }

  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { data, error } = await supabase
    .from("city_rankings_view")
    .select(
      "avg_pet, change_per_decade, city, future_lower, future_upper, location_id, max_pet, p10, p90, state, year",
    )
    .eq("year", year);

  assertQueryData("city rankings", data, error);

  const validatedRows = parseWithDatabaseError(
    "City rankings view",
    parseRankingViewRows,
    data,
  );

  const rankings = validatedRows
    .toSorted((a, b) => b.avg_pet - a.avg_pet)
    .map((row, index) => ({
      avg_pet: row.avg_pet,
      changePerDecade: row.change_per_decade ?? undefined,
      city: row.city,
      FutureValueLower: row.future_lower ?? undefined,
      FutureValueUpper: row.future_upper ?? undefined,
      location_id: row.location_id,
      max_pet: row.max_pet ?? undefined,
      p10: row.p10 ?? undefined,
      p90: row.p90 ?? undefined,
      rank: index + 1,
      state: row.state,
    }));

  return rankings;
}

export const FetchLocations = cache(
  async (): Promise<FetchLocationProperties> => {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    const { data: locations, error } = await supabase
      .from("locations")
      .select("city, lat, lng, location_id, state");

    if (error || !locations) {
      throw new DatabaseError(
        "Failed to fetch location data from database",
        error,
      );
    }

    const sanitizedLocations = filterRowsWithPositiveLocationId(locations);
    const validatedLocations = parseWithDatabaseError(
      "Locations",
      parseLocationRows,
      sanitizedLocations,
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

    const LocationOptions: LocationOptionSection[] = [
      ...groupedByState.entries(),
    ]
      .toSorted((a, b) => a[0].localeCompare(b[0]))
      .map(([state, stateLocations]) => ({
        items: stateLocations.toSorted((a, b) =>
          a.title.localeCompare(b.title),
        ),
        title: state,
      }));

    return { LocationOptions, locations: validatedLocations };
  },
);

export async function FetchReferenceGraphData(
  year: string,
  locationId: number,
): Promise<ReferenceGraphDataProperties> {
  if (!isValidLocationId(locationId)) {
    throw new DatabaseError(`Invalid locationId: ${locationId}`);
  }

  if (!isValidYear(year)) {
    throw new DatabaseError(
      `Invalid year format: ${year}. Must be a 4-digit year.`,
    );
  }

  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { data, error } = await supabase
    .from("pet_year")
    .select("date, location_id, pet, year")
    .eq("location_id", locationId)
    .eq("year", year)
    .order("date", { ascending: true });

  if (error || !data) {
    throw new DatabaseError(
      "Failed to fetch reference graph data from database",
      error,
    );
  }

  const validatedRows = parseWithDatabaseError(
    "Reference graph",
    parseReferenceGraphRows,
    data,
  );

  return mapReferenceRowsToGraphData(validatedRows);
}

export async function FetchTrendGraphData(
  option: string,
  locationId: number,
): Promise<TrendGraphDataProperties> {
  if (!isValidLocationId(locationId)) {
    throw new DatabaseError(`Invalid locationId: ${locationId}`);
  }

  if (!isValidTrendOption(option)) {
    throw new DatabaseError(
      `Invalid option: ${option}. Must be 'avg' or 'max'`,
    );
  }

  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { data, error } = await supabase
    .from(`pet_year_${option}`)
    .select("location_id, pet, year")
    .eq("location_id", locationId)
    .order("year", { ascending: true });

  if (error || !data) {
    throw new DatabaseError(
      "Failed to fetch trend graph data from database",
      error,
    );
  }

  const validatedRows = parseWithDatabaseError(
    "Trend graph",
    parseTrendGraphRows,
    data,
  );

  return mapTrendRowsToGraphData(validatedRows);
}

function filterRowsWithPositiveLocationId<
  T extends {
    location_id?: unknown;
  },
>(rows: T[]): T[] {
  return rows.filter((row) => {
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
  payload: unknown,
): T => {
  try {
    return parser(payload);
  } catch (error) {
    if (isSchemaValidationError(error)) {
      throw new DatabaseError(
        formatSchemaValidationError(resource, error),
        error,
      );
    }

    throw error;
  }
};
