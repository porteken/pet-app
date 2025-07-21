"use client";

import { Button, Select, SelectItem, Spinner } from "@heroui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FC, useCallback, useState, ReactElement } from "react";

import { FetchTrendGraphData } from "../../lib/fetch-client";
import { GraphOptions } from "../../lib/select-options";
import { LocationProps } from "../../types/types";
import { GenerateTrendGraph } from "../generate-graph";
import { HeaderBar } from "../header-bar";
import Modal from "../modal";

import MapComponent from "./map-component";
import { MapProps } from "./types";

const defaultGraphMeasure = "avg";

const Home: FC<MapProps> = ({ LocationOptions, locations }: MapProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialGraphMeasure = searchParams.get("type") || defaultGraphMeasure;

  const [petGraph, setPetGraph] = useState<ReactElement | null>();
  const [graphLoading, setGraphLoading] = useState(false);
  const [selectedGraphMeasure, setSelectedGraphMeasure] =
    useState(initialGraphMeasure);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationProps | null>();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        // eslint-disable-next-line drizzle/enforce-delete-with-where
        params.delete(name);
      }
      router.push(`?${params.toString()}`);
    },
    [searchParams, router]
  );

  const generateGraph = useCallback(
    async (locationId: number, option: string) => {
      setGraphLoading(true);
      try {
        const { years, year_pets, trendline_pets } = await FetchTrendGraphData(
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
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <p className="mb-2 text-gray-600">Unable to load graph data</p>
              <p className="text-sm text-gray-500">
                Contact Kenneth Porter at{" "}
                <a
                  href="mailto:porteken@gmail.com"
                  className="text-blue-600 underline hover:text-blue-800"
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
      if (selectedLocationId != undefined) {
        setSelectedGraphMeasure(option);
        createQueryString("type", option === defaultGraphMeasure ? "" : option);
        await generateGraph(selectedLocationId, option);
      }
    },
    [selectedLocationId, createQueryString, generateGraph]
  );

  const handleMarkerClick = useCallback(
    async (locationId: number) => {
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
      <MapComponent locations={locations} onMarkerClick={handleMarkerClick} />
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          selectedLocation
            ? `${selectedLocation.city}, ${selectedLocation.state}`
            : undefined
        }
      >
        <div className="flex min-h-[340px] w-full min-w-[320px] max-w-[90vw] flex-col items-center space-y-4">
          <div className="w-full max-w-md">
            <Select
              label="Measure"
              items={GraphOptions}
              selectedKeys={new Set([selectedGraphMeasure])}
              className="w-full"
              onChange={e => handleSelectChange(e.target.value)}
            >
              {GraphOptions.map(option => (
                <SelectItem key={option.key}>{option.label}</SelectItem>
              ))}
            </Select>
          </div>
          <div className="flex min-h-[300px] w-full max-w-4xl items-center justify-center">
            {graphLoading ? (
              <div className="flex size-full flex-col items-center justify-center">
                <Spinner size="lg" />
                <span className="mt-2 text-gray-500">Loading graph...</span>
              </div>
            ) : (
              petGraph
            )}
          </div>
          {selectedLocation && (
            <div className="flex justify-center">
              <Button
                color="primary"
                variant="flat"
                onPress={() => {
                  globalThis.location.href = `/${selectedLocation.location_id}`;
                }}
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
