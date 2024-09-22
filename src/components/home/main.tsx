"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Select, SelectItem } from "@nextui-org/react";
import { MapProps } from "./types";
import { FC } from "react";
import { GraphOptions } from "../selectOptions";
import { GenerateTrendGraph } from "../generateGraph";
import { useRouter, useSearchParams } from "next/navigation";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { FetchTrendGraphData } from "../fetchClient";
import { HeaderBar } from "../headerBar";
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

const defaultGraphType = "avg";

const Home: FC<MapProps> = ({ LocationOptions, locations }: MapProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialGraphType = searchParams.get("type") || defaultGraphType;

  const [petGraph, setPetGraph] = useState<JSX.Element | null>(null);
  const [selectedGraphType, setSelectedGraphType] = useState(initialGraphType);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(
    null,
  );

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      value ? params.set(name, value) : params.delete(name);
      router.push(`?${params.toString()}`);
    },
    [searchParams, router],
  );

  const generateGraph = useCallback(
    async (locationId: number, option: string) => {
      const { years, year_pets, trendline_pets } = await FetchTrendGraphData(
        option,
        locationId,
      );
      const graph = GenerateTrendGraph(
        years,
        option,
        year_pets,
        trendline_pets,
        500,
      );
      setPetGraph(graph);
    },
    [],
  );

  const handleSelectChange = useCallback(
    async (option: string) => {
      if (selectedLocationId !== null) {
        setSelectedGraphType(option);
        createQueryString("type", option !== defaultGraphType ? option : "");
        await generateGraph(selectedLocationId, option);
      }
    },
    [selectedLocationId, createQueryString, generateGraph],
  );

  const handleMarkerClick = useCallback(
    async (locationId: number) => {
      setSelectedLocationId(locationId);
      await generateGraph(locationId, selectedGraphType);
    },
    [generateGraph, selectedGraphType],
  );

  return (
    <>
      <HeaderBar LocationOptions={LocationOptions} />
      <MapContainer center={[39.5, -98.35]} zoom={5} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc) => (
          <Marker
            position={[loc.lat, loc.lng]}
            key={loc.location_id}
            eventHandlers={{
              click: () => handleMarkerClick(loc.location_id),
            }}
          >
            <Popup>
              <div className="flex flex-col items-start">
                <div className="w-full">
                  <Select
                    label="Type"
                    items={GraphOptions}
                    selectedKeys={new Set([selectedGraphType])}
                    className="w-1/3"
                    onChange={(e) => handleSelectChange(e.target.value)}
                  >
                    {GraphOptions.map((option) => (
                      <SelectItem key={option.key}>{option.label}</SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="md:justify-center">
                  <p className="text-lg text-center">
                    {loc.city}, {loc.state}
                  </p>
                  <div className="w-full max-w-4xl">{petGraph}</div>
                </div>
              </div>
              <Link
                href={
                  selectedGraphType !== defaultGraphType
                    ? `/${loc.location_id}?type=${selectedGraphType}`
                    : `/${loc.location_id}`
                }
              >
                {`Get more information about ${loc.city}`}
              </Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
};

export default Home;
