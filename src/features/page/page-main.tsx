"use client";
import React, { FC } from "react";

import { HeaderBar } from "@/features/header-bar";
import { setGraphMeasure } from "@/lib/actions/actions";

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
  TrendlinePets,
  YearPets,
  Years,
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderBar id={id} LocationOptions={LocationOptions} />
      <main className="mx-auto max-w-full px-4 py-8">
        <PageHeader location={location} />

        <div className="grid gap-8 lg:grid-cols-2">
          <TrendAnalysis
            id={id}
            initialGraphMeasure={initialGraphMeasure}
            onMeasureChange={handleMeasureChange}
            TrendlinePets={TrendlinePets}
            YearPets={YearPets}
            Years={Years}
          />

          <ReferenceData
            CurrentDates={CurrentDates}
            CurrentPets={CurrentPets}
            id={id}
            ReferencePets={ReferencePets}
          />
        </div>
      </main>
    </div>
  );
};

// Export as both Main (default) and PageMain (named export for tests)
export { Main as PageMain };
export default Main;
