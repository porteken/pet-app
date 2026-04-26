"use client";
import React, { FC } from "react";

import { HeatStressLegend } from "@/components/app/thermal-stress-legend";
import { HeaderBar } from "@/features/header-bar";
import { setGraphMeasure, setGraphSeason } from "@/lib/actions/actions";
import { type GraphSeason } from "@/lib/constants";

import { PageProperties } from "../model/types";
import { PageHeader } from "./page-header";
import { ReferenceData } from "./reference-data";
import { TrendAnalysis } from "./trend-analysis";

const handleMeasureChange = async (measure: string): Promise<void> => {
  try {
    await setGraphMeasure(measure);
  } catch {
    // Ignore persistence failures; the UI can continue with the selected value.
  }
};

const Main: FC<PageProperties> = ({
  CurrentDates,
  CurrentPets,
  id,
  initialForecastEnabled,
  initialForecastYearsAhead,
  initialGraphMeasure,
  initialGraphSeason,
  location,
  LocationOptions,
  ReferencePets,
}) => {
  const [selectedGraphSeason, setSelectedGraphSeason] =
    React.useState<GraphSeason>(initialGraphSeason);
  const [isLegendOpen, setIsLegendOpen] = React.useState(false);

  const handleSeasonChange = React.useCallback(async (season: GraphSeason) => {
    setSelectedGraphSeason(season);

    try {
      await setGraphSeason(season);
    } catch {
      // Ignore persistence failures; the UI can continue with the selected value.
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderBar id={id} LocationOptions={LocationOptions} />
      <main className="mx-auto max-w-full px-4 py-8" id="main-content">
        <PageHeader location={location} />

        <div className="grid items-stretch gap-8 lg:grid-cols-2">
          <TrendAnalysis
            graphSeason={selectedGraphSeason}
            id={id}
            initialForecastEnabled={initialForecastEnabled}
            initialForecastYearsAhead={initialForecastYearsAhead}
            initialGraphMeasure={initialGraphMeasure}
            onMeasureChange={handleMeasureChange}
            onSeasonChange={handleSeasonChange}
          />

          <ReferenceData
            CurrentDates={CurrentDates}
            CurrentPets={CurrentPets}
            graphSeason={selectedGraphSeason}
            id={id}
            initialGraphSeason={initialGraphSeason}
            ReferencePets={ReferencePets}
          />
        </div>

        <div className="pointer-events-none fixed bottom-6 left-6 z-40">
          <div className="pointer-events-auto flex flex-col items-start gap-2">
            {isLegendOpen && (
              <div
                className="max-h-[80vh] max-w-[78vw] overflow-auto shadow-md sm:max-w-xs"
                id="city-thermal-stress-legend"
              >
                <HeatStressLegend />
              </div>
            )}
            <button
              aria-controls="city-thermal-stress-legend"
              aria-expanded={isLegendOpen}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-md transition-colors hover:bg-gray-50"
              onClick={() => setIsLegendOpen((previous) => !previous)}
              type="button"
            >
              {isLegendOpen
                ? "Hide Thermal Stress Index"
                : "Show Thermal Stress Index"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export { Main as PageMain };
