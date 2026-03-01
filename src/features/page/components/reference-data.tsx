"use client";

import React from "react";

import { GenerateReferenceGraph } from "@/features/graph";
import { FetchReferenceGraphData } from "@/lib/api/fetch-client";

interface ReferenceDataProperties {
  CurrentDates: Date[];
  CurrentPets: number[];
  id: number;
  ReferencePets: number[];
}

interface ReferenceGraphSnapshot {
  dates: Date[];
  pets: number[];
  year: string;
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
  const [referenceGraphSnapshot, setReferenceGraphSnapshot] =
    React.useState<ReferenceGraphSnapshot>();
  const [isMobileViewport, setIsMobileViewport] = React.useState(() => {
    if (typeof globalThis.matchMedia !== "function") {
      return false;
    }

    return globalThis.matchMedia("(max-width: 639px)").matches;
  });
  const [isMobileLegendOpen, setIsMobileLegendOpen] = React.useState(false);

  const showReferenceLegend = !isMobileViewport || isMobileLegendOpen;

  React.useEffect(() => {
    if (typeof globalThis.matchMedia !== "function") {
      return;
    }

    const mediaQuery = globalThis.matchMedia("(max-width: 639px)");
    const updateIsMobileViewport = () => {
      setIsMobileViewport(mediaQuery.matches);
    };

    updateIsMobileViewport();

    mediaQuery.addEventListener("change", updateIsMobileViewport);
    return () => {
      mediaQuery.removeEventListener("change", updateIsMobileViewport);
    };
  }, []);

  const generatePetReferenceGraph = React.useCallback(
    async (year: string) => {
      const referenceData =
        year === DEFAULT_REFERENCE_YEAR
          ? { dates: CurrentDates, pets: ReferencePets }
          : await FetchReferenceGraphData(year, id);

      const { dates, pets } = referenceData;
      setReferenceGraphSnapshot({ dates, pets, year });
    },
    [CurrentDates, ReferencePets, id]
  );

  const handleReferenceYearChange = React.useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const year = event.target.value;
      setIsMobileLegendOpen(false);
      setSelectedReferenceYear(year);
    },
    []
  );

  React.useEffect(() => {
    generatePetReferenceGraph(selectedReferenceYear);
  }, [generatePetReferenceGraph, selectedReferenceYear]);

  React.useEffect(() => {
    if (!referenceGraphSnapshot) {
      return;
    }

    let isCancelled = false;
    const renderGraph = async () => {
      const graph = await GenerateReferenceGraph(
        referenceGraphSnapshot.year,
        referenceGraphSnapshot.dates,
        referenceGraphSnapshot.pets,
        CurrentPets,
        showReferenceLegend,
        isMobileViewport
      );

      if (!isCancelled) {
        setReferenceGraph(graph);
      }
    };

    void renderGraph();

    return () => {
      isCancelled = true;
    };
  }, [
    CurrentPets,
    isMobileViewport,
    referenceGraphSnapshot,
    showReferenceLegend,
  ]);

  return (
    <div className="h-full">
      <div className="flex h-full flex-col rounded-lg bg-white p-3 shadow-md sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:text-xl">
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
        <div className="mb-3 sm:hidden">
          <button
            aria-controls="reference-data-graph"
            aria-expanded={isMobileLegendOpen}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
            onClick={() => setIsMobileLegendOpen(previous => !previous)}
            type="button"
          >
            {isMobileLegendOpen ? "Hide Graph Legend" : "Show Graph Legend"}
          </button>
        </div>
        <div
          className="mt-auto h-[clamp(220px,42vh,520px)] overflow-hidden sm:h-[clamp(450px,70vh,850px)]"
          id="reference-data-graph"
        >
          {referenceGraph}
        </div>
      </div>
    </div>
  );
};

ReferenceDataComponent.displayName = "ReferenceData";

export const ReferenceData = React.memo(ReferenceDataComponent);
