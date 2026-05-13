"use client";

import { HeaderBar } from "@/features/header-bar";
import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import {
  setForecastPreferences,
  setGraphMeasure,
  setGraphSeason,
} from "@/lib/actions/actions";
import { FetchForecastData } from "@/lib/api/fetch-client";
import { getTrendGraphQueryOptions } from "@/lib/api/query-client";
import { normalizeGraphSeason, type GraphSeason } from "@/lib/constants";
import { GraphOptions, SeasonOptions } from "@/lib/utils/select-options";
import {
  buildTrendAnalysisResult,
  type TrendGraphSnapshot,
} from "@/lib/utils/trend-analysis";
import { useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { GraphSection } from "./graph-section";
import { MapComponent } from "./map-component";

import type { MapProperties } from "../model/types";
import type { HeatStressDescription } from "@/lib/utils/thermal-stress";
import type { LocationProperties } from "@/types/types";
import type { FC } from "react";

const Modal = dynamic(() => import("@/components/modal"), {
  ssr: false,
});

interface GenerateGraphOptions {
  enableForecast: boolean;
  locationId: number;
  option: string;
  season: GraphSeason;
  yearsAhead: number;
}

const ignorePersistenceError = async (promise: Promise<void>) => {
  try {
    await promise;
  } catch {
    // The local UI state remains valid even if persistence fails.
  }
};

const Home: FC<MapProperties> = ({
  initialForecastEnabled,
  initialForecastYearsAhead,
  initialGraphMeasure,
  initialGraphSeason,
  LocationOptions,
  locations,
}: MapProperties) => {
  const queryClient = useQueryClient();
  const [selectedGraphMeasure, setSelectedGraphMeasure] = useState(
    () => initialGraphMeasure,
  );
  const [selectedGraphSeason, setSelectedGraphSeason] = useState<GraphSeason>(
    () => initialGraphSeason,
  );

  const [trendGraphSnapshot, setTrendGraphSnapshot] =
    useState<TrendGraphSnapshot>();
  const [graphHasError, setGraphHasError] = useState(false);
  const [graphLoading, setGraphLoading] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<number>();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationProperties>();
  const [forecastEnabled, setForecastEnabled] = useState(
    () => initialForecastEnabled,
  );
  const [forecastYearsAhead, setForecastYearsAhead] = useState(
    () => initialForecastYearsAhead,
  );
  const isMobileViewport = useIsMobileViewport();
  const [isMobileGraphLegendOpen, setIsMobileGraphLegendOpen] = useState(false);
  const [heatStressDescription, setHeatStressDescription] =
    useState<HeatStressDescription>();
  const [forecastHeatStress, setForecastHeatStress] =
    useState<HeatStressDescription>();

  const locationMap = useMemo(
    () => new Map(locations.map((loc) => [loc.location_id, loc])),
    [locations],
  );

  const selectOptions = useMemo(
    () =>
      GraphOptions.map((option) => ({
        label: option.label,
        value: option.key,
      })),
    [],
  );
  const seasonOptions = useMemo(
    () =>
      SeasonOptions.map((option) => ({
        label: option.label,
        value: normalizeGraphSeason(option.key),
      })),
    [],
  );

  const generateGraph = useCallback(
    async ({
      enableForecast,
      locationId,
      option,
      season,
      yearsAhead,
    }: GenerateGraphOptions) => {
      setGraphLoading(true);
      setGraphHasError(false);
      try {
        const {
          forecastHeatStress: newForecastHeatStress,
          heatStressDescription: newHeatStressDescription,
          snapshot,
        } = await buildTrendAnalysisResult({
          enableForecast,
          fetchForecastData: () =>
            FetchForecastData(locationId, yearsAhead, season, option),
          fetchTrendGraphData: () =>
            queryClient.fetchQuery(
              getTrendGraphQueryOptions(locationId, option, season),
            ),
          option,
          season,
        });

        setHeatStressDescription(newHeatStressDescription);
        setForecastHeatStress(newForecastHeatStress);
        setTrendGraphSnapshot(snapshot);
      } catch {
        setTrendGraphSnapshot(undefined);
        setGraphHasError(true);
        setHeatStressDescription(undefined);
        setForecastHeatStress(undefined);
      } finally {
        setGraphLoading(false);
      }
    },
    [queryClient],
  );

  const handleSelectChange = useCallback(
    (option: string) => {
      if (selectedLocationId !== undefined) {
        setIsMobileGraphLegendOpen(false);
        setSelectedGraphMeasure(option);
        void ignorePersistenceError(setGraphMeasure(option));
      }
    },
    [selectedLocationId],
  );

  const handleSeasonChange = useCallback((season: GraphSeason) => {
    const nextSeason = normalizeGraphSeason(season);
    setIsMobileGraphLegendOpen(false);
    setSelectedGraphSeason(nextSeason);
    void ignorePersistenceError(setGraphSeason(nextSeason));
  }, []);

  useEffect(() => {
    if (selectedLocationId !== undefined) {
      const performGenerate = async () => {
        try {
          await generateGraph({
            enableForecast: forecastEnabled,
            locationId: selectedLocationId,
            option: selectedGraphMeasure,
            season: selectedGraphSeason,
            yearsAhead: forecastYearsAhead,
          });
        } catch {
          // Error is handled by generateGraph try/catch
        }
      };
      void performGenerate();
    }
  }, [
    selectedLocationId,
    selectedGraphMeasure,
    selectedGraphSeason,
    forecastEnabled,
    forecastYearsAhead,
    generateGraph,
  ]);

  const handleMarkerClick = useCallback(
    (locationId: number) => {
      setIsMobileGraphLegendOpen(false);
      setSelectedLocationId(locationId);
      const location = locationMap.get(locationId);
      setSelectedLocation(location);
      setModalOpen(true);
    },
    [locationMap],
  );

  const handleForecastToggle = useCallback(
    (enabled: boolean) => {
      setForecastEnabled(enabled);
      void setForecastPreferences(enabled, forecastYearsAhead);
    },
    [forecastYearsAhead],
  );

  const handleForecastYearsChange = useCallback(
    (yearsAhead: number) => {
      setForecastYearsAhead(yearsAhead);
      void setForecastPreferences(forecastEnabled, yearsAhead);
    },
    [forecastEnabled],
  );

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleToggleMobileGraphLegend = useCallback(() => {
    setIsMobileGraphLegendOpen((previous) => !previous);
  }, []);

  const desktopDialogHeightClass = useMemo(() => {
    if (graphLoading) {
      return "sm:!max-h-[94dvh] sm:!overflow-y-auto";
    }

    return "sm:!h-[96dvh] sm:!max-h-[99dvh] sm:!w-[95vw] sm:!max-w-5xl sm:!overflow-y-auto";
  }, [graphLoading]);

  return (
    <div className="flex h-dvh w-full flex-col">
      <div className="z-10010 shrink-0">
        <HeaderBar LocationOptions={LocationOptions} />
      </div>
      <main
        className="relative min-h-0 flex-1 overflow-hidden"
        id="main-content"
      >
        <MapComponent
          locations={locations}
          onMarkerClick={handleMarkerClick}
          selectedGraphMeasure={selectedGraphMeasure}
          selectedGraphSeason={selectedGraphSeason}
        />
      </main>
      <Modal
        dialogClassName={`${desktopDialogHeightClass} !bg-background !backdrop-blur-none`}
        mobileFullscreen
        onClose={handleModalClose}
        open={modalOpen}
        title={
          selectedLocation
            ? `${selectedLocation.city}, ${selectedLocation.state}`
            : undefined
        }
      >
        <GraphSection
          forecastEnabled={forecastEnabled}
          forecastHeatStress={forecastHeatStress}
          forecastYearsAhead={forecastYearsAhead}
          graphHasError={graphHasError}
          graphLoading={graphLoading}
          heatStressDescription={heatStressDescription}
          isMobileGraphLegendOpen={isMobileGraphLegendOpen}
          isMobileViewport={isMobileViewport}
          onForecastToggle={handleForecastToggle}
          onForecastYearsChange={handleForecastYearsChange}
          onSeasonChange={handleSeasonChange}
          onSelectChange={handleSelectChange}
          onToggleMobileGraphLegend={handleToggleMobileGraphLegend}
          selectedGraphMeasure={selectedGraphMeasure}
          selectedGraphSeason={selectedGraphSeason}
          selectedLocation={selectedLocation}
          seasonOptions={seasonOptions}
          selectOptions={selectOptions}
          trendGraphSnapshot={trendGraphSnapshot}
        />
      </Modal>
    </div>
  );
};

export default Home;
