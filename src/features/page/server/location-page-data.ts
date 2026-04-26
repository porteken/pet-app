import { cookies } from "next/headers";

import {
  FetchLocations,
  FetchReferenceGraphData,
  FetchTrendGraphData,
} from "@/lib/api/fetch-server";
import {
  DEFAULT_REFERENCE_YEAR,
  DEFAULT_GRAPH_SEASON,
  DEFAULT_FORECAST_ENABLED,
  DEFAULT_FORECAST_YEARS_AHEAD,
  DEFAULT_GRAPH_MEASURE,
  FORECAST_ENABLED_COOKIE_NAME,
  FORECAST_YEARS_AHEAD_COOKIE_NAME,
  GRAPH_MEASURE_COOKIE_NAME,
  GRAPH_SEASON_COOKIE_NAME,
  REFERENCE_YEAR_COOKIE_NAME,
  MAX_FORECAST_YEARS_AHEAD,
  MIN_FORECAST_YEARS_AHEAD,
  normalizeGraphSeason,
  type GraphSeason,
} from "@/lib/constants";
import { getLatestCookieValue } from "@/lib/utils/server-cookies";
import { validateYear } from "@/lib/utils/validation";
import type { LocationOptionSection, LocationProperties } from "@/types/types";

import type { PageProperties } from "../model/types";

interface GraphData {
  dates: Date[];
  pets: number[];
  reference_pets: number[];
  trendline_pets: number[];
  year_pets: number[];
  years: number[];
}

interface LocationPageError {
  message: string;
  title: string;
}

type LocationPageLoadResult =
  | {
      payload: LocationPageError;
      status: "database-error";
    }
  | {
      payload: LocationPageError;
      status: "invalid-location";
    }
  | {
      payload: PageProperties;
      status: "success";
    };

interface LocationPagePreferences {
  initialForecastEnabled: boolean;
  initialForecastYearsAhead: number;
  initialGraphMeasure: string;
  initialGraphSeason: GraphSeason;
  initialReferenceYear: string;
}

const parseLocationId = (id: string): number | undefined => {
  const locationId = Number(id);
  if (!Number.isInteger(locationId) || locationId <= 0) {
    return undefined;
  }

  return locationId;
};

const getPreferencesFromCookies =
  async (): Promise<LocationPagePreferences> => {
    const cookieStore = await cookies();
    const initialGraphMeasure =
      getLatestCookieValue(cookieStore, GRAPH_MEASURE_COOKIE_NAME) ||
      DEFAULT_GRAPH_MEASURE;
    const initialGraphSeason = normalizeGraphSeason(
      getLatestCookieValue(cookieStore, GRAPH_SEASON_COOKIE_NAME) ||
        DEFAULT_GRAPH_SEASON,
    );
    const rawReferenceYear = getLatestCookieValue(
      cookieStore,
      REFERENCE_YEAR_COOKIE_NAME,
    );
    const initialReferenceYear =
      rawReferenceYear && validateYear(rawReferenceYear)
        ? rawReferenceYear
        : DEFAULT_REFERENCE_YEAR;
    const initialForecastEnabled =
      getLatestCookieValue(cookieStore, FORECAST_ENABLED_COOKIE_NAME) === "true"
        ? true
        : DEFAULT_FORECAST_ENABLED;

    const rawForecastYearsAhead = Number(
      getLatestCookieValue(cookieStore, FORECAST_YEARS_AHEAD_COOKIE_NAME),
    );
    const initialForecastYearsAhead =
      Number.isInteger(rawForecastYearsAhead) &&
      rawForecastYearsAhead >= MIN_FORECAST_YEARS_AHEAD &&
      rawForecastYearsAhead <= MAX_FORECAST_YEARS_AHEAD
        ? rawForecastYearsAhead
        : DEFAULT_FORECAST_YEARS_AHEAD;

    return {
      initialForecastEnabled,
      initialForecastYearsAhead,
      initialGraphMeasure,
      initialGraphSeason,
      initialReferenceYear,
    };
  };

const fetchGraphData = async (
  locationId: number,
  season: GraphSeason,
  referenceYear: string,
): Promise<GraphData> => {
  const trendData = await FetchTrendGraphData("avg", locationId, season);

  const latestYear =
    trendData.years.length > 0 ? String(trendData.years.at(-1)) : "2024";

  const [currentData, referenceData] = await Promise.all([
    FetchReferenceGraphData(latestYear, locationId, DEFAULT_GRAPH_SEASON),
    FetchReferenceGraphData(referenceYear, locationId, DEFAULT_GRAPH_SEASON),
  ]);

  return {
    dates: currentData.dates,
    pets: currentData.pets,
    reference_pets: referenceData.pets,
    trendline_pets: trendData.trendline_pets,
    year_pets: trendData.year_pets,
    years: trendData.years,
  };
};

const fetchLocationData = async (): Promise<
  | undefined
  | {
      LocationOptions: LocationOptionSection[];
      locations: LocationProperties[];
    }
> => {
  try {
    const result = await FetchLocations();
    return {
      LocationOptions: result.LocationOptions,
      locations: result.locations,
    };
  } catch {
    return undefined;
  }
};

const createDatabaseError = (
  title = "Database Connection Error",
  message = "Unable to connect to the database. Please try again later.",
): LocationPageError => ({
  message,
  title,
});

const createInvalidLocationError = (
  title = "Invalid location ID",
  message = "The provided location ID is not valid.",
): LocationPageError => ({
  message,
  title,
});

export const loadLocationPageData = async (
  rawLocationId: string,
): Promise<LocationPageLoadResult> => {
  const locationId = parseLocationId(rawLocationId);
  if (!locationId) {
    return {
      payload: createInvalidLocationError(),
      status: "invalid-location",
    };
  }

  const [preferences, locationData] = await Promise.all([
    getPreferencesFromCookies(),
    fetchLocationData(),
  ]);

  if (!locationData) {
    return {
      payload: createDatabaseError(),
      status: "database-error",
    };
  }

  const { LocationOptions, locations } = locationData;
  if (locations.length === 0) {
    return {
      payload: createDatabaseError(
        "No Data Available",
        "Location data could not be loaded. The database may be temporarily unavailable.",
      ),
      status: "database-error",
    };
  }

  const selectedLocation = locations.find(
    (location) => location.location_id === locationId,
  );
  if (!selectedLocation) {
    return {
      payload: createInvalidLocationError(
        "Location not found",
        "The requested location could not be found.",
      ),
      status: "invalid-location",
    };
  }

  try {
    const graphData = await fetchGraphData(
      locationId,
      preferences.initialGraphSeason,
      preferences.initialReferenceYear,
    );

    return {
      payload: {
        CurrentDates: graphData.dates,
        CurrentPets: graphData.pets,
        id: locationId,
        initialForecastEnabled: preferences.initialForecastEnabled,
        initialForecastYearsAhead: preferences.initialForecastYearsAhead,
        initialGraphMeasure: preferences.initialGraphMeasure,
        initialGraphSeason: preferences.initialGraphSeason,
        initialReferenceYear: preferences.initialReferenceYear,
        location: selectedLocation,
        LocationOptions,
        ReferencePets: graphData.reference_pets,
        TrendlinePets: graphData.trendline_pets,
        YearPets: graphData.year_pets,
        Years: graphData.years,
      },
      status: "success",
    };
  } catch {
    return {
      payload: createDatabaseError(),
      status: "database-error",
    };
  }
};
