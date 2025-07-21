import dynamic from "next/dynamic";
import React from "react";

import {
  FetchLocations,
  FetchReferenceGraphData,
  FetchTrendGraphData,
} from "../../lib/fetchServer";

const Main = dynamic(() => import("../../components/page/page-main"));

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locationId = Number(id);
  if (isNaN(locationId) || locationId <= 0) {
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

  let locations: any[] = [];
  let LocationOptions: any[] = [];

  try {
    const result = await FetchLocations();
    locations = result.locations;
    LocationOptions = result.LocationOptions;
  } catch (error) {
    console.error("Error fetching locations:", error);
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Data temporarily unavailable
          </h1>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  // Handle case where no locations are found
  if (!locations || locations.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            No data available
          </h1>
          <p className="text-gray-600">Location data could not be loaded.</p>
        </div>
      </div>
    );
  }

  // Fetch data with error handling
  let pets: number[] = [];
  let dates: Date[] = [];
  let reference_pets: number[] = [];
  let years: number[] = [];
  let year_pets: number[] = [];
  let trendline_pets: number[] = [];

  try {
    const currentData = await FetchReferenceGraphData("2023", locationId);
    pets = currentData.pets;
    dates = currentData.dates;

    const referenceData = await FetchReferenceGraphData("2000", locationId);
    reference_pets = referenceData.pets;

    const trendData = await FetchTrendGraphData("avg", locationId);
    years = trendData.years;
    year_pets = trendData.year_pets;
    trendline_pets = trendData.trendline_pets;
  } catch (error) {
    console.error("Error fetching data:", error);
    // Continue with empty data arrays
  }

  const selectedLocation = locations.find(
    (loc: { location_id: number }) => loc.location_id == locationId
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
    <div>
      <Main
        id={locationId}
        location={selectedLocation}
        LocationOptions={LocationOptions}
        CurrentPets={pets}
        ReferencePets={reference_pets}
        CurrentDates={dates}
        YearPets={year_pets}
        TrendlinePets={trendline_pets}
        Years={years}
      />
    </div>
  );
}
