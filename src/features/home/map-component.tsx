"use client";

import { Icon } from "leaflet";
import React, {
  ComponentType,
  CSSProperties,
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { PageLoader } from "@/components/app/page-loader";
import { HeatStressLegend } from "@/features/page/heat-stress-legend";

import { OptimizedMarker } from "./optimized-marker";

interface Location {
  city: string;
  lat: number;
  lng: number;
  location_id: number;
  state: string;
}

interface MapComponentProperties {
  locations: Location[];
  onMarkerClick: (_locationId: number) => void;
  selectedGraphMeasure: string;
}

type MapContainerType = ComponentType<{
  center: [number, number];
  children: ReactNode;
  scrollWheelZoom: boolean;
  style: CSSProperties;
  zoom: number;
}>;

type MarkerType = ComponentType<{
  children?: ReactNode;
  eventHandlers: {
    click: () => void;
    mouseover?: () => void;
  };
  icon?: Icon;
  position: [number, number];
}>;

type TileLayerType = ComponentType<{
  attribution: string;
  url: string;
}>;

export const MapComponent = memo<MapComponentProperties>(
  ({ locations, onMarkerClick, selectedGraphMeasure }) => {
    const [MapContainer, setMapContainer] = useState<MapContainerType>();
    const [TileLayer, setTileLayer] = useState<TileLayerType>();
    const [Marker, setMarker] = useState<MarkerType>();
    const [isLoaded, setIsLoaded] = useState(false);
    const [customIcon, setCustomIcon] = useState<Icon>();

    const loadMap = useCallback(async () => {
      const reactLeaflet = await import("react-leaflet");

      const L = await import("leaflet");
      const markerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40" fill="none"><path d="M14 0C6.268 0 0 6.268 0 14c0 11.2 14 26 14 26s14-14.8 14-26C28 6.268 21.732 0 14 0z" fill="#2563EB"/><circle cx="14" cy="14" r="5" fill="white"/></svg>`;
      const markerUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markerSvg)}`;

      const customIcon = L.icon({
        className: "pet-map-marker-icon",
        iconAnchor: [14, 40],
        iconRetinaUrl: markerUrl,
        iconSize: [28, 40],
        iconUrl: markerUrl,
        popupAnchor: [0, -34],
      });

      setMapContainer(() => reactLeaflet.MapContainer);
      setTileLayer(() => reactLeaflet.TileLayer);
      setMarker(() => reactLeaflet.Marker);
      setIsLoaded(true);

      setCustomIcon(customIcon);
    }, []);

    useEffect(() => {
      if (typeof document !== "undefined") {
        loadMap();
      }
    }, [loadMap]);

    const markers = useMemo(() => {
      if (!locations || !customIcon || !Marker) {
        return;
      }

      return locations.map(loc => (
        <OptimizedMarker
          icon={customIcon}
          key={loc.location_id}
          locationId={loc.location_id}
          MarkerComponent={Marker}
          onClick={onMarkerClick}
          position={[loc.lat, loc.lng]}
          selectedGraphMeasure={selectedGraphMeasure}
        />
      ));
    }, [locations, customIcon, Marker, onMarkerClick, selectedGraphMeasure]);

    if (!isLoaded || !MapContainer || !TileLayer || !Marker || !customIcon) {
      return <PageLoader />;
    }

    if (!locations || locations.length === 0) {
      return (
        <div className="flex h-dvh items-center justify-center bg-gray-50">
          <div className="mx-auto max-w-md p-6 text-center">
            <div className="mb-6">
              <svg
                className="mx-auto size-12 text-red-500"
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
            <h1 className="mb-4 text-2xl font-bold text-gray-900">
              No Map Data Available
            </h1>
            <p className="mb-6 text-gray-600">
              Unable to load location data for the map. The database may be
              temporarily unavailable.
            </p>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                <strong>Need help?</strong> Contact Kenneth Porter at{" "}
                <a
                  className="text-blue-600 underline hover:text-blue-800"
                  href="mailto:porteken@gmail.com"
                >
                  porteken@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative h-dvh w-full">
        <MapContainer
          center={[39.5, -98.35]}
          scrollWheelZoom
          style={{ height: "100dvh", width: "100%" }}
          zoom={5}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers}
        </MapContainer>
        <div className="pointer-events-none absolute bottom-6 left-6 z-1000">
          <div className="pointer-events-auto">
            <HeatStressLegend />
          </div>
        </div>
      </div>
    );
  }
);

MapComponent.displayName = "MapComponent";
