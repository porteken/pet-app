import dynamic from "next/dynamic";
import { cookies } from "next/headers";

import { DatabaseError } from "@/components/ui/database-error";
import {
  FetchLocations,
  FetchReferenceGraphData,
  FetchTrendGraphData,
} from "@/lib/api/fetch-server";
import {
  DEFAULT_FORECAST_ENABLED,
  DEFAULT_FORECAST_YEARS_AHEAD,
  DEFAULT_GRAPH_MEASURE,
  FORECAST_ENABLED_COOKIE_NAME,
  FORECAST_YEARS_AHEAD_COOKIE_NAME,
  GRAPH_MEASURE_COOKIE_NAME,
  MAX_FORECAST_YEARS_AHEAD,
  MIN_FORECAST_YEARS_AHEAD,
} from "@/lib/constants";
import { FetchLocationProperties, LocationProperties } from "@/types/types";

const Page = dynamic(() => import("@/features/page/page-main"));

interface InvalidLocationErrorProperties {
  readonly message: string;
  readonly title: string;
}

export default async function LocationPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  const initialGraphMeasure =
    cookieStore.get(GRAPH_MEASURE_COOKIE_NAME)?.value || DEFAULT_GRAPH_MEASURE;
  const initialForecastEnabled =
    cookieStore.get(FORECAST_ENABLED_COOKIE_NAME)?.value === "true"
      ? true
      : DEFAULT_FORECAST_ENABLED;
  const initialForecastYearsAheadValue = Number(
    cookieStore.get(FORECAST_YEARS_AHEAD_COOKIE_NAME)?.value
  );
  const initialForecastYearsAhead =
    Number.isInteger(initialForecastYearsAheadValue) &&
    initialForecastYearsAheadValue >= MIN_FORECAST_YEARS_AHEAD &&
    initialForecastYearsAheadValue <= MAX_FORECAST_YEARS_AHEAD
      ? initialForecastYearsAheadValue
      : DEFAULT_FORECAST_YEARS_AHEAD;

  const { id } = await params;
  const locationId = await validateLocationId(id);

  if (!locationId) {
    return (
      <InvalidLocationError
        message="The provided location ID is not valid."
        title="Invalid location ID"
      />
    );
  }

  const [locationData, graphData] = await Promise.all([
    fetchLocationData(),
    fetchGraphData(locationId),
  ]);

  if (!locationData) {
    return (
      <DatabaseError
        message="Unable to connect to the database. Please try again later."
        title="Database Connection Error"
      />
    );
  }

  const { LocationOptions, locations } = locationData;
  if (!locations || locations.length === 0) {
    return (
      <DatabaseError
        message="Location data could not be loaded. The database may be temporarily unavailable."
        title="No Data Available"
      />
    );
  }

  const selectedLocation = locations.find(
    (loc: { location_id: number }) => loc.location_id === locationId
  );

  if (!selectedLocation) {
    return (
      <InvalidLocationError
        message="The requested location could not be found."
        title="Location not found"
      />
    );
  }

  return (
    <Page
      CurrentDates={graphData.dates}
      CurrentPets={graphData.pets}
      id={locationId}
      initialForecastEnabled={initialForecastEnabled}
      initialForecastYearsAhead={initialForecastYearsAhead}
      initialGraphMeasure={initialGraphMeasure}
      location={selectedLocation}
      LocationOptions={LocationOptions}
      ReferencePets={graphData.reference_pets}
      TrendlinePets={graphData.trendline_pets}
      YearPets={graphData.year_pets}
      Years={graphData.years}
    />
  );
}

async function fetchGraphData(locationId: number) {
  const trendData = await FetchTrendGraphData("avg", locationId);

  const latestYear =
    trendData.years.length > 0 ? String(trendData.years.at(-1)) : "2024";

  const [currentData, referenceData] = await Promise.all([
    FetchReferenceGraphData(latestYear, locationId),
    FetchReferenceGraphData("2000", locationId),
  ]);

  return {
    dates: currentData.dates,
    pets: currentData.pets,
    reference_pets: referenceData.pets,
    trendline_pets: trendData.trendline_pets,
    year_pets: trendData.year_pets,
    years: trendData.years,
  };
}

async function fetchLocationData(): Promise<
  | undefined
  | {
      LocationOptions: FetchLocationProperties["LocationOptions"];
      locations: LocationProperties[];
    }
> {
  try {
    const result = await FetchLocations();
    return {
      LocationOptions: result.LocationOptions,
      locations: result.locations,
    };
  } catch {
    return undefined;
  }
}

function InvalidLocationError({
  message,
  title,
}: InvalidLocationErrorProperties) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

async function validateLocationId(id: string): Promise<number | undefined> {
  const locationId = Number(id);
  if (Number.isNaN(locationId) || locationId <= 0) {
    return undefined;
  }
  return locationId;
}
