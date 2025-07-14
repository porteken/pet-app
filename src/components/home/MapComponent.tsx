"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";

interface Location {
  location_id: number;
  city: string;
  state: string;
  lat: number;
  lng: number;
}

interface MapComponentProps {
  locations: Location[];
  onMarkerClick: (locationId: number) => void;
}

const MapComponent = ({ locations, onMarkerClick }: MapComponentProps) => {
  const [MapContainer, setMapContainer] = useState<ComponentType<any> | null>(
    null
  );
  const [TileLayer, setTileLayer] = useState<ComponentType<any> | null>(null);
  const [Marker, setMarker] = useState<ComponentType<any> | null>(null);
  const [Popup, setPopup] = useState<ComponentType<any> | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      const loadMap = async () => {
        try {
          // Check if Leaflet CSS is already loaded
          if (!document.querySelector('link[href*="leaflet.css"]')) {
            // Load Leaflet CSS first
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            link.integrity =
              "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
            link.crossOrigin = "";
            document.head.appendChild(link);
          }

          // Check if default icon compatibility CSS is already loaded
          if (
            !document.querySelector(
              'link[href*="leaflet-defaulticon-compatibility"]'
            )
          ) {
            // Load default icon compatibility
            const iconLink = document.createElement("link");
            iconLink.rel = "stylesheet";
            iconLink.href =
              "https://unpkg.com/leaflet-defaulticon-compatibility@0.1.2/dist/leaflet-defaulticon-compatibility.css";
            document.head.appendChild(iconLink);
          }

          // Check if default icon compatibility script is already loaded
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

          // Dynamically import React Leaflet components
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

  // Show loading state until everything is loaded
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
        >
          {/* Removed Leaflet Popup */}
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
