/* eslint-disable unicorn/no-null */
"use client";

import React from "react";

import { ForecastControls } from "@/components/forecast/forecast-controls";
import { GenerateTrendGraph } from "@/features/generate-graph";
import { FetchForecastData, FetchTrendGraphData } from "@/lib/api/fetch-client";
import {
  getForecastHeatStressDescription,
  getHeatStressDescription,
  type HeatStressDescription,
} from "@/lib/utils/heat-stress";

interface TrendAnalysisProperties {
  id: number;
  initialGraphMeasure: string;
  onMeasureChange: (measure: string) => Promise<void>;
}

const TrendAnalysisComponent: React.FC<TrendAnalysisProperties> = ({
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
  const [currentHeatStress, setCurrentHeatStress] =
    React.useState<HeatStressDescription | null>(null);
  const [forecastHeatStress, setForecastHeatStress] =
    React.useState<HeatStressDescription | null>(null);

  const generatePetTrendGraph = React.useCallback(
    async (option: string, enableForecast: boolean, yearsAhead: number) => {
      const graphData = await FetchTrendGraphData(option, id);

      const { increase_per_year, trendline_pets, year_pets, years } = graphData;

      const forecastData = enableForecast
        ? await FetchForecastData(id, yearsAhead)
        : undefined;

      const currentYear = Math.max(...years);
      const currentYearIndex = years.indexOf(currentYear);
      const currentPetValue = year_pets[currentYearIndex];

      setCurrentHeatStress(
        getHeatStressDescription(currentPetValue, option, currentYear)
      );

      if (
        enableForecast &&
        forecastData &&
        forecastData.forecastValues.length > 0
      ) {
        const finalForecastYear = forecastData.forecastYears.at(-1)!;
        const finalForecastValue = forecastData.forecastValues.at(-1)!;
        const finalLowerBound25 = forecastData.lowerBound10.at(-1)!;
        const finalUpperBound75 = forecastData.upperBound90.at(-1)!;
        setForecastHeatStress(
          getForecastHeatStressDescription(
            finalForecastValue,
            finalForecastYear,
            finalLowerBound25,
            finalUpperBound75
          )
        );
      } else {
        setForecastHeatStress(null);
      }

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
    [id]
  );

  const handleGraphMeasureChange = React.useCallback(
    async (event: React.ChangeEvent<HTMLSelectElement>) => {
      const option = event.target.value;
      setSelectedGraphMeasure(option);
      await onMeasureChange(option);
    },
    [onMeasureChange]
  );

  React.useEffect(() => {
    generatePetTrendGraph(
      selectedGraphMeasure,
      forecastEnabled && selectedGraphMeasure === "avg",
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
          {selectedGraphMeasure === "avg" && (
            <ForecastControls
              enabled={forecastEnabled}
              onToggle={setForecastEnabled}
              onYearsChange={setForecastYearsAhead}
              yearsAhead={forecastYearsAhead}
            />
          )}
        </div>
        {currentHeatStress && (
          <div className="mb-4 rounded-lg bg-blue-50 p-4">
            <p className="text-sm font-medium text-gray-900">
              {currentHeatStress.prefix}{" "}
              <span className={`font-bold ${currentHeatStress.colorClass}`}>
                {currentHeatStress.value}
              </span>
            </p>
            {forecastEnabled && forecastHeatStress && (
              <p className="mt-2 text-sm font-medium text-gray-900">
                {forecastHeatStress.prefix}{" "}
                <span className={`font-bold ${forecastHeatStress.colorClass}`}>
                  {forecastHeatStress.value}
                </span>
                {forecastHeatStress.confidenceRange && (
                  <span className="ml-2 text-xs text-gray-600">
                    {forecastHeatStress.confidenceRange}
                  </span>
                )}
              </p>
            )}
          </div>
        )}
        <div className="h-[700px]">{trendGraph}</div>
      </div>
    </div>
  );
};

TrendAnalysisComponent.displayName = "TrendAnalysis";

export const TrendAnalysis = React.memo(TrendAnalysisComponent);
