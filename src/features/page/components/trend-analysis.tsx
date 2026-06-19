"use client";

import { ForecastControls } from "@/components/app/forecast-controls";
import { GenerateTrendGraph } from "@/features/graph";
import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import { setForecastPreferences } from "@/lib/actions/actions";
import { FetchForecastData, FetchTrendGraphData } from "@/lib/api/fetch-client";
import { normalizeGraphSeason, type GraphSeason } from "@/lib/constants";
import {
  buildTrendAnalysisResult,
  type TrendGraphSnapshot,
} from "@/lib/utils/trend-analysis";
import React from "react";

import type { HeatStressDescription } from "@/lib/utils/thermal-stress";
import type { TrendGraphDataProperties } from "@/types/types";

interface TrendAnalysisProperties {
  graphSeason: GraphSeason;
  id: number;
  initialForecastEnabled: boolean;
  initialForecastYearsAhead: number;
  initialGraphMeasure: string;
  initialGraphSeason: GraphSeason;
  initialIncreasePerYear?: number;
  initialTrendlinePets?: number[];
  initialYearPets?: number[];
  initialYears?: number[];
  onMeasureChange: (measure: string) => Promise<void>;
  onSeasonChange: (season: GraphSeason) => Promise<void>;
}

const DEFAULT_INITIAL_TRENDLINE_PETS: number[] = [];
const DEFAULT_INITIAL_YEAR_PETS: number[] = [];
const DEFAULT_INITIAL_YEARS: number[] = [];

const ignorePersistenceError = async (promise: Promise<void>) => {
  try {
    await promise;
  } catch {
    // The local UI state remains valid even if persistence fails.
  }
};

const TrendAnalysisComponent: React.FC<TrendAnalysisProperties> = ({
  graphSeason,
  id,
  initialForecastEnabled,
  initialForecastYearsAhead,
  initialGraphMeasure,
  initialGraphSeason,
  initialIncreasePerYear = 0,
  initialTrendlinePets = DEFAULT_INITIAL_TRENDLINE_PETS,
  initialYearPets = DEFAULT_INITIAL_YEAR_PETS,
  initialYears = DEFAULT_INITIAL_YEARS,
  onMeasureChange,
  onSeasonChange,
}) => {
  const initialTrendData =
    React.useMemo<TrendGraphDataProperties | null>(() => {
      if (
        initialYears.length === 0 ||
        initialYearPets.length !== initialYears.length ||
        initialTrendlinePets.length !== initialYears.length
      ) {
        return null;
      }

      return {
        increase_per_year: initialIncreasePerYear,
        trendline_pets: initialTrendlinePets,
        year_pets: initialYearPets,
        years: initialYears,
      };
    }, [
      initialIncreasePerYear,
      initialTrendlinePets,
      initialYearPets,
      initialYears,
    ]);
  const initialTrendSnapshot = React.useMemo<TrendGraphSnapshot | undefined>(
    () =>
      initialTrendData
        ? {
            forecastData: undefined,
            increase_per_year: initialTrendData.increase_per_year,
            option: initialGraphMeasure,
            season: initialGraphSeason,
            trendline_pets: initialTrendData.trendline_pets,
            year_pets: initialTrendData.year_pets,
            years: initialTrendData.years,
          }
        : undefined,
    [initialGraphMeasure, initialGraphSeason, initialTrendData],
  );
  const [selectedGraphMeasure, setSelectedGraphMeasure] =
    React.useState(initialGraphMeasure);
  const [forecastEnabled, setForecastEnabled] = React.useState(
    () => initialForecastEnabled,
  );
  const [forecastYearsAhead, setForecastYearsAhead] = React.useState(
    () => initialForecastYearsAhead,
  );
  const [currentHeatStress, setCurrentHeatStress] = React.useState<
    HeatStressDescription | undefined
  >();
  const [forecastHeatStress, setForecastHeatStress] = React.useState<
    HeatStressDescription | undefined
  >();
  const [trendGraphSnapshot, setTrendGraphSnapshot] = React.useState<
    TrendGraphSnapshot | undefined
  >(initialTrendSnapshot);
  const isMobileViewport = useIsMobileViewport();
  const [isMobileLegendOpen, setIsMobileLegendOpen] = React.useState(false);
  const latestTrendRequestRef = React.useRef(0);

  const showTrendLegend = !isMobileViewport || isMobileLegendOpen;

  React.useEffect(() => {
    setTrendGraphSnapshot(initialTrendSnapshot);
    setCurrentHeatStress(undefined);
    setForecastHeatStress(undefined);
  }, [initialTrendSnapshot]);

  const generatePetTrendGraph = React.useCallback(
    async (
      option: string,
      season: GraphSeason,
      enableForecast: boolean,
      yearsAhead: number,
    ) => {
      const requestId = ++latestTrendRequestRef.current;

      try {
        const {
          forecastHeatStress: newForecastHeatStress,
          heatStressDescription: newHeatStressDescription,
          snapshot,
        } = await buildTrendAnalysisResult({
          enableForecast,
          fetchForecastData: () =>
            FetchForecastData(id, yearsAhead, season, option),
          fetchTrendGraphData: () => {
            if (
              initialTrendData &&
              option === initialGraphMeasure &&
              season === initialGraphSeason
            ) {
              return Promise.resolve(initialTrendData);
            }

            return FetchTrendGraphData(option, id, season);
          },
          option,
          season,
        });

        if (requestId !== latestTrendRequestRef.current) {
          return;
        }

        setCurrentHeatStress(newHeatStressDescription);
        setForecastHeatStress(newForecastHeatStress);
        setTrendGraphSnapshot(snapshot);
      } catch {
        if (requestId !== latestTrendRequestRef.current) {
          return;
        }

        setTrendGraphSnapshot({
          forecastData: undefined,
          increase_per_year: 0,
          option,
          season,
          trendline_pets: [],
          year_pets: [],
          years: [],
        });
        setCurrentHeatStress(undefined);
        setForecastHeatStress(undefined);
      }
    },
    [id, initialGraphMeasure, initialGraphSeason, initialTrendData],
  );

  const handleGraphMeasureChange = React.useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const option = event.target.value;
      setIsMobileLegendOpen(false);
      setSelectedGraphMeasure(option);
      void ignorePersistenceError(onMeasureChange(option));
    },
    [onMeasureChange],
  );

  const handleSeasonChange = React.useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const season = normalizeGraphSeason(event.target.value);
      setIsMobileLegendOpen(false);

      void ignorePersistenceError(onSeasonChange(season));
    },
    [onSeasonChange],
  );

  React.useEffect(() => {
    const performGenerate = async () => {
      try {
        await generatePetTrendGraph(
          selectedGraphMeasure,
          graphSeason,
          forecastEnabled,
          forecastYearsAhead,
        );
      } catch {
        // Error is handled by the graph component's own error state
      }
    };
    void performGenerate();
  }, [
    generatePetTrendGraph,
    selectedGraphMeasure,
    graphSeason,
    forecastEnabled,
    forecastYearsAhead,
  ]);

  const handleForecastToggle = React.useCallback(
    (enabled: boolean) => {
      setForecastEnabled(enabled);
      void ignorePersistenceError(
        setForecastPreferences(enabled, forecastYearsAhead),
      );
    },
    [forecastYearsAhead],
  );

  const handleForecastYearsChange = React.useCallback(
    (yearsAhead: number) => {
      setForecastYearsAhead(yearsAhead);
      void ignorePersistenceError(
        setForecastPreferences(forecastEnabled, yearsAhead),
      );
    },
    [forecastEnabled],
  );

  const handleToggleMobileLegend = React.useCallback(() => {
    setIsMobileLegendOpen((previous) => !previous);
  }, []);

  return (
    <div className="h-full min-h-0 min-w-0">
      <div className="flex h-full min-h-0 min-w-0 fade-in-up flex-col rounded-3xl p-4 glass-panel sm:px-5 sm:py-6">
        <h2 className="sr-only">Trend Analysis</h2>
        <div className="mb-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                className="mb-2 block text-sm font-medium text-foreground"
                htmlFor="graph-season"
              >
                Season
              </label>
              <select
                className="h-11 w-full rounded-xl border border-border bg-background/80 px-3 text-foreground shadow-sm transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                id="graph-season"
                onChange={handleSeasonChange}
                value={graphSeason}
              >
                <option value="Annual">Annual</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
                <option value="Fall">Fall</option>
                <option value="Winter">Winter</option>
              </select>
            </div>
            <div>
              <label
                className="mb-2 block text-sm font-medium text-foreground"
                htmlFor="graph-measure"
              >
                Graph Measure
              </label>
              <select
                className="h-11 w-full rounded-xl border border-border bg-background/80 px-3 text-foreground shadow-sm transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
          </div>
          <ForecastControls
            enabled={forecastEnabled}
            onToggle={handleForecastToggle}
            onYearsChange={handleForecastYearsChange}
            yearsAhead={forecastYearsAhead}
          />
        </div>
        {currentHeatStress && (
          <div className="mb-5 rounded-2xl p-4 glass-panel-muted">
            <p className="text-sm font-medium text-foreground">
              {currentHeatStress.prefix}{" "}
              <span className={`font-bold ${currentHeatStress.colorClass}`}>
                {currentHeatStress.value}
              </span>
            </p>
            {forecastEnabled && forecastHeatStress && (
              <p className="mt-2 text-sm font-medium text-foreground">
                {forecastHeatStress.prefix}{" "}
                <span className={`font-bold ${forecastHeatStress.colorClass}`}>
                  {forecastHeatStress.value}
                </span>
                {forecastHeatStress.confidenceRange && (
                  <span className="ml-2 text-xs text-muted-foreground">
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
            className="rounded-full border border-border bg-background/80 px-3 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-accent"
            onClick={handleToggleMobileLegend}
            type="button"
          >
            {isMobileLegendOpen ? "Hide Graph Legend" : "Show Graph Legend"}
          </button>
        </div>
        <div
          className="min-h-[clamp(220px,42vh,520px)] min-w-0 flex-1 overflow-hidden sm:min-h-[clamp(450px,70vh,850px)]"
          id="trend-analysis-graph"
        >
          {trendGraphSnapshot ? (
            <GenerateTrendGraph
              forecastData={trendGraphSnapshot.forecastData}
              increasePerYear={trendGraphSnapshot.increase_per_year}
              isMobileViewport={isMobileViewport}
              option={trendGraphSnapshot.option}
              season={trendGraphSnapshot.season}
              showLegend={showTrendLegend}
              trendlinePets={trendGraphSnapshot.trendline_pets}
              yearPets={trendGraphSnapshot.year_pets}
              years={trendGraphSnapshot.years}
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl px-4 text-center text-sm text-muted-foreground graph-surface-panel">
              Loading chart…
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

TrendAnalysisComponent.displayName = "TrendAnalysis";

export const TrendAnalysis = React.memo(TrendAnalysisComponent);
