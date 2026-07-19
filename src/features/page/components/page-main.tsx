"use client";

import { PageShell } from "@/components/app/page-shell";
import { HeatStressLegend } from "@/components/app/thermal-stress-legend";
import { useIgnorePersistenceError } from "@/hooks/use-ignore-persistence-error";
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

const Main: FC<PageProperties> = ({
  CurrentDates,
  CurrentPets,
  graphDataError,
  IncreasePerYear,
  id,
  initialForecastData,
  initialForecastEnabled,
  initialForecastYearsAhead,
  initialGraphMeasure,
  initialGraphSeason,
  initialReferenceYear,
  initialPetBasis,
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
  const ignorePersistenceError = useIgnorePersistenceError();

  const handleMeasureChange = React.useCallback(
    async (measure: string) => {
      await ignorePersistenceError(persistGraphMeasurePreference(measure));
    },
    [ignorePersistenceError],
  );

  const handleSeasonChange = React.useCallback(
    async (season: GraphSeason) => {
      setSelectedGraphSeason(season);
      await ignorePersistenceError(persistGraphSeasonPreference(season));
    },
    [ignorePersistenceError],
  );

  const handleReferenceYearChange = React.useCallback(
    (referenceYear: string) => {
      setSelectedReferenceYear(referenceYear);

      void ignorePersistenceError(
        persistReferenceYearPreference(referenceYear),
      );
    },
    [ignorePersistenceError],
  );

  const handleToggleLegend = React.useCallback(() => {
    setIsLegendOpen((previous) => !previous);
  }, []);

  return (
    <div className="min-h-screen">
      <PageShell
        id={id}
        LocationOptions={LocationOptions}
        mainClassName="mx-auto w-full max-w-[1700px] px-4 pt-8 pb-28 sm:px-6 sm:pb-8 lg:px-8 lg:pt-10 lg:pb-10"
      >
        <PageHeader location={location} />

        <div className="grid items-stretch gap-8 lg:grid-cols-2 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.25fr)] 2xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.35fr)]">
          <TrendAnalysis
            graphSeason={selectedGraphSeason}
            id={id}
            initialForecastData={initialForecastData}
            initialForecastEnabled={initialForecastEnabled}
            initialForecastYearsAhead={initialForecastYearsAhead}
            initialGraphMeasure={initialGraphMeasure}
            initialGraphSeason={initialGraphSeason}
            initialIncreasePerYear={IncreasePerYear}
            initialTrendlinePets={TrendlinePets}
            initialPetBasis={initialPetBasis}
            initialYearPets={YearPets}
            initialYears={Years}
            onMeasureChange={handleMeasureChange}
            onSeasonChange={handleSeasonChange}
          />

          <ReferenceData
            CurrentDates={CurrentDates}
            CurrentPets={CurrentPets}
            id={id}
            initialHasError={graphDataError}
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
