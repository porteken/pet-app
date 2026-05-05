"use client";

import { HeatStressLegend } from "@/components/app/thermal-stress-legend";
import { HeaderBar } from "@/features/header-bar";
import {
  persistGraphMeasurePreference,
  persistGraphSeasonPreference,
  persistReferenceYearPreference,
} from "@/lib/utils/client-preferences";
import React from "react";

import { PageHeader } from "./page-header";
import { ReferenceData } from "./reference-data";
import { TrendAnalysis } from "./trend-analysis";

import type { PageProperties } from "../model/types";
import type { GraphSeason } from "@/lib/constants";
import type { FC } from "react";

const handleMeasureChange = async (measure: string): Promise<void> => {
  try {
    await persistGraphMeasurePreference(measure);
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
  initialReferenceYear,
  location,
  LocationOptions,
  ReferencePets,
}) => {
  const [selectedGraphSeason, setSelectedGraphSeason] =
    React.useState<GraphSeason>(initialGraphSeason);
  const [selectedReferenceYear, setSelectedReferenceYear] =
    React.useState(initialReferenceYear);
  const [isLegendOpen, setIsLegendOpen] = React.useState(false);

  const handleSeasonChange = React.useCallback(async (season: GraphSeason) => {
    setSelectedGraphSeason(season);

    try {
      await persistGraphSeasonPreference(season);
    } catch {
      // Ignore persistence failures; the UI can continue with the selected value.
    }
  }, []);

  const handleReferenceYearChange = React.useCallback(
    (referenceYear: string) => {
      setSelectedReferenceYear(referenceYear);

      persistReferenceYearPreference(referenceYear).catch(() => {
        // Ignore persistence failures; the UI can continue with the selected value.
      });
    },
    [],
  );

  const handleToggleLegend = React.useCallback(() => {
    setIsLegendOpen((previous) => !previous);
  }, []);

  return (
    <div className="min-h-screen">
      <HeaderBar id={id} LocationOptions={LocationOptions} />
      <main
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10"
        id="main-content"
      >
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
            referenceYear={selectedReferenceYear}
          />

          <ReferenceData
            CurrentDates={CurrentDates}
            CurrentPets={CurrentPets}
            id={id}
            initialReferenceYear={initialReferenceYear}
            onReferenceYearChange={handleReferenceYearChange}
            referenceYear={selectedReferenceYear}
            ReferencePets={ReferencePets}
          />
        </div>

        <div className="pointer-events-none fixed bottom-6 left-6 z-40">
          <div className="pointer-events-auto flex flex-col items-start gap-2">
            {isLegendOpen && (
              <div
                className="glass-panel max-h-[80vh] max-w-[78vw] overflow-auto rounded-3xl p-2 shadow-md sm:max-w-xs"
                id="city-thermal-stress-legend"
              >
                <HeatStressLegend />
              </div>
            )}
            <button
              aria-controls="city-thermal-stress-legend"
              aria-expanded={isLegendOpen}
              className="glass-panel-muted text-foreground hover:bg-accent rounded-full px-4 py-2 text-sm font-semibold transition"
              onClick={handleToggleLegend}
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
