"use client";

import { Select, SelectItem } from "@heroui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FC } from "react";
import { useCallback, useState } from "react";

import { FetchTrendGraphData } from "../fetchClient";
import { GenerateTrendGraph } from "../generateGraph";
import { HeaderBar } from "../headerBar";
import { GraphOptions } from "../selectOptions";

import MapComponent from "./MapComponent";
import { MapProps } from "./types";

const defaultGraphType = "avg";

const Home: FC<MapProps> = ({ LocationOptions, locations }: MapProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialGraphType = searchParams.get("type") || defaultGraphType;

  const [petGraph, setPetGraph] = useState<React.ReactElement | null>(null);
  const [selectedGraphType, setSelectedGraphType] = useState(initialGraphType);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(
    null
  );

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
      try {
        const { years, year_pets, trendline_pets } = await FetchTrendGraphData(
          option,
          locationId
        );
        const graph = GenerateTrendGraph(
          years,
          option,
          year_pets,
          trendline_pets,
          500
        );
        setPetGraph(graph);
      } catch {
        // Silently handle error
      }
    },
    []
  );

  const handleSelectChange = useCallback(
    async (option: string) => {
      if (selectedLocationId !== null) {
        setSelectedGraphType(option);
        createQueryString("type", option !== defaultGraphType ? option : "");
        await generateGraph(selectedLocationId, option);
      }
    },
    [selectedLocationId, createQueryString, generateGraph]
  );

  const handleMarkerClick = useCallback(
    async (locationId: number) => {
      setSelectedLocationId(locationId);
      await generateGraph(locationId, selectedGraphType);
    },
    [generateGraph, selectedGraphType]
  );

  const renderPopupContent = () => (
    <div className="flex flex-col items-start">
      <div className="w-full">
        <Select
          label="Type"
          items={GraphOptions}
          selectedKeys={new Set([selectedGraphType])}
          className="w-1/3"
          onChange={e => handleSelectChange(e.target.value)}
        >
          {GraphOptions.map(option => (
            <SelectItem key={option.key}>{option.label}</SelectItem>
          ))}
        </Select>
      </div>
      <div className="md:justify-center">
        <div className="w-full max-w-4xl">{petGraph}</div>
      </div>
    </div>
  );

  return (
    <div className="relative h-screen w-full">
      <div className="absolute left-0 right-0 top-0 z-50">
        <HeaderBar LocationOptions={LocationOptions} />
      </div>
      <MapComponent locations={locations} onMarkerClick={handleMarkerClick}>
        {renderPopupContent()}
      </MapComponent>
    </div>
  );
};

export default Home;
