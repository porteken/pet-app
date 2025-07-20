"use client";

import { useEffect, useState } from "react";

interface Location {
  location_id: number;
  city: string;
  state: string;
  lat: number;
  lng: number;
}

type MapContainerType = React.ComponentType<{
  center: [number, number];
  zoom: number;
  scrollWheelZoom: boolean;
  style: React.CSSProperties;
  children: React.ReactNode;
}>;

type TileLayerType = React.ComponentType<{
  attribution: string;
  url: string;
}>;

type MarkerType = React.ComponentType<{
  position: [number, number];
  key: number;
  eventHandlers: {
    click: () => void;
  };
  children?: React.ReactNode;
}>;

type PopupType = React.ComponentType<{
  children?: React.ReactNode;
}>;

interface MapComponentProps {
  locations: Location[];
  onMarkerClick: (locationId: number) => void;
}

const MapComponent = ({ locations, onMarkerClick }: MapComponentProps) => {
  const [MapContainer, setMapContainer] = useState<MapContainerType | null>(
    null
  );
  const [TileLayer, setTileLayer] = useState<TileLayerType | null>(null);
  const [Marker, setMarker] = useState<MarkerType | null>(null);
  const [Popup, setPopup] = useState<PopupType | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      const loadMap = async () => {
        try {
          if (!document.querySelector('link[href*="leaflet.css"]')) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            link.integrity =
              "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
            link.crossOrigin = "";
            document.head.appendChild(link);
          }

          if (
            !document.querySelector(
              'link[href*="leaflet-defaulticon-compatibility"]'
            )
          ) {
            const iconLink = document.createElement("link");
            iconLink.rel = "stylesheet";
            iconLink.href =
              "https://unpkg.com/leaflet-defaulticon-compatibility@0.1.2/dist/leaflet-defaulticon-compatibility.css";
            document.head.appendChild(iconLink);
          }

          if (
            !document.querySelector(
              'script[src*="leaflet-defaulticon-compatibility"]'
            )
          ) {
            const script = document.createElement("script");
            script.src =
              "https://unpkg.com/leaflet-defaulticon-compatibility@0.1.2/dist/leaflet-defaulticon-compatibility.js";
            script.async = true;

            await new Promise((resolve, reject) => {
              script.onload = resolve;
              script.onerror = reject;
              document.head.appendChild(script);
            });
          }

          const reactLeaflet = await import("react-leaflet");
          setMapContainer(() => reactLeaflet.MapContainer);
          setTileLayer(() => reactLeaflet.TileLayer);
          setMarker(() => reactLeaflet.Marker);
          setPopup(() => reactLeaflet.Popup);
          setIsLoaded(true);
        } catch (error) {
          console.error("Failed to load React Leaflet:", error);
        }
      };

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

  return (
    <MapContainer
      center={[39.5, -98.35]}
      zoom={5}
      scrollWheelZoom={true}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map(loc => (
        <Marker
          position={[loc.lat, loc.lng]}
          key={loc.location_id}
          eventHandlers={{
            click: () => onMarkerClick(loc.location_id),
          }}
        ></Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
