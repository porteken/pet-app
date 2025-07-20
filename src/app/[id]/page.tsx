import dynamic from "next/dynamic";

import { FetchLocations } from "../../lib/fetchServer";
import {
  FetchReferenceGraphData,
  FetchTrendGraphData,
} from "../../lib/fetchServer";

const Main = dynamic(() => import("../../components/page/page-main"));

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Validate that the id parameter is a valid number
  const { id } = await params;
  const locationId = Number(id);
  if (isNaN(locationId) || locationId <= 0) {
    return <div>Invalid location ID</div>;
  }

  // Fetch location data
  const { locations, LocationOptions } = await FetchLocations();

  // Fetch reference graph data for the current year (2023) and selected location
  const { pets, dates } = await FetchReferenceGraphData("2023", locationId);

  // Fetch reference graph data for default reference year (2000) and selected location
  const { pets: reference_pets } = await FetchReferenceGraphData(
    "2000",
    locationId
  );

  // Fetch trend graph data with default graph measure (average)
  const { years, year_pets, trendline_pets } = await FetchTrendGraphData(
    "avg",
    locationId
  );

  const selectedLocation = locations.find(
    (loc: { location_id: number }) => loc.location_id == locationId
  );
  if (!selectedLocation) {
    return <div>Location not found</div>;
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
