"use client";

import { useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import React, {
  FC,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { GenerateTrendGraph } from "@/features/graph";
import { HeaderBar } from "@/features/header-bar";
import {
  setForecastPreferences,
  setGraphMeasure,
  setGraphSeason,
} from "@/lib/actions/actions";
import { FetchForecastData } from "@/lib/api/fetch-client";
import { getTrendGraphQueryOptions } from "@/lib/api/query-client";
import { normalizeGraphSeason, type GraphSeason } from "@/lib/constants";
import { type HeatStressDescription } from "@/lib/utils/heat-stress";
import { GraphOptions, SeasonOptions } from "@/lib/utils/select-options";
import { buildTrendAnalysisResult } from "@/lib/utils/trend-analysis";
import { LocationProperties } from "@/types/types";

import { MapProperties } from "../model/types";
import { ErrorGraphDisplay } from "./error-graph-display";
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

  const [petGraph, setPetGraph] = useState<ReactElement | undefined>();
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
  const [isMobileViewport, setIsMobileViewport] = useState(() => {
    if (typeof globalThis.matchMedia !== "function") {
      return false;
    }

    return globalThis.matchMedia("(max-width: 639px)").matches;
  });
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

  useEffect(() => {
    if (typeof globalThis.matchMedia !== "function") {
      return;
    }

    const mediaQuery = globalThis.matchMedia("(max-width: 639px)");
    const updateIsMobileViewport = () => {
      setIsMobileViewport(mediaQuery.matches);
    };

    updateIsMobileViewport();

    mediaQuery.addEventListener("change", updateIsMobileViewport);
    return () => {
      mediaQuery.removeEventListener("change", updateIsMobileViewport);
    };
  }, []);

  const showTrendLegend = !isMobileViewport || isMobileGraphLegendOpen;

  const generateGraph = useCallback(
    async (
      locationId: number,
      option: string,
      season: GraphSeason,
      enableForecast: boolean,
      yearsAhead: number,
    ) => {
      setGraphLoading(true);
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

        if (snapshot.years.length === 0 || snapshot.year_pets.length === 0) {
          throw new Error("No trend data available");
        }

        const graph = GenerateTrendGraph({
          forecastData: snapshot.forecastData,
          increasePerYear: snapshot.increase_per_year,
          isMobileViewport,
          option: snapshot.option,
          season: snapshot.season,
          showLegend: showTrendLegend,
          trendlinePets: snapshot.trendline_pets,
          useCompactDesktopHeight: false,
          yearPets: snapshot.year_pets,
          years: snapshot.years,
        });
        setPetGraph(graph);
      } catch {
        setPetGraph(<ErrorGraphDisplay />);
        setHeatStressDescription(undefined);
        setForecastHeatStress(undefined);
      } finally {
        setGraphLoading(false);
      }
    },
    [isMobileViewport, queryClient, showTrendLegend],
  );

  const handleSelectChange = useCallback(
    async (option: string) => {
      if (selectedLocationId !== undefined) {
        setSelectedGraphMeasure(option);
        await setGraphMeasure(option);
      }
    },
    [selectedLocationId],
  );

  const handleSeasonChange = useCallback(async (season: GraphSeason) => {
    const nextSeason = normalizeGraphSeason(season);
    setSelectedGraphSeason(nextSeason);
    await setGraphSeason(nextSeason);
  }, []);

  const forecastSupported = selectedGraphMeasure === "avg";

  useEffect(() => {
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
    showTrendLegend,
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
      return "sm:!top-1/2 sm:!-translate-y-1/2 sm:!max-h-[90dvh] sm:!overflow-y-auto";
    }

    return "sm:!top-1/2 sm:!-translate-y-1/2 sm:!h-[92dvh] sm:!max-h-[98dvh] sm:!w-[95vw] sm:!max-w-5xl sm:!overflow-y-auto";
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
          petGraph={petGraph}
          selectedGraphMeasure={selectedGraphMeasure}
          selectedGraphSeason={selectedGraphSeason}
          selectedLocation={selectedLocation}
          seasonOptions={seasonOptions}
          selectOptions={selectOptions}
        />
      </Modal>
    </div>
  );
};

export default Home;
