"use client";

import dynamic from "next/dynamic";
import React, {
  FC,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { GenerateTrendGraph } from "@/features/graph/generate-graph";
import { HeaderBar } from "@/features/header-bar/header-bar";
import { setForecastPreferences, setGraphMeasure } from "@/lib/actions/actions";
import { FetchForecastData } from "@/lib/api/fetch-client";
import { getTrendGraphQueryOptions, queryClient } from "@/lib/api/query-client";
import {
  getForecastHeatStressDescription,
  getHeatStressDescription,
  type HeatStressDescription,
} from "@/lib/utils/heat-stress";
import { GraphOptions } from "@/lib/utils/select-options";
import { LocationProperties } from "@/types/types";

import { ErrorGraphDisplay } from "./error-graph-display";
import { GraphSection } from "./graph-section";
import { MapComponent } from "./map-component";
import { MapProperties } from "./types";

const Modal = dynamic(() => import("@/components/ui/modal"), {
  ssr: false,
});

const Home: FC<MapProperties> = ({
  initialForecastEnabled,
  initialForecastYearsAhead,
  initialGraphMeasure,
  LocationOptions,
  locations,
}: MapProperties) => {
  const [selectedGraphMeasure, setSelectedGraphMeasure] = useState(
    () => initialGraphMeasure
  );

  const [petGraph, setPetGraph] = useState<ReactElement | undefined>();
  const [graphLoading, setGraphLoading] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<number>();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationProperties>();
  const [forecastEnabled, setForecastEnabled] = useState(
    () => initialForecastEnabled
  );
  const [forecastYearsAhead, setForecastYearsAhead] = useState(
    () => initialForecastYearsAhead
  );
  const [heatStressDescription, setHeatStressDescription] =
    useState<HeatStressDescription>();
  const [forecastHeatStress, setForecastHeatStress] =
    useState<HeatStressDescription>();

  const locationMap = useMemo(() => {
    return new Map(locations.map(loc => [loc.location_id, loc]));
  }, [locations]);

  const selectOptions = useMemo(
    () =>
      GraphOptions.map(option => ({
        label: option.label,
        value: option.key,
      })),
    []
  );

  const generateGraph = useCallback(
    async (
      locationId: number,
      option: string,
      enableForecast: boolean,
      yearsAhead: number
    ) => {
      setGraphLoading(true);
      try {
        const trendGraphDataPromise = queryClient.fetchQuery(
          getTrendGraphQueryOptions(locationId, option)
        );
        const forecastDataPromise = enableForecast
          ? FetchForecastData(locationId, yearsAhead)
          : undefined;
        const { increase_per_year, trendline_pets, year_pets, years } =
          await trendGraphDataPromise;
        const forecastData = forecastDataPromise
          ? await forecastDataPromise
          : undefined;

        if (years.length === 0 || year_pets.length === 0) {
          throw new Error("No trend data available");
        }

        const currentYear = years.at(-1)!;
        const currentYearIndex = years.length - 1;
        const currentPetValue = year_pets[currentYearIndex];
        const heatStress = getHeatStressDescription(
          currentPetValue,
          option,
          currentYear
        );
        setHeatStressDescription(heatStress);

        if (
          enableForecast &&
          forecastData &&
          forecastData.forecastValues.length > 0 &&
          forecastData.lowerBound10.length > 0 &&
          forecastData.upperBound90.length > 0
        ) {
          const finalForecastYear = forecastData.forecastYears.at(-1);
          const finalForecastValue = forecastData.forecastValues.at(-1);
          const finalLowerBound25 = forecastData.lowerBound10.at(-1);
          const finalUpperBound75 = forecastData.upperBound90.at(-1);

          if (
            finalForecastYear !== undefined &&
            finalForecastValue !== undefined &&
            finalLowerBound25 !== undefined &&
            finalUpperBound75 !== undefined &&
            !Number.isNaN(finalLowerBound25) &&
            !Number.isNaN(finalUpperBound75)
          ) {
            const forecastHeatStress = getForecastHeatStressDescription(
              finalForecastValue,
              finalForecastYear,
              finalLowerBound25,
              finalUpperBound75
            );
            setForecastHeatStress(forecastHeatStress);
          } else {
            setForecastHeatStress(undefined);
          }
        } else {
          setForecastHeatStress(undefined);
        }

        const graph = GenerateTrendGraph(
          years,
          option,
          year_pets,
          trendline_pets,
          increase_per_year,
          forecastData
        );
        setPetGraph(graph);
      } catch {
        setPetGraph(<ErrorGraphDisplay />);
        setHeatStressDescription(undefined);
        setForecastHeatStress(undefined);
      } finally {
        setGraphLoading(false);
      }
    },
    []
  );

  const handleSelectChange = useCallback(
    async (option: string) => {
      if (selectedLocationId !== undefined) {
        setSelectedGraphMeasure(option);
        await setGraphMeasure(option);
      }
    },
    [selectedLocationId]
  );

  useEffect(() => {
    if (selectedLocationId !== undefined) {
      generateGraph(
        selectedLocationId,
        selectedGraphMeasure,
        forecastEnabled && selectedGraphMeasure === "avg",
        forecastYearsAhead
      );
    }
  }, [
    selectedLocationId,
    selectedGraphMeasure,
    forecastEnabled,
    forecastYearsAhead,
    generateGraph,
  ]);

  const handleMarkerClick = useCallback(
    (locationId: number) => {
      setSelectedLocationId(locationId);
      const location = locationMap.get(locationId);
      setSelectedLocation(location);
      setModalOpen(true);
    },
    [locationMap]
  );

  const handleForecastToggle = useCallback(
    (enabled: boolean) => {
      setForecastEnabled(enabled);
      void setForecastPreferences(enabled, forecastYearsAhead);
    },
    [forecastYearsAhead]
  );

  const handleForecastYearsChange = useCallback(
    (yearsAhead: number) => {
      setForecastYearsAhead(yearsAhead);
      void setForecastPreferences(forecastEnabled, yearsAhead);
    },
    [forecastEnabled]
  );

  return (
    <div className="flex h-dvh w-full flex-col">
      <div className="z-10010 shrink-0">
        <HeaderBar LocationOptions={LocationOptions} />
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <MapComponent
          locations={locations}
          onMarkerClick={handleMarkerClick}
          selectedGraphMeasure={selectedGraphMeasure}
        />
      </div>
      <Modal
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
          onForecastToggle={handleForecastToggle}
          onForecastYearsChange={handleForecastYearsChange}
          onSelectChange={handleSelectChange}
          petGraph={petGraph}
          selectedGraphMeasure={selectedGraphMeasure}
          selectedLocation={selectedLocation}
          selectOptions={selectOptions}
        />
      </Modal>
    </div>
  );
};

export default Home;
