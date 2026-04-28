"use client";

import { ForecastControls } from "@/components/app/forecast-controls";
import { GenerateTrendGraph } from "@/features/graph";
import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import { setForecastPreferences } from "@/lib/actions/actions";
import { FetchForecastData, FetchTrendGraphData } from "@/lib/api/fetch-client";
import { normalizeGraphSeason, type GraphSeason } from "@/lib/constants";
import { type HeatStressDescription } from "@/lib/utils/thermal-stress";
import {
  buildTrendAnalysisResult,
  type TrendGraphSnapshot,
} from "@/lib/utils/trend-analysis";
import React from "react";

interface TrendAnalysisProperties {
  graphSeason: GraphSeason;
  id: number;
  initialForecastEnabled: boolean;
  initialForecastYearsAhead: number;
  initialGraphMeasure: string;
  onMeasureChange: (measure: string) => Promise<void>;
  onSeasonChange: (season: GraphSeason) => Promise<void>;
  referenceYear: string;
}

const TrendAnalysisComponent: React.FC<TrendAnalysisProperties> = ({
  graphSeason,
  id,
  initialForecastEnabled,
  initialForecastYearsAhead,
  initialGraphMeasure,
  onMeasureChange,
  onSeasonChange,
  referenceYear,
}) => {
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
  const [trendGraphSnapshot, setTrendGraphSnapshot] =
    React.useState<TrendGraphSnapshot>();
  const isMobileViewport = useIsMobileViewport();
  const [isMobileLegendOpen, setIsMobileLegendOpen] = React.useState(false);

  const showTrendLegend = !isMobileViewport || isMobileLegendOpen;

  const generatePetTrendGraph = React.useCallback(
    async (
      option: string,
      season: GraphSeason,
      enableForecast: boolean,
      yearsAhead: number,
    ) => {
      try {
        const {
          forecastHeatStress: newForecastHeatStress,
          heatStressDescription: newHeatStressDescription,
          snapshot,
        } = await buildTrendAnalysisResult({
          enableForecast,
          fetchForecastData: () => FetchForecastData(id, yearsAhead, season),
          fetchTrendGraphData: () => FetchTrendGraphData(option, id, season),
          option,
          season,
        });

        setCurrentHeatStress(newHeatStressDescription);
        setForecastHeatStress(newForecastHeatStress);
        setTrendGraphSnapshot(snapshot);
      } catch {
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
    [id],
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
    [onMeasureChange],
  );

  const handleSeasonChange = React.useCallback(
    async (event: React.ChangeEvent<HTMLSelectElement>) => {
      const season = normalizeGraphSeason(event.target.value);
      setIsMobileLegendOpen(false);

      try {
        await onSeasonChange(season);
      } catch {
        // Ignore persistence failures and keep the local selection.
      }
    },
    [onSeasonChange],
  );

  const forecastSupported = selectedGraphMeasure === "avg";

  React.useEffect(() => {
    generatePetTrendGraph(
      selectedGraphMeasure,
      graphSeason,
      forecastEnabled && forecastSupported,
      forecastYearsAhead,
    );
  }, [
    generatePetTrendGraph,
    selectedGraphMeasure,
    graphSeason,
    forecastEnabled,
    forecastSupported,
    forecastYearsAhead,
    referenceYear,
  ]);

  const handleForecastToggle = React.useCallback(
    (enabled: boolean) => {
      setForecastEnabled(enabled);
      setForecastPreferences(enabled, forecastYearsAhead).catch(() => {});
    },
    [forecastYearsAhead],
  );

  const handleForecastYearsChange = React.useCallback(
    (yearsAhead: number) => {
      setForecastYearsAhead(yearsAhead);
      setForecastPreferences(forecastEnabled, yearsAhead).catch(() => {});
    },
    [forecastEnabled],
  );

  const handleToggleMobileLegend = React.useCallback(() => {
    setIsMobileLegendOpen((previous) => !previous);
  }, []);

  return (
    <div className="h-full min-h-0">
      <div className="glass-panel fade-in-up flex h-full min-h-0 flex-col rounded-3xl p-4 sm:px-5 sm:py-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-primary mb-1 text-xs font-semibold tracking-[0.24em] uppercase">
              Historical trend
            </p>
            <h2 className="text-foreground text-lg font-semibold sm:text-xl">
              Trend Analysis
            </h2>
          </div>
          <span className="rounded-full bg-(--pill-surface) px-3 py-1 text-xs font-semibold text-(--pill-foreground)">
            Forecast-ready
          </span>
        </div>
        <div className="mb-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                className="text-foreground mb-2 block text-sm font-medium"
                htmlFor="graph-season"
              >
                Season
              </label>
              <select
                className="border-border bg-background/80 text-foreground focus:border-primary focus:ring-primary/20 h-11 w-full rounded-xl border px-3 shadow-sm transition outline-none focus:ring-2"
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
                className="text-foreground mb-2 block text-sm font-medium"
                htmlFor="graph-measure"
              >
                Graph Measure
              </label>
              <select
                className="border-border bg-background/80 text-foreground focus:border-primary focus:ring-primary/20 h-11 w-full rounded-xl border px-3 shadow-sm transition outline-none focus:ring-2"
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
          {forecastSupported && (
            <ForecastControls
              enabled={forecastEnabled}
              onToggle={handleForecastToggle}
              onYearsChange={handleForecastYearsChange}
              yearsAhead={forecastYearsAhead}
            />
          )}
        </div>
        {currentHeatStress && (
          <div className="glass-panel-muted mb-5 rounded-2xl p-4">
            <p className="text-foreground text-sm font-medium">
              {currentHeatStress.prefix}{" "}
              <span className={`font-bold ${currentHeatStress.colorClass}`}>
                {currentHeatStress.value}
              </span>
            </p>
            {forecastEnabled && forecastHeatStress && (
              <p className="text-foreground mt-2 text-sm font-medium">
                {forecastHeatStress.prefix}{" "}
                <span className={`font-bold ${forecastHeatStress.colorClass}`}>
                  {forecastHeatStress.value}
                </span>
                {forecastHeatStress.confidenceRange && (
                  <span className="text-muted-foreground ml-2 text-xs">
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
            className="border-border bg-background/80 text-foreground hover:bg-accent rounded-full border px-3 py-2 text-sm font-semibold shadow-sm transition"
            onClick={handleToggleMobileLegend}
            type="button"
          >
            {isMobileLegendOpen ? "Hide Graph Legend" : "Show Graph Legend"}
          </button>
        </div>
        <div
          className="min-h-[clamp(220px,42vh,520px)] flex-1 overflow-hidden sm:min-h-[clamp(450px,70vh,850px)]"
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
            <div className="graph-surface-panel text-muted-foreground flex h-full items-center justify-center rounded-2xl px-4 text-center text-sm">
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
