"use client";
import React, { FC } from "react";

import { HeatStressLegend } from "@/components/app/heat-stress-legend";
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

        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="w-full lg:w-64 lg:shrink-0">
            <div className="lg:sticky lg:top-8">
              <HeatStressLegend />
            </div>
          </div>

          <div className="min-w-0 flex-1">
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
          </div>
        </div>
      </main>
    </div>
  );
};

export { Main as PageMain };
