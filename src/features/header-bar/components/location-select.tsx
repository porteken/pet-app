"use client";

import { Select } from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

interface LocationSelectProperties {
  buildUrl: (path: string, includeSearchParameters?: boolean) => string;
  cities: { label: string; value: string }[];
  selectedCity: string;
  selectedState: string;
  states: { label: string; value: string }[];
}

export const LocationSelect: React.FC<LocationSelectProperties> = ({
  cities,
  selectedCity,
  selectedState,
  states,
}) => {
  const router = useRouter();
  const searchParameters = useSearchParams();

  const handleCityChange = (value: null | string) => {
    const parameters = new URLSearchParams(searchParameters.toString());
    parameters.set("city", value || "");
    router.push(`?${parameters.toString()}`);
  };

  const handleStateChange = (value: null | string) => {
    const parameters = new URLSearchParams(searchParameters.toString());
    parameters.set("state", value || "");

    // Reset city when state changes
    parameters.delete("city");

    router.push(`?${parameters.toString()}`);
  };

  return (
    <>
      <Select
        allowDeselect={false}
        aria-label="Select state"
        data={states}
        data-testid="state-select"
        onChange={handleStateChange}
        placeholder="Select state"
        value={selectedState}
      />
      <Select
        allowDeselect={false}
        aria-label="Select city"
        data={cities}
        data-testid="city-select"
        disabled={!selectedState}
        onChange={handleCityChange}
        placeholder="Select city"
        value={selectedCity}
      />
    </>
  );
};
