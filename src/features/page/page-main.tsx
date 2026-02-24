"use client";
import React, { FC } from "react";

import { HeaderBar } from "@/features/header-bar/header-bar";
import { setGraphMeasure } from "@/lib/actions/actions";

import { HeatStressLegend } from "./heat-stress-legend";
import { PageHeader } from "./page-header";
import { ReferenceData } from "./reference-data";
import { TrendAnalysis } from "./trend-analysis";
import { PageProperties } from "./types";

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
  location,
  LocationOptions,
  ReferencePets,
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderBar id={id} LocationOptions={LocationOptions} />
      <main className="mx-auto max-w-full px-4 py-8">
        <PageHeader location={location} />

        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="w-full lg:w-64 lg:shrink-0">
            <div className="lg:sticky lg:top-8">
              <HeatStressLegend />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="grid gap-8 lg:grid-cols-2">
              <TrendAnalysis
                id={id}
                initialForecastEnabled={initialForecastEnabled}
                initialForecastYearsAhead={initialForecastYearsAhead}
                initialGraphMeasure={initialGraphMeasure}
                onMeasureChange={handleMeasureChange}
              />

              <ReferenceData
                CurrentDates={CurrentDates}
                CurrentPets={CurrentPets}
                id={id}
                ReferencePets={ReferencePets}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export { Main as PageMain };
export default Main;
