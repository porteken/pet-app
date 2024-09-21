import dynamic from "next/dynamic";
import React from "react";
import { FetchLocations } from "../../components/fetchServer";

import {
  FetchReferenceGraphData,
  FetchTrendGraphData,
} from "../../components/fetchServer";

// Dynamically load Main component without server-side rendering (SSR)
const Main = dynamic(() => import("../../components/page/main"), {
  ssr: false,
});

type PageProps = {
  params: { id: number };
};

export default async function Page({ params }: PageProps) {
  // Fetch location data
  const { locations, LocationOptions } = await FetchLocations();

  // Fetch reference graph data for the current year (2023) and selected location
  const { pets, dates } = await FetchReferenceGraphData("2023", params.id);

  // Fetch reference graph data for default reference year (2000) and selected location
  const { pets: reference_pets } = await FetchReferenceGraphData(
    "2000",
    params.id,
  );

  // Fetch trend graph data with default graph type (average)

  const { years, year_pets, trendline_pets } = await FetchTrendGraphData(
    "avg",
    params.id,
  );

  // Find the current location by id, with a fallback to null in case it's not found
  const selectedLocation = locations.find(
    (loc) => loc.location_id == params.id,
  );
  if (!selectedLocation) {
    return <div>Location not found</div>;
  }

  return (
    <div>
      <Main
        id={params.id}
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
