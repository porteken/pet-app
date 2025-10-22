"use client";

import React from "react";

import { GenerateReferenceGraph } from "@/features/generate-graph";
import { FetchReferenceGraphData } from "@/lib/api/fetch-client";

interface ReferenceDataProperties {
  CurrentDates: Date[];
  CurrentPets: number[];
  id: number;
  ReferencePets: number[];
}

export const ReferenceData: React.FC<ReferenceDataProperties> = ({
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
      generatePetReferenceGraph(year);
    },
    [generatePetReferenceGraph]
  );

  React.useEffect(() => {
    generatePetReferenceGraph(selectedReferenceYear);
  }, [generatePetReferenceGraph, selectedReferenceYear]);

  const years = Array.from({ length: 25 }, (_, index) => 2000 + index);

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
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            id="reference-year"
            onChange={handleReferenceYearChange}
            value={selectedReferenceYear}
          >
            {years.map(year => (
              <option key={`year-${year}`} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className="h-[700px]">{referenceGraph}</div>
      </div>
    </div>
  );
};
