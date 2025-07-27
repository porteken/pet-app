"use client";

import { Icon } from "leaflet";
import React, {
  ComponentType,
  CSSProperties,
  ReactNode,
  useEffect,
  useState,
} from "react";

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
  };
  icon?: any;
  key: number;
  position: [number, number];
}>;

type PopupType = ComponentType<{
  children?: ReactNode;
}>;

type TileLayerType = ComponentType<{
  attribution: string;
  url: string;
}>;

const MapComponent = ({ locations, onMarkerClick }: MapComponentProperties) => {
  const [MapContainer, setMapContainer] = useState<
    MapContainerType | undefined
  >();
  const [TileLayer, setTileLayer] = useState<TileLayerType | undefined>();
  const [Marker, setMarker] = useState<MarkerType | undefined>();
  const [Popup, setPopup] = useState<PopupType | undefined>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [customIcon, setCustomIcon] = useState<Icon | null>();

  const loadMap = async () => {
    // Load Leaflet CSS if not already loaded
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      document.head.append(link);

      // Wait for CSS to load
      await new Promise(resolve => {
        link.addEventListener("load", resolve);
        link.addEventListener("error", resolve); // Continue even if CSS fails
      });
    }

    try {
      // Load react-leaflet which will load Leaflet
      const reactLeaflet = await import("react-leaflet");

      // Fix Leaflet default icon issue by setting it manually
      const L = await import("leaflet");
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      // Create a custom icon to ensure markers are visible
      const customIcon = new L.Icon({
        iconAnchor: [12, 41],
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconSize: [25, 41],
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      setMapContainer(() => reactLeaflet.MapContainer);
      setTileLayer(() => reactLeaflet.TileLayer);
      setMarker(() => reactLeaflet.Marker);
      setPopup(() => reactLeaflet.Popup);
      setIsLoaded(true);

      // Store the custom icon for use in markers
      setCustomIcon(customIcon);
    } catch {
      setIsLoaded(false);
    }
  };

  useEffect(() => {
    if (globalThis.window !== undefined && typeof document !== "undefined") {
      loadMap();
    }
  }, []);

  if (!isLoaded || !MapContainer || !TileLayer || !Marker || !Popup) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <p>Loading map...</p>
      </div>
    );
  }

  // Add a small delay to ensure map is fully rendered
  if (!customIcon) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <p>Initializing markers...</p>
      </div>
    );
  }

  if (!locations || locations.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
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
    <MapContainer
      center={[39.5, -98.35]}
      scrollWheelZoom
      style={{ height: "100vh", width: "100vw" }}
      zoom={5}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map(loc => (
        <Marker
          eventHandlers={{
            click: () => onMarkerClick(loc.location_id),
          }}
          icon={customIcon}
          key={loc.location_id}
          position={[loc.lat, loc.lng]}
        />
      ))}
    </MapContainer>
  );
};

export default MapComponent;
