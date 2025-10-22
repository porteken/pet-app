"use client";

import React from "react";

import { GenerateTrendGraph } from "@/features/generate-graph";
import { FetchTrendGraphData } from "@/lib/api/fetch-client";
import { calculateForecast } from "@/lib/utils/forecast";

import { ForecastControls } from "./forecast-controls";

interface TrendAnalysisProperties {
  id: number;
  initialGraphMeasure: string;
  onMeasureChange: (measure: string) => Promise<void>;
}

export const TrendAnalysis: React.FC<TrendAnalysisProperties> = ({
  id,
  initialGraphMeasure,
  onMeasureChange,
}) => {
  const [selectedGraphMeasure, setSelectedGraphMeasure] =
    React.useState(initialGraphMeasure);
  const [trendGraph, setTrendGraph] = React.useState<
    React.ReactElement | undefined
  >();
  const [forecastEnabled, setForecastEnabled] = React.useState(false);
  const [forecastYearsAhead, setForecastYearsAhead] = React.useState(10);

  const generatePetTrendGraph = React.useCallback(
    async (option: string, enableForecast: boolean, yearsAhead: number) => {
      const graphData = await FetchTrendGraphData(option, id);

      const { increase_per_year, trendline_pets, year_pets, years } = graphData;

      const forecastData = enableForecast
        ? calculateForecast(years, year_pets, yearsAhead)
        : undefined;

      const graph = GenerateTrendGraph(
        years,
        option,
        year_pets,
        trendline_pets,
        increase_per_year,
        forecastData
      );
      setTrendGraph(graph);
    },
    [id, setTrendGraph]
  );

  const handleGraphMeasureChange = React.useCallback(
    async (event: React.ChangeEvent<HTMLSelectElement>) => {
      const option = event.target.value;
      setSelectedGraphMeasure(option);
      await onMeasureChange(option);
    },
    [generatePetTrendGraph, onMeasureChange]
  );

  React.useEffect(() => {
    generatePetTrendGraph(
      selectedGraphMeasure,
      forecastEnabled,
      forecastYearsAhead
    );
  }, [
    generatePetTrendGraph,
    selectedGraphMeasure,
    forecastEnabled,
    forecastYearsAhead,
  ]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Trend Analysis
        </h2>
        <div className="mb-4 space-y-4">
          <div>
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
          <ForecastControls
            enabled={forecastEnabled}
            onToggle={setForecastEnabled}
            onYearsChange={setForecastYearsAhead}
            yearsAhead={forecastYearsAhead}
          />
        </div>
        <div className="h-[700px]">{trendGraph}</div>
      </div>
    </div>
  );
};
