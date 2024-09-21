"use client";

import { useCallback, useState, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Select, SelectItem } from "@nextui-org/react";
import { HomeProps } from "./types";
import { FC } from "react";
import { GraphOptions } from "../selectOptions";
import { GenerateTrendGraph } from "../generateGraph";
import { useRouter, useSearchParams } from "next/navigation";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

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

const Home: FC<HomeProps> = ({ locations }: HomeProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialGraphType = searchParams.get("type") || defaultGraphType;

  const [PetGraph, setPetGraph] = useState<JSX.Element | null>(null);
  const [selectedOption, setSelectedOption] = useState(
    new Set([initialGraphType]),
  );
  const [LocID, setLocID] = useState<number | null>(null);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      value!=="" ? params.set(name, value) : params.delete(name)
      router.push(`?${params.toString()}`);
    },
    [searchParams, router],
  );

  const generateGraph = useCallback(async (id: number, option: string) => {
    const graph = await GenerateTrendGraph(id, option, 500);
    setPetGraph(graph);
  }, []);

  const handleSelectChange = useCallback(
    async (option: string) => {
      if (LocID !== null && option){
        if (option!==defaultGraphType) {
          setSelectedOption(new Set([option]));
          createQueryString("type", option);
          await generateGraph(LocID, option);
        }
        else {
          setSelectedOption(new Set([option]));
          createQueryString("type", "");
          await generateGraph(LocID, option);
        }
      }
    },
    [LocID, createQueryString, generateGraph],
  );

  const onClick = useCallback(
    async (locationID: number) => {
      setLocID(locationID);
      await generateGraph(locationID, Array.from(selectedOption)[0]);
    },
    [selectedOption, generateGraph],
  );

  return (
    <MapContainer center={[39.5, -98.35]} zoom={5} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((loc, id) => (
        <Marker
          position={[loc.lat, loc.lng]}
          key={id}
          eventHandlers={{
            click: () => onClick(loc.location_id),
          }}
        >
          <Popup>
            <div className="flex flex-col items-start">
              <div className="w-full">
                <Select
                  label="Type"
                  items={GraphOptions}
                  selectedKeys={selectedOption}
                  className="w-1/3"
                  onChange={(e) => handleSelectChange(e.target.value)}
                >
                  {(option) => (
                    <SelectItem key={option.key}>{option.label}</SelectItem>
                  )}
                </Select>
              </div>
              <div className="md:justify-center">
                <p className="text-lg text-center">
                  {loc.city}, {loc.state}
                </p>
                <div className="w-full max-w-4xl">{PetGraph}</div>
              </div>
            </div>
            <Link
              href={
                Array.from(selectedOption)[0] !== defaultGraphType
                  ? `/${id}?type=${Array.from(selectedOption)[0]}`
                  : `/${id}`
              }
            >
              {`Get more information about ${loc.city}`}
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Home;
