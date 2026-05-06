"use server";
import { createClient } from "@/config/supabase/server";
import {
  filterReferenceRowsBySeason,
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
import {
  DEFAULT_GRAPH_SEASON,
  type GraphSeason,
  normalizeGraphSeason,
} from "@/lib/constants";
import { DatabaseError } from "@/lib/utils/errors";
import {
  validateLocationId,
  validateTrendOption,
  validateYear,
} from "@/lib/utils/validation";
import { cookies } from "next/headers";
import { cache } from "react";

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;
import type {
  FetchLocationProperties,
  LocationOptionSection,
  ReferenceGraphDataProperties,
  TrendGraphDataProperties,
} from "@/types/types";

interface LocationQueryRow {
  city: string;
  id?: unknown;
  lat: unknown;
  lng: unknown;
  location_id?: unknown;
  state: string;
}

const CITY_RANKINGS_COLUMNS =
  "avg_pet, change_from_2000, city, future_lower, future_upper, location_id, max_pet, p10, p90, state, year";

function assertQueryData<T>(
  label: string,
  data: T | null,
  error: unknown,
): asserts data is T {
  if (error || !data) {
    throw new DatabaseError(`Failed to fetch ${label} from database`, error);
  }
}

export async function FetchCityRankings(
  year: number,
  season: GraphSeason = DEFAULT_GRAPH_SEASON,
): Promise<
  Array<{
    avg_pet: number;
    changeFrom2000: number | undefined;
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
  const resolvedSeason = normalizeGraphSeason(season);

  if (!year || Number.isNaN(year) || year < MIN_YEAR || year > MAX_YEAR) {
    throw new DatabaseError(
      `Invalid year: ${year}. Must be between ${MIN_YEAR} and ${MAX_YEAR}.`,
    );
  }

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data, error } = await fetchCityRankingsRows(
    supabase,
    year,
    resolvedSeason,
  );

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
      changeFrom2000: row.change_from_2000 ?? undefined,
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

async function fetchCityRankingsRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  year: number,
  season: GraphSeason,
) {
  const primaryQuery = await supabase
    .from("city_rankings_view")
    .select(CITY_RANKINGS_COLUMNS)
    .eq("year", year)
    .eq("season", season);

  if (!isMissingCityRankingsSeasonColumnError(primaryQuery.error)) {
    return primaryQuery;
  }

  return supabase
    .from("city_rankings_view")
    .select(CITY_RANKINGS_COLUMNS)
    .eq("year", year);
}

export const FetchLocations = cache(
  async (): Promise<FetchLocationProperties> => {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const locations = await fetchLocationRows(supabase);

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

async function fetchLocationRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const primaryQuery = await supabase
    .from("locations")
    .select("city, lat, lng, id, state");

  const fallbackQuery = isMissingLocationColumnError(primaryQuery.error)
    ? await supabase
        .from("locations")
        .select("city, lat, lng, location_id, state")
    : primaryQuery;

  if (fallbackQuery.error || !fallbackQuery.data) {
    throw new DatabaseError(
      "Failed to fetch location data from database",
      fallbackQuery.error,
    );
  }

  return fallbackQuery.data.map(normalizeLocationRow);
}

function normalizeLocationRow({
  id,
  location_id,
  ...location
}: LocationQueryRow) {
  return {
    ...location,
    location_id: id ?? location_id,
  };
}

function isMissingLocationColumnError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const code = "code" in error ? error.code : undefined;
  const message = "message" in error ? error.message : undefined;

  return (
    code === "42703" &&
    typeof message === "string" &&
    message.includes("column locations.id does not exist")
  );
}

function isMissingCityRankingsSeasonColumnError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const code = "code" in error ? error.code : undefined;
  const message = "message" in error ? error.message : undefined;

  if (typeof message !== "string") {
    return false;
  }

  return (
    (code === "42703" &&
      message.includes("column city_rankings_view.season does not exist")) ||
    (code === "PGRST204" &&
      message.includes("'season'") &&
      message.includes("'city_rankings_view'"))
  );
}

export async function FetchReferenceGraphData(
  year: string,
  locationId: number,
  season: GraphSeason = DEFAULT_GRAPH_SEASON,
): Promise<ReferenceGraphDataProperties> {
  const resolvedSeason = normalizeGraphSeason(season);

  if (!validateLocationId(locationId)) {
    throw new DatabaseError(`Invalid locationId: ${locationId}`);
  }

  if (!validateYear(year)) {
    throw new DatabaseError(
      `Invalid year format: ${year}. Must be a 4-digit year.`,
    );
  }

  const cookieStore = await cookies();
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

  return mapReferenceRowsToGraphData(
    filterReferenceRowsBySeason(validatedRows, resolvedSeason),
  );
}

export async function FetchTrendGraphData(
  option: string,
  locationId: number,
  season: GraphSeason = DEFAULT_GRAPH_SEASON,
): Promise<TrendGraphDataProperties> {
  const resolvedSeason = normalizeGraphSeason(season);

  if (!validateLocationId(locationId)) {
    throw new DatabaseError(`Invalid locationId: ${locationId}`);
  }

  if (!validateTrendOption(option)) {
    throw new DatabaseError(
      `Invalid option: ${option}. Must be 'avg' or 'max'`,
    );
  }

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data, error } = await supabase
    .from(`pet_year_${option}`)
    .select("location_id, pet, year")
    .eq("location_id", locationId)
    .eq("season", resolvedSeason)
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
