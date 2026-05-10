"use server";

import {
  filterReferenceRowsBySeason,
  mapReferenceRowsToGraphData,
  mapTrendRowsToGraphData,
} from "@/lib/api/graph-data";
import {
  formatSchemaValidationError,
  isSchemaValidationError,
  parseForecastRows,
  parseHistoricalYearRows,
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
import {
  fetchCityRankingsRows,
  fetchForecastRows,
  fetchHistoricalYearRow,
  fetchLocationRows,
  fetchReferenceGraphRows,
  fetchTrendGraphRows,
} from "@/lib/db/queries";
import { DatabaseError } from "@/lib/utils/errors";
import {
  validateLocationId,
  validateTrendOption,
  validateYear,
} from "@/lib/utils/validation";
import { cache } from "react";

import type {
  FetchLocationProperties,
  LocationOptionSection,
  ReferenceGraphDataProperties,
  TrendGraphDataProperties,
} from "@/types/types";

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

interface LocationQueryRow {
  city: unknown;
  id?: unknown;
  lat: unknown;
  lng: unknown;
  location_id?: unknown;
  state: unknown;
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

  let rows;
  try {
    rows = await fetchCityRankingsRows(year, resolvedSeason);
  } catch (error) {
    throw new DatabaseError(
      "Failed to fetch city rankings from database",
      error,
    );
  }

  const validatedRows = parseWithDatabaseError(
    "City rankings view",
    parseRankingViewRows,
    rows,
  );

  return validatedRows
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
}

export const FetchLocations = cache(
  async (): Promise<FetchLocationProperties> => {
    let locations;
    try {
      locations = await fetchLocationRows("id");
    } catch (error) {
      throw new DatabaseError(
        "Failed to fetch location data from database",
        error,
      );
    }

    const normalizedLocations = locations.map(normalizeLocationRow);
    const sanitizedLocations =
      filterRowsWithNonNegativeLocationId(normalizedLocations);
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

export async function FetchForecastData(
  locationId: number,
  yearsAhead: number,
  season: GraphSeason = DEFAULT_GRAPH_SEASON,
  option: string = "avg",
): Promise<
  | undefined
  | {
      forecastValues: number[];
      forecastYears: number[];
      lowerBound10: number[];
      upperBound90: number[];
    }
> {
  if (!validateLocationId(locationId)) {
    throw new DatabaseError(`Invalid locationId: ${locationId}`);
  }

  if (!validateTrendOption(option)) {
    throw new DatabaseError(`Invalid trend option: ${option}`);
  }

  const resolvedSeason = normalizeGraphSeason(season);

  let historicalData;
  try {
    historicalData = await fetchHistoricalYearRow(locationId, resolvedSeason);
  } catch (error) {
    throw new DatabaseError(
      "Failed to fetch forecast data from database",
      error,
    );
  }

  if (!historicalData) {
    return undefined;
  }

  const validatedHistoricalData = parseWithDatabaseError(
    "Historical year",
    parseHistoricalYearRows,
    [historicalData],
  );
  const firstHistorical = validatedHistoricalData[0];
  if (!firstHistorical) {
    return undefined;
  }

  const queryWindow = {
    lastHistoricalYear: firstHistorical.year,
    targetYear: firstHistorical.year + yearsAhead,
  };

  let forecastRows;
  try {
    forecastRows = await fetchForecastRows(
      locationId,
      queryWindow,
      resolvedSeason,
      option,
    );
  } catch (error) {
    throw new DatabaseError(
      "Failed to fetch forecast data from database",
      error,
    );
  }

  const validatedForecastRows = parseWithDatabaseError(
    "Forecast",
    parseForecastRows,
    forecastRows,
  );

  if (validatedForecastRows.length === 0) {
    return undefined;
  }

  return {
    forecastValues: validatedForecastRows.map(({ pet }) => pet),
    forecastYears: validatedForecastRows.map(({ year }) => year),
    lowerBound10: validatedForecastRows.map(({ lower }) => lower),
    upperBound90: validatedForecastRows.map(({ upper }) => upper),
  };
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

  let rows;
  try {
    rows = await fetchReferenceGraphRows(locationId, year);
  } catch (error) {
    throw new DatabaseError(
      "Failed to fetch reference graph data from database",
      error,
    );
  }

  const validatedRows = parseWithDatabaseError(
    "Reference graph",
    parseReferenceGraphRows,
    rows,
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

  let rows;
  try {
    rows = await fetchTrendGraphRows(locationId, option, resolvedSeason);
  } catch (error) {
    throw new DatabaseError(
      "Failed to fetch trend graph data from database",
      error,
    );
  }

  const validatedRows = parseWithDatabaseError(
    "Trend graph",
    parseTrendGraphRows,
    rows,
  );

  return mapTrendRowsToGraphData(validatedRows);
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

function filterRowsWithNonNegativeLocationId<
  T extends {
    location_id?: unknown;
  },
>(rows: T[]): T[] {
  return rows.filter((row) => {
    const locationId = Number(row.location_id);
    return Number.isInteger(locationId) && locationId >= 0;
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
