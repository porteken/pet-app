import dynamic from "next/dynamic";
import { cookies } from "next/headers";

import { DatabaseError } from "@/features/database-error";
import {
  FetchLocations,
  FetchReferenceGraphData,
  FetchTrendGraphData,
} from "@/lib/api/fetch-server";

const graphMeasureCookieName = "graph-measure";
const defaultGraphMeasure = "avg";
import { FetchLocationProperties, LocationProperties } from "@/types/types";

const Main = dynamic(() => import("@/features/page/page-main"));

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  const initialGraphMeasure =
    cookieStore.get(graphMeasureCookieName)?.value || defaultGraphMeasure;
  const { id } = await params;
  const locationId = Number(id);
  if (Number.isNaN(locationId) || locationId <= 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Invalid location ID
          </h1>
          <p className="text-gray-600">
            The provided location ID is not valid.
          </p>
        </div>
      </div>
    );
  }

  let locations: LocationProperties[] = [];
  let LocationOptions: FetchLocationProperties["LocationOptions"] = [];

  try {
    const result = await FetchLocations();
    locations = result.locations;
    LocationOptions = result.LocationOptions;
  } catch {
    return (
      <DatabaseError
        message="Unable to connect to the database. Please try again later."
        title="Database Connection Error"
      />
    );
  }

  if (!locations || locations.length === 0) {
    return (
      <DatabaseError
        message="Location data could not be loaded. The database may be temporarily unavailable."
        title="No Data Available"
      />
    );
  }

  let pets: number[] = [];
  let dates: Date[] = [];
  let reference_pets: number[] = [];
  let years: number[] = [];
  let year_pets: number[] = [];
  let trendline_pets: number[] = [];

  const currentData = await FetchReferenceGraphData("2023", locationId);
  pets = currentData.pets;
  dates = currentData.dates;

  const referenceData = await FetchReferenceGraphData("2000", locationId);
  reference_pets = referenceData.pets;

  const trendData = await FetchTrendGraphData("avg", locationId);
  years = trendData.years;
  year_pets = trendData.year_pets;
  trendline_pets = trendData.trendline_pets;

  const selectedLocation = locations.find(
    (loc: { location_id: number }) => loc.location_id === locationId
  );
  if (!selectedLocation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Location not found
          </h1>
          <p className="text-gray-600">
            The requested location could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Main
      CurrentDates={dates}
      CurrentPets={pets}
      id={locationId}
      initialGraphMeasure={initialGraphMeasure}
      location={selectedLocation}
      LocationOptions={LocationOptions}
      ReferencePets={reference_pets}
      TrendlinePets={trendline_pets}
      YearPets={year_pets}
      Years={years}
    />
  );
}
