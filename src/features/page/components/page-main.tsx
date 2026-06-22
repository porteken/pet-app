"use client";

import { PageShell } from "@/components/app/page-shell";
import { HeatStressLegend } from "@/components/app/thermal-stress-legend";
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

const ignorePersistenceError = async (promise: Promise<void>) => {
  try {
    await promise;
  } catch {
    // The local UI state remains valid even if persistence fails.
  }
};

const Main: FC<PageProperties> = ({
  CurrentDates,
  CurrentPets,
  IncreasePerYear,
  id,
  initialForecastEnabled,
  initialForecastYearsAhead,
  initialGraphMeasure,
  initialGraphSeason,
  initialReferenceYear,
  location,
  LocationOptions,
  ReferencePets,
  TrendlinePets,
  YearPets,
  Years,
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

      void ignorePersistenceError(
        persistReferenceYearPreference(referenceYear),
      );
    },
    [],
  );

  const handleToggleLegend = React.useCallback(() => {
    setIsLegendOpen((previous) => !previous);
  }, []);

  return (
    <div className="min-h-screen">
      <PageShell
        id={id}
        LocationOptions={LocationOptions}
        mainClassName="mx-auto w-full max-w-[1700px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10"
      >
        <PageHeader location={location} />

        <div className="grid items-stretch gap-8 lg:grid-cols-2 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.25fr)] 2xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.35fr)]">
          <TrendAnalysis
            graphSeason={selectedGraphSeason}
            id={id}
            initialForecastEnabled={initialForecastEnabled}
            initialForecastYearsAhead={initialForecastYearsAhead}
            initialGraphMeasure={initialGraphMeasure}
            initialGraphSeason={initialGraphSeason}
            initialIncreasePerYear={IncreasePerYear}
            initialTrendlinePets={TrendlinePets}
            initialYearPets={YearPets}
            initialYears={Years}
            onMeasureChange={handleMeasureChange}
            onSeasonChange={handleSeasonChange}
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
                className="max-h-[80vh] max-w-[78vw] overflow-auto rounded-3xl p-2 shadow-md glass-panel sm:max-w-xs"
                id="city-thermal-stress-legend"
              >
                <HeatStressLegend />
              </div>
            )}
            <button
              aria-controls="city-thermal-stress-legend"
              aria-expanded={isLegendOpen}
              className="rounded-full px-4 py-2 text-sm font-semibold text-foreground glass-panel-muted transition hover:bg-accent"
              onClick={handleToggleLegend}
              type="button"
            >
              {isLegendOpen
                ? "Hide Thermal Stress Index"
                : "Show Thermal Stress Index"}
            </button>
          </div>
        </div>
      </PageShell>
    </div>
  );
};

export { Main as PageMain };
