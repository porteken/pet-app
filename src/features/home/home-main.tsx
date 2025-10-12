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
import { GraphOptions } from "@/lib/utils/select-options";
import { LocationProperties } from "@/types/types";

import { ErrorGraphDisplay } from "./components/error-graph-display";
import { GraphSection } from "./components/graph-section";
import MapComponent from "./map-component";
import { MapProperties } from "./types";

const Modal = dynamic(() => import("@/components/ui/modal"), {
  ssr: false,
});

const SELECT_OPTIONS = GraphOptions.map(option => ({
  label: option.label,
  value: option.key,
}));

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

  const locationMap = useMemo(() => {
    return new Map(locations.map(loc => [loc.location_id, loc]));
  }, [locations]);

  const generateGraph = useCallback(
    async (locationId: number, option: string) => {
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
      if (selectedLocationId !== undefined) {
        setSelectedGraphMeasure(option);
        await setGraphMeasure(option);
      }
    },
    [selectedLocationId, generateGraph]
  );

  useEffect(() => {
    if (selectedLocationId !== undefined) {
      generateGraph(selectedLocationId, selectedGraphMeasure);
    }
  }, [selectedLocationId, selectedGraphMeasure, generateGraph]);

  const handleMarkerClick = useCallback(
    (locationId: number) => {
      setSelectedLocationId(locationId);
      const location = locationMap.get(locationId);
      setSelectedLocation(location);
      setModalOpen(true);
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
          selectOptions={SELECT_OPTIONS}
        />
      </Modal>
    </div>
  );
};

export default Home;
