"use client";

import React from "react";

import { GenerateTrendGraph } from "@/features/generate-graph";
import { FetchTrendGraphData } from "@/lib/api/fetch-client";

interface TrendAnalysisProperties {
  id: number;
  initialGraphMeasure: string;
  onMeasureChange: (measure: string) => Promise<void>;
  TrendlinePets: number[];
  YearPets: number[];
  Years: number[];
}

export const TrendAnalysis: React.FC<TrendAnalysisProperties> = ({
  id,
  initialGraphMeasure,
  onMeasureChange,
  TrendlinePets,
  YearPets,
  Years,
}) => {
  const [selectedGraphMeasure, setSelectedGraphMeasure] =
    React.useState(initialGraphMeasure);
  const [trendGraph, setTrendGraph] = React.useState<
    React.ReactElement | undefined
  >();

  const generatePetTrendGraph = React.useCallback(
    async (option: string) => {
      const graphData =
        option === selectedGraphMeasure
          ? { trendline_pets: TrendlinePets, year_pets: YearPets, years: Years }
          : await FetchTrendGraphData(option, id);

      const { trendline_pets, year_pets, years } = graphData;
      const graph = GenerateTrendGraph(
        years,
        option,
        year_pets,
        trendline_pets
      );
      setTrendGraph(graph);
    },
    [Years, YearPets, TrendlinePets, selectedGraphMeasure, id]
  );

  const handleGraphMeasureChange = React.useCallback(
    async (event: React.ChangeEvent<HTMLSelectElement>) => {
      const option = event.target.value;
      setSelectedGraphMeasure(option);
      await onMeasureChange(option);
      await generatePetTrendGraph(option);
    },
    [generatePetTrendGraph, onMeasureChange]
  );

  // Generate graph on initial render or when measure changes
  React.useEffect(() => {
    generatePetTrendGraph(selectedGraphMeasure).catch(error => {
      throw error;
    });
  }, [generatePetTrendGraph, selectedGraphMeasure]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Trend Analysis
        </h2>
        <div className="mb-4">
          <label
            className="mb-2 block text-sm font-medium text-gray-700"
            htmlFor="graph-measure"
          >
            Graph Measure
          </label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            id="graph-measure"
            onChange={handleGraphMeasureChange}
            value={selectedGraphMeasure}
          >
            <option key="measure-avg" value="avg">
              Average
            </option>
            <option key="measure-max" value="max">
              Maximum
            </option>
          </select>
        </div>
        <div className="h-[700px]">{trendGraph}</div>
      </div>
    </div>
  );
};
