import dynamic from "next/dynamic";
import { cookies } from "next/headers";

import { DatabaseError } from "@/features/database-error";
import {
  FetchLocations,
  FetchReferenceGraphData,
  FetchTrendGraphData,
} from "@/lib/api/fetch-server";
import { FetchLocationProperties, LocationProperties } from "@/types/types";

const graphMeasureCookieName = "graph-measure";
const defaultGraphMeasure = "avg";

const Page = dynamic(() => import("@/features/page/page-main"));

interface InvalidLocationErrorProperties {
  message: string;
  title: string;
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  const initialGraphMeasure =
    cookieStore.get(graphMeasureCookieName)?.value || defaultGraphMeasure;

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

  const locationData = await fetchLocationData();
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

  const graphData = await fetchGraphData(locationId);

  return (
    <Page
      CurrentDates={graphData.dates}
      CurrentPets={graphData.pets}
      id={locationId}
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
  const [currentData, referenceData, trendData] = await Promise.all([
    FetchReferenceGraphData("2023", locationId),
    FetchReferenceGraphData("2000", locationId),
    FetchTrendGraphData("avg", locationId),
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
