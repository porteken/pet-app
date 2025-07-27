"use client";

import { Button, Loader, Select } from "@mantine/core";
// Import 'useEffect' from React
import React, {
  FC,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";

import { setGraphMeasure } from "@/app/actions";
import { GenerateTrendGraph } from "@/features/generate-graph";
import { HeaderBar } from "@/features/header-bar";
import Modal from "@/features/modal";
import { FetchTrendGraphData } from "@/lib/api/fetch-client";
import { GraphOptions } from "@/lib/utils/select-options";
import { LocationProperties } from "@/types/types";

import MapComponent from "./map-component";
import { MapProperties } from "./types";

const Home: FC<MapProperties> = ({
  initialGraphMeasure,
  LocationOptions,
  locations,
}: MapProperties) => {
  const [selectedGraphMeasure, setSelectedGraphMeasure] = useState("avg"); // Start with default value to avoid hydration mismatch
  // Set the actual value after hydration to avoid mismatch
  useEffect(() => {
    setSelectedGraphMeasure(initialGraphMeasure);
  }, [initialGraphMeasure]);

  const [petGraph, setPetGraph] = useState<null | ReactElement>();
  const [graphLoading, setGraphLoading] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<null | number>();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationProperties | null>();

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
        setPetGraph(
          <div className="flex h-[300px] w-full flex-col items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-red-500">
                <svg
                  className="mx-auto size-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <p className="mb-2 text-gray-600">Unable to load graph data</p>
              <p className="text-sm text-gray-500">
                Contact Kenneth Porter at{" "}
                <a
                  className="text-blue-600 underline hover:text-blue-800"
                  href="mailto:porteken@gmail.com"
                >
                  porteken@gmail.com
                </a>
              </p>
            </div>
          </div>
        );
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
      const location =
        locations.find(loc => loc.location_id === locationId) || undefined;
      setSelectedLocation(location);
      setModalOpen(true);
      await generateGraph(locationId, selectedGraphMeasure);
    },
    [generateGraph, selectedGraphMeasure, locations]
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
        <div className="flex min-h-[340px] w-full max-w-[90vw] min-w-[320px] flex-col items-center space-y-4">
          <div className="w-full max-w-md">
            <Select
              className="w-full"
              data={(GraphOptions || []).map(option => ({
                label: option.label,
                value: option.key,
              }))}
              label="Measure"
              onChange={value => handleSelectChange(value!)}
              size="sm"
              value={selectedGraphMeasure}
            />
          </div>
          <div className="flex min-h-[300px] w-full max-w-4xl items-center justify-center">
            {graphLoading ? (
              <div className="flex size-full flex-col items-center justify-center">
                <Loader size="md" />
                <span className="mt-2 text-gray-500">Loading graph...</span>
              </div>
            ) : (
              petGraph
            )}
          </div>
          {selectedLocation && (
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  globalThis.location.href = `/${selectedLocation.location_id}`;
                }}
                variant="filled"
              >
                View Full Details
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Home;
