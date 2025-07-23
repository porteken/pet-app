import dynamic from "next/dynamic";
import React from "react";

import {
  FetchLocations,
  FetchReferenceGraphData,
  FetchTrendGraphData,
} from "../../lib/fetch-server";
import { DatabaseError } from "../../components/database-error";
import { LocationProps } from "../../types/types";
import { DropdownSectionProps, DropdownItemProps } from "@heroui/react";
const Main = dynamic(() => import("../../components/page/page-main"));

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  let locations: LocationProps[] = [];
  let LocationOptions: Partial<DropdownSectionProps<DropdownItemProps>>[] = [];

  try {
    const result = await FetchLocations();
    locations = result.locations;
    LocationOptions = [
      {
        items: result.LocationOptions.filter(
          opt =>
            (opt as { value?: number; label?: string }).value !== undefined &&
            (opt as { value?: number; label?: string }).label !== undefined
        ).map(opt => {
          const value = (opt as { value: number; label: string }).value;
          const label = (opt as { value: number; label: string }).label;

          return {
            key: String(value), // key must be a string
            value,
            label,
          };
        }),
      },
    ];
  } catch {
    return (
      <DatabaseError
        title="Database Connection Error"
        message="Unable to connect to the database. Please try again later."
      />
    );
  }

  if (!locations || locations.length === 0) {
    return (
      <DatabaseError
        title="No Data Available"
        message="Location data could not be loaded. The database may be temporarily unavailable."
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
