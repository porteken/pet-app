import { shouldUseRuntimeDbMocks } from "@/config/environment";
import { getRuntimeMockTableRows } from "@/testing/runtime-mocks";
import { sql } from "kysely";

import { getDb } from "./kysely";

import type { NumericLike } from "./types";
import type { GraphSeason } from "@/lib/constants";

export type TrendMetricOption = "avg" | "max";
type LocationIdentifierColumn = "id" | "location_id";

export interface ForecastQueryWindow {
  lastHistoricalYear: number;
  targetYear: number;
}

interface TrendGraphRow {
  location_id: number;
  pet: NumericLike;
  year: number;
}

const isMissingColumnError = (
  error: unknown,
  relationName: string,
  columnName: string,
) => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const code = "code" in error ? error.code : undefined;
  const message = "message" in error ? error.message : undefined;

  if (typeof message !== "string") {
    return false;
  }

  if (code === "PGRST204") {
    return (
      message.includes(`'${columnName}'`) &&
      message.includes(`'${relationName}'`)
    );
  }

  return (
    code === "42703" &&
    message.includes(columnName) &&
    (message.includes(relationName) ||
      message.includes(`${relationName}.${columnName}`) ||
      message.includes(`"${columnName}"`))
  );
};

const sortBy = <TRow extends object>(
  rows: TRow[],
  column: keyof TRow,
  ascending = true,
) =>
  rows.toSorted((left, right) => {
    const leftValue = left[column] as unknown;
    const rightValue = right[column] as unknown;

    if (leftValue === rightValue) {
      return 0;
    }

    if (typeof leftValue === "number" && typeof rightValue === "number") {
      return ascending ? leftValue - rightValue : rightValue - leftValue;
    }

    return ascending
      ? String(leftValue).localeCompare(String(rightValue))
      : String(rightValue).localeCompare(String(leftValue));
  });

const getTrendMetricColumn = (option: TrendMetricOption) =>
  option === "max" ? "max_pet" : "avg_pet";

const getRuntimeCityRankingsRows = (year: number, season?: GraphSeason) => {
  const rows = getRuntimeMockTableRows("city_rankings_view");

  return rows.filter(
    (row) =>
      row.year === year && (season === undefined || row.season === season),
  );
};

const getRuntimeLocationRows = (column: LocationIdentifierColumn) => {
  const rows = getRuntimeMockTableRows("locations");

  return rows.map((row) => ({
    city: row.city,
    lat: row.lat,
    lng: row.lng,
    [column]: row[column],
    state: row.state,
  }));
};

const getRuntimeTrendRows = (
  locationId: number,
  option: TrendMetricOption,
  season?: GraphSeason,
) => {
  const rows = getRuntimeMockTableRows("pet_year_stats");
  const metricColumn = getTrendMetricColumn(option);

  return sortBy(
    rows
      .filter(
        (row) =>
          row.location_id === locationId &&
          (season === undefined || row.season === season),
      )
      .map<TrendGraphRow>((row) => ({
        location_id: row.location_id,
        pet: row[metricColumn],
        year: row.year,
      })),
    "year",
  );
};

const getRuntimeReferenceRows = (locationId: number, year: string) => {
  const start = `${year}-01-01`;
  const end = `${Number(year) + 1}-01-01`;
  const rows = getRuntimeMockTableRows("pet");

  return sortBy(
    rows.filter(
      (row) =>
        row.location_id === locationId && row.date >= start && row.date < end,
    ),
    "date",
  );
};

const getRuntimeHistoricalYearRow = (
  locationId: number,
  season?: GraphSeason,
) => {
  const rows = getRuntimeMockTableRows("pet_year_stats");
  const [row] = sortBy(
    rows.filter(
      (item) =>
        item.location_id === locationId &&
        (season === undefined || item.season === season),
    ),
    "year",
    false,
  );

  return row ? { year: row.year } : undefined;
};

const buildLocationRowsQuery = (selectedColumn: LocationIdentifierColumn) =>
  getDb()
    .selectFrom("locations")
    .select(
      selectedColumn === "id"
        ? ["city", "lat", "lng", "id", "state"]
        : ["city", "lat", "lng", "location_id", "state"],
    );

const getRuntimeForecastRows = (
  locationId: number,
  queryWindow: ForecastQueryWindow,
  season?: GraphSeason,
  option: TrendMetricOption = "avg",
) => {
  const table = option === "max" ? "pet_forecast_max" : "pet_forecast";
  const rows = getRuntimeMockTableRows(table);

  return sortBy(
    rows.filter(
      (row) =>
        row.location_id === locationId &&
        row.year > queryWindow.lastHistoricalYear &&
        row.year <= queryWindow.targetYear &&
        (season === undefined || row.season === season),
    ),
    "year",
  );
};

export async function fetchCityRankingsRows(
  year: number,
  season?: GraphSeason,
) {
  if (shouldUseRuntimeDbMocks()) {
    return getRuntimeCityRankingsRows(year, season);
  }

  const buildQuery = (selectedSeason?: GraphSeason) => {
    let query = getDb()
      .selectFrom("city_rankings_view")
      .select([
        "avg_pet",
        "change_from_2000",
        "city",
        "future_lower",
        "future_upper",
        "location_id",
        "max_pet",
        "p10",
        "p90",
        "state",
        "year",
      ])
      .where("year", "=", year);

    if (selectedSeason !== undefined) {
      query = query.where("season", "=", selectedSeason);
    }

    return query;
  };

  try {
    return await buildQuery(season).execute();
  } catch (error) {
    if (
      season !== undefined &&
      isMissingColumnError(error, "city_rankings_view", "season")
    ) {
      return buildQuery().execute();
    }

    throw error;
  }
}

export async function fetchLocationRows(column: LocationIdentifierColumn) {
  if (shouldUseRuntimeDbMocks()) {
    return getRuntimeLocationRows(column);
  }

  try {
    return await buildLocationRowsQuery(column).execute();
  } catch (error) {
    if (column === "id" && isMissingColumnError(error, "locations", "id")) {
      return buildLocationRowsQuery("location_id").execute();
    }

    throw error;
  }
}

export async function fetchTrendGraphRows(
  locationId: number,
  option: TrendMetricOption,
  season?: GraphSeason,
) {
  if (shouldUseRuntimeDbMocks()) {
    return getRuntimeTrendRows(locationId, option, season);
  }

  const metricColumn = getTrendMetricColumn(option);
  const buildQuery = (selectedSeason?: GraphSeason) => {
    let query = getDb()
      .selectFrom("pet_year_stats")
      .select(({ ref }) => ["location_id", "year", ref(metricColumn).as("pet")])
      .where("location_id", "=", locationId);

    if (selectedSeason !== undefined) {
      query = query.where("season", "=", selectedSeason);
    }

    return query.orderBy("year", "asc");
  };

  try {
    return await buildQuery(season).execute();
  } catch (error) {
    if (
      season !== undefined &&
      isMissingColumnError(error, "pet_year_stats", "season")
    ) {
      return buildQuery().execute();
    }

    throw error;
  }
}

export async function fetchReferenceGraphRows(
  locationId: number,
  year: string,
) {
  if (shouldUseRuntimeDbMocks()) {
    return getRuntimeReferenceRows(locationId, year);
  }

  return getDb()
    .selectFrom("pet")
    .select(({ ref }) => [
      sql<string>`cast(${ref("date")} as text)`.as("date"),
      "location_id",
      "pet",
    ])
    .where("location_id", "=", locationId)
    .where("date", ">=", `${year}-01-01`)
    .where("date", "<", `${Number(year) + 1}-01-01`)
    .orderBy("date", "asc")
    .execute();
}

export async function fetchHistoricalYearRow(
  locationId: number,
  season?: GraphSeason,
) {
  if (shouldUseRuntimeDbMocks()) {
    return getRuntimeHistoricalYearRow(locationId, season);
  }

  const buildQuery = (selectedSeason?: GraphSeason) => {
    let query = getDb()
      .selectFrom("pet_year_stats")
      .select("year")
      .where("location_id", "=", locationId);

    if (selectedSeason !== undefined) {
      query = query.where("season", "=", selectedSeason);
    }

    return query.orderBy("year", "desc").limit(1);
  };

  try {
    return await buildQuery(season).executeTakeFirst();
  } catch (error) {
    if (
      season !== undefined &&
      isMissingColumnError(error, "pet_year_stats", "season")
    ) {
      return buildQuery().executeTakeFirst();
    }

    throw error;
  }
}

export async function fetchForecastRows(
  locationId: number,
  queryWindow: ForecastQueryWindow,
  season?: GraphSeason,
  option: TrendMetricOption = "avg",
) {
  if (shouldUseRuntimeDbMocks()) {
    return getRuntimeForecastRows(locationId, queryWindow, season, option);
  }

  const table = option === "max" ? "pet_forecast_max" : "pet_forecast";

  const buildQuery = (selectedSeason?: GraphSeason) => {
    let query = getDb()
      .selectFrom(table)
      .select(["year", "pet", "lower", "upper"])
      .where("location_id", "=", locationId)
      .where("year", ">", queryWindow.lastHistoricalYear)
      .where("year", "<=", queryWindow.targetYear);

    if (selectedSeason !== undefined) {
      query = query.where("season", "=", selectedSeason);
    }

    return query.orderBy("year", "asc");
  };

  try {
    return await buildQuery(season).execute();
  } catch (error) {
    if (season !== undefined && isMissingColumnError(error, table, "season")) {
      return buildQuery().execute();
    }

    throw error;
  }
}
