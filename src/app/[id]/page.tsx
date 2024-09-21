import dynamic from "next/dynamic";
import React from "react";
import {
  FetchLocations,
  FetchReferenceGraphData,
} from "../../components/fetchData";
import { SelectItemProps, SelectSectionProps } from "@nextui-org/select";

const Main = dynamic(() => import("../../components/page/main"), {
  ssr: false,
});

export default async function Page({ params }: { params: { id: number } }) {
  const data = await FetchLocations();

  // Extract unique states and sort them
  const states = Array.from(new Set(data.map(({ state }) => state))).sort();

  // Create location options grouped by state
  const LocationOptions: Partial<SelectSectionProps<SelectItemProps>>[] =
    states.map((state) => ({
      title: state,
      items: data
        .filter((loc) => loc.state === state)
        .map(({ location_id, city }) => ({ key: location_id, title: city })),
    }));

  const { pets, dates } = await FetchReferenceGraphData("2023", params.id);

  return (
    <div>
      <Main
        id={params.id}
        location={data.find((loc) => loc.location_id === params.id)!}
        LocationOptions={LocationOptions}
        CurrentPets={pets}
        CurrentDates={dates}
      />
    </div>
  );
}
