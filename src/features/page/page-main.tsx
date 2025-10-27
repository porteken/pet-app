"use client";
import React, { FC } from "react";

import { HeaderBar } from "@/features/header-bar";
import { setGraphMeasure } from "@/lib/actions/actions";

import { HeatStressLegend } from "./components/heat-stress-legend";
import { PageHeader } from "./components/page-header";
import { ReferenceData } from "./components/reference-data";
import { TrendAnalysis } from "./components/trend-analysis";
import { PageProperties } from "./types";

const handleMeasureChange = async (measure: string): Promise<void> => {
  await setGraphMeasure(measure);
};

const Main: FC<PageProperties> = ({
  CurrentDates,
  CurrentPets,
  id,
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
          <div className="w-full lg:w-64 lg:flex-shrink-0">
            <div className="lg:sticky lg:top-8">
              <HeatStressLegend />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="grid gap-8 lg:grid-cols-2">
              <TrendAnalysis
                id={id}
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
