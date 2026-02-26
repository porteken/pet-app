"use client";

import React from "react";

import { GenerateReferenceGraph } from "@/features/graph/generate-graph";
import { FetchReferenceGraphData } from "@/lib/api/fetch-client";

interface ReferenceDataProperties {
  CurrentDates: Date[];
  CurrentPets: number[];
  id: number;
  ReferencePets: number[];
}

const REFERENCE_YEARS = Array.from({ length: 25 }, (_, index) => 2000 + index);

const ReferenceDataComponent: React.FC<ReferenceDataProperties> = ({
  CurrentDates,
  CurrentPets,
  id,
  ReferencePets,
}) => {
  const DEFAULT_REFERENCE_YEAR = "2000";
  const [selectedReferenceYear, setSelectedReferenceYear] = React.useState(
    DEFAULT_REFERENCE_YEAR
  );
  const [referenceGraph, setReferenceGraph] = React.useState<
    React.ReactElement | undefined
  >();

  const generatePetReferenceGraph = React.useCallback(
    async (year: string) => {
      const referenceData =
        year === DEFAULT_REFERENCE_YEAR
          ? { dates: CurrentDates, pets: ReferencePets }
          : await FetchReferenceGraphData(year, id);

      const { dates, pets } = referenceData;
      const graph = await GenerateReferenceGraph(
        year,
        dates,
        pets,
        CurrentPets
      );
      setReferenceGraph(graph);
    },
    [CurrentDates, CurrentPets, ReferencePets, id]
  );

  const handleReferenceYearChange = React.useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const year = event.target.value;
      setSelectedReferenceYear(year);
    },
    []
  );

  React.useEffect(() => {
    generatePetReferenceGraph(selectedReferenceYear);
  }, [generatePetReferenceGraph, selectedReferenceYear]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Reference Data
        </h2>
        <div className="mb-4">
          <label
            className="mb-2 block text-sm font-medium text-gray-700"
            htmlFor="reference-year"
          >
            Reference Year
          </label>
          <select
            className="h-10 w-full rounded-md border border-gray-300 px-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            id="reference-year"
            onChange={handleReferenceYearChange}
            value={selectedReferenceYear}
          >
            {REFERENCE_YEARS.map(year => (
              <option key={`year-${year}`} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className="h-[clamp(280px,50vh,600px)] sm:h-[clamp(380px,68vh,700px)]">
          {referenceGraph}
        </div>
      </div>
    </div>
  );
};

ReferenceDataComponent.displayName = "ReferenceData";

export const ReferenceData = React.memo(ReferenceDataComponent);
