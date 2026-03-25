"use client";

import React from "react";

import { GenerateTrendGraph } from "@/features/graph";
import { setForecastPreferences } from "@/lib/actions/actions";
import { FetchForecastData, FetchTrendGraphData } from "@/lib/api/fetch-client";
import { ForecastControls } from "@/lib/utils/forecast-controls";
import { type HeatStressDescription } from "@/lib/utils/heat-stress";
import {
  buildTrendAnalysisResult,
  type TrendGraphSnapshot,
} from "@/lib/utils/trend-analysis";

interface TrendAnalysisProperties {
  id: number;
  initialForecastEnabled: boolean;
  initialForecastYearsAhead: number;
  initialGraphMeasure: string;
  onMeasureChange: (measure: string) => Promise<void>;
}

const TrendAnalysisComponent: React.FC<TrendAnalysisProperties> = ({
  id,
  initialForecastEnabled,
  initialForecastYearsAhead,
  initialGraphMeasure,
  onMeasureChange,
}) => {
  const [selectedGraphMeasure, setSelectedGraphMeasure] =
    React.useState(initialGraphMeasure);
  const [trendGraph, setTrendGraph] = React.useState<
    React.ReactElement | undefined
  >();
  const [forecastEnabled, setForecastEnabled] = React.useState(
    () => initialForecastEnabled
  );
  const [forecastYearsAhead, setForecastYearsAhead] = React.useState(
    () => initialForecastYearsAhead
  );
  const [currentHeatStress, setCurrentHeatStress] = React.useState<
    HeatStressDescription | undefined
  >();
  const [forecastHeatStress, setForecastHeatStress] = React.useState<
    HeatStressDescription | undefined
  >();
  const [trendGraphSnapshot, setTrendGraphSnapshot] =
    React.useState<TrendGraphSnapshot>();
  const [isMobileViewport, setIsMobileViewport] = React.useState(() => {
    if (typeof globalThis.matchMedia !== "function") {
      return false;
    }

    return globalThis.matchMedia("(max-width: 639px)").matches;
  });
  const [isMobileLegendOpen, setIsMobileLegendOpen] = React.useState(false);

  const showTrendLegend = !isMobileViewport || isMobileLegendOpen;

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

  const generatePetTrendGraph = React.useCallback(
    async (option: string, enableForecast: boolean, yearsAhead: number) => {
      try {
        const { forecastHeatStress, heatStressDescription, snapshot } =
          await buildTrendAnalysisResult({
            enableForecast,
            fetchForecastData: () => FetchForecastData(id, yearsAhead),
            fetchTrendGraphData: () => FetchTrendGraphData(option, id),
            option,
          });

        setCurrentHeatStress(heatStressDescription);
        setForecastHeatStress(forecastHeatStress);
        setTrendGraphSnapshot(snapshot);
      } catch {
        setTrendGraphSnapshot({
          forecastData: undefined,
          increase_per_year: 0,
          option,
          trendline_pets: [],
          year_pets: [],
          years: [],
        });
        setCurrentHeatStress(undefined);
        setForecastHeatStress(undefined);
      }
    },
    [id]
  );

  const handleGraphMeasureChange = React.useCallback(
    async (event: React.ChangeEvent<HTMLSelectElement>) => {
      const option = event.target.value;
      setIsMobileLegendOpen(false);
      setSelectedGraphMeasure(option);
      try {
        await onMeasureChange(option);
      } catch {
        // Ignore persistence failures and keep the local selection.
      }
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

  const handleForecastToggle = React.useCallback(
    (enabled: boolean) => {
      setForecastEnabled(enabled);
      setForecastPreferences(enabled, forecastYearsAhead).catch(() => {});
    },
    [forecastYearsAhead]
  );

  const handleForecastYearsChange = React.useCallback(
    (yearsAhead: number) => {
      setForecastYearsAhead(yearsAhead);
      setForecastPreferences(forecastEnabled, yearsAhead).catch(() => {});
    },
    [forecastEnabled]
  );

  React.useEffect(() => {
    if (!trendGraphSnapshot) {
      return;
    }

    setTrendGraph(
      GenerateTrendGraph({
        forecastData: trendGraphSnapshot.forecastData,
        increasePerYear: trendGraphSnapshot.increase_per_year,
        isMobileViewport,
        option: trendGraphSnapshot.option,
        showLegend: showTrendLegend,
        trendlinePets: trendGraphSnapshot.trendline_pets,
        yearPets: trendGraphSnapshot.year_pets,
        years: trendGraphSnapshot.years,
      })
    );
  }, [isMobileViewport, showTrendLegend, trendGraphSnapshot]);

  return (
    <div className="h-full">
      <div className="flex h-full flex-col rounded-lg bg-white p-3 shadow-md sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:text-xl">
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
              className="h-10 w-full rounded-md border border-gray-300 px-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
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
              onToggle={handleForecastToggle}
              onYearsChange={handleForecastYearsChange}
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
        <div className="mb-3 sm:hidden">
          <button
            aria-controls="trend-analysis-graph"
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
          id="trend-analysis-graph"
        >
          {trendGraph}
        </div>
      </div>
    </div>
  );
};

TrendAnalysisComponent.displayName = "TrendAnalysis";

export const TrendAnalysis = React.memo(TrendAnalysisComponent);
