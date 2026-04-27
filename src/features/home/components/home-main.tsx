"use client";

import { useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import React, { FC, useCallback, useMemo, useState } from "react";

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
import { type HeatStressDescription } from "@/lib/utils/thermal-stress";
import {
  buildTrendAnalysisResult,
  type TrendGraphSnapshot,
} from "@/lib/utils/trend-analysis";
import { LocationProperties } from "@/types/types";

import { MapProperties } from "../model/types";
import { GraphSection } from "./graph-section";
import { MapComponent } from "./map-component";

const Modal = dynamic(() => import("@/components/ui/modal"), {
  ssr: false,
});

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

  const locationMap = useMemo(() => {
    return new Map(locations.map((loc) => [loc.location_id, loc]));
  }, [locations]);

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
        value: option.key as GraphSeason,
      })),
    [],
  );

  const generateGraph = useCallback(
    async (
      locationId: number,
      option: string,
      season: GraphSeason,
      enableForecast: boolean,
      yearsAhead: number,
    ) => {
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
            FetchForecastData(locationId, yearsAhead, season),
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
    async (option: string) => {
      if (selectedLocationId !== undefined) {
        setIsMobileGraphLegendOpen(false);
        setSelectedGraphMeasure(option);
        await setGraphMeasure(option);
      }
    },
    [selectedLocationId],
  );

  const handleSeasonChange = useCallback(async (season: GraphSeason) => {
    const nextSeason = normalizeGraphSeason(season);
    setIsMobileGraphLegendOpen(false);
    setSelectedGraphSeason(nextSeason);
    await setGraphSeason(nextSeason);
  }, []);

  const forecastSupported = selectedGraphMeasure === "avg";

  React.useEffect(() => {
    if (selectedLocationId !== undefined) {
      generateGraph(
        selectedLocationId,
        selectedGraphMeasure,
        selectedGraphSeason,
        forecastEnabled && forecastSupported,
        forecastYearsAhead,
      );
    }
  }, [
    selectedLocationId,
    selectedGraphMeasure,
    selectedGraphSeason,
    forecastEnabled,
    forecastYearsAhead,
    forecastSupported,
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

  const desktopDialogHeightClass = useMemo(() => {
    if (graphLoading) {
      return "sm:!top-1/2 sm:!-translate-y-1/2 sm:!max-h-[94dvh] sm:!overflow-y-auto";
    }

    return "sm:!top-1/2 sm:!-translate-y-1/2 sm:!h-[96dvh] sm:!max-h-[99dvh] sm:!w-[95vw] sm:!max-w-5xl sm:!overflow-y-auto";
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
        dialogClassName={desktopDialogHeightClass}
        mobileFullscreen
        onClose={() => setModalOpen(false)}
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
          onToggleMobileGraphLegend={() =>
            setIsMobileGraphLegendOpen((previous) => !previous)
          }
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
