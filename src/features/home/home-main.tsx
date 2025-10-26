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

import { GenerateTrendGraph } from "@/features/generate-graph";
import { HeaderBar } from "@/features/header-bar";
import { setGraphMeasure } from "@/lib/actions/actions";
import { FetchTrendGraphData } from "@/lib/api/fetch-client";
import { calculateForecast } from "@/lib/utils/forecast";
import {
  getForecastHeatStressDescription,
  getHeatStressDescription,
  type HeatStressDescription,
} from "@/lib/utils/heat-stress";
import { GraphOptions } from "@/lib/utils/select-options";
import { LocationProperties } from "@/types/types";

import { ErrorGraphDisplay } from "./components/error-graph-display";
import { GraphSection } from "./components/graph-section";
import { MapComponent } from "./map-component";
import { MapProperties } from "./types";

const Modal = dynamic(() => import("@/components/ui/modal"), {
  ssr: false,
});

const Home: FC<MapProperties> = ({
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
  const [forecastEnabled, setForecastEnabled] = useState(false);
  const [forecastYearsAhead, setForecastYearsAhead] = useState(10);
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
        const { increase_per_year, trendline_pets, year_pets, years } =
          await FetchTrendGraphData(option, locationId);

        const forecastData = enableForecast
          ? calculateForecast(years, year_pets, yearsAhead)
          : undefined;

        const currentYear = Math.max(...years);
        const currentYearIndex = years.indexOf(currentYear);
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
          forecastData.lowerBound25.length > 0 &&
          forecastData.upperBound75.length > 0
        ) {
          const finalForecastYear = forecastData.forecastYears.at(-1);
          const finalForecastValue = forecastData.forecastValues.at(-1);
          const finalLowerBound25 = forecastData.lowerBound25.at(-1);
          const finalUpperBound75 = forecastData.upperBound75.at(-1);

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
        forecastEnabled,
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

  return (
    <div className="relative h-screen w-full">
      <div className="absolute inset-x-0 top-0 z-50">
        <HeaderBar LocationOptions={LocationOptions} />
      </div>
      <div className="absolute inset-0 top-0">
        <MapComponent locations={locations} onMarkerClick={handleMarkerClick} />
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
          onForecastToggle={setForecastEnabled}
          onForecastYearsChange={setForecastYearsAhead}
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
