"use client";

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
import Modal from "@/features/modal";
import { setGraphMeasure } from "@/lib/actions/actions";
import { FetchTrendGraphData } from "@/lib/api/fetch-client";
import { GraphOptions } from "@/lib/utils/select-options";
import { LocationProperties } from "@/types/types";

import { ErrorGraphDisplay } from "./components/error-graph-display";
import { GraphSection } from "./components/graph-section";
import MapComponent from "./map-component";
import { MapProperties } from "./types";

const Home: FC<MapProperties> = ({
  initialGraphMeasure,
  LocationOptions,
  locations,
}: MapProperties) => {
  // Use lazy initial state to prevent unnecessary re-renders
  const [selectedGraphMeasure, setSelectedGraphMeasure] = useState(
    () => initialGraphMeasure || "avg"
  );

  // Separate states to prevent unnecessary re-renders
  const [petGraph, setPetGraph] = useState<ReactElement | undefined>();
  const [graphLoading, setGraphLoading] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<number>();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationProperties>();

  // Sync with initial value only on mount - avoid hydration mismatch
  useEffect(() => {
    if (initialGraphMeasure && selectedGraphMeasure !== initialGraphMeasure) {
      setSelectedGraphMeasure(initialGraphMeasure);
    }
  }, [initialGraphMeasure, selectedGraphMeasure]);

  // Memoize expensive computations
  const locationMap = useMemo(() => {
    return new Map(locations.map(loc => [loc.location_id, loc]));
  }, [locations]);

  const selectOptions = useMemo(
    () =>
      (GraphOptions || []).map(option => ({
        label: option.label,
        value: option.key,
      })),
    [GraphOptions]
  );

  const generateGraph = useCallback(
    async (locationId: number, option: string) => {
      // Check if we're in a browser environment before accessing window-dependent code
      if (globalThis.window === undefined) {
        return; // Return early if we're in server-side rendering
      }

      setGraphLoading(true);
      try {
        const { trendline_pets, year_pets, years } = await FetchTrendGraphData(
          option,
          locationId
        );
        const graph = GenerateTrendGraph(
          years,
          option,
          year_pets,
          trendline_pets
        );
        setPetGraph(graph);
      } catch {
        setPetGraph(<ErrorGraphDisplay />);
      } finally {
        setGraphLoading(false);
      }
    },
    []
  );

  const handleSelectChange = useCallback(
    async (option: string) => {
      // Check if we're in a browser environment
      if (globalThis.window === undefined) {
        return; // Return early if we're in server-side rendering
      }

      if (selectedLocationId !== undefined) {
        setSelectedGraphMeasure(option);
        await setGraphMeasure(option);
        await generateGraph(selectedLocationId!, option);
      }
    },
    [selectedLocationId, generateGraph]
  );

  const handleMarkerClick = useCallback(
    async (locationId: number) => {
      // Check if we're in a browser environment
      if (globalThis.window === undefined) {
        return; // Return early if we're in server-side rendering
      }

      setSelectedLocationId(locationId);
      const location = locationMap.get(locationId);
      setSelectedLocation(location);
      setModalOpen(true);
      await generateGraph(locationId, selectedGraphMeasure);
    },
    [generateGraph, selectedGraphMeasure, locationMap]
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
          graphLoading={graphLoading}
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
