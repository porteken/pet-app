"use client";

import { Button, Select, SelectItem, Spinner } from "@heroui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FC, useCallback, useState } from "react";

import { FetchTrendGraphData } from "../../lib/fetchClient";
import { GraphOptions } from "../../lib/selectOptions";
import { LocationProps } from "../../types/types";
import { GenerateTrendGraph } from "../generate-graph";
import { HeaderBar } from "../header-bar";
import Modal from "../Modal";

import MapComponent from "./map-component";
import { MapProps } from "./types";

const defaultGraphMeasure = "avg";

const Home: FC<MapProps> = ({ LocationOptions, locations }: MapProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialGraphMeasure = searchParams.get("type") || defaultGraphMeasure;

  const [petGraph, setPetGraph] = useState<React.ReactElement | null>(null);
  const [graphLoading, setGraphLoading] = useState(false);
  const [selectedGraphMeasure, setSelectedGraphMeasure] =
    useState(initialGraphMeasure);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationProps | null>(null);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
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
          <div className="flex h-[300px] items-center justify-center text-gray-500">
            Error loading graph
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
      if (selectedLocationId !== null) {
        setSelectedGraphMeasure(option);
        createQueryString("type", option !== defaultGraphMeasure ? option : "");
        await generateGraph(selectedLocationId, option);
      }
    },
    [selectedLocationId, createQueryString, generateGraph]
  );

  const handleMarkerClick = useCallback(
    async (locationId: number) => {
      setSelectedLocationId(locationId);
      const location =
        locations.find(loc => loc.location_id === locationId) || null;
      setSelectedLocation(location);
      setModalOpen(true);
      await generateGraph(locationId, selectedGraphMeasure);
    },
    [generateGraph, selectedGraphMeasure, locations]
  );

  return (
    <div className="relative h-screen w-full">
      <div className="absolute left-0 right-0 top-0 z-50">
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
              <div className="flex h-full w-full flex-col items-center justify-center">
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
                  window.location.href = `/${selectedLocation.location_id}`;
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
