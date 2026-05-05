"use client";

import { PageLoader } from "@/components/app/page-loader";
import { HeatStressLegend } from "@/components/app/thermal-stress-legend";
import { DEFAULT_GRAPH_SEASON, type GraphSeason } from "@/lib/constants";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";

import { OptimizedMarker } from "./optimized-marker";

import type { Icon } from "leaflet";
import type { ComponentType, CSSProperties, ReactNode } from "react";
const MAP_CENTER_LAT = 39.5;
const MAP_CENTER_LNG = -98.35;
const ICON_SIZE_WIDTH = 36;
const ICON_SIZE_HEIGHT = 52;
const ICON_ANCHOR_X = 18;
const ICON_ANCHOR_Y = 52;
const POPUP_ANCHOR_X = 0;
const POPUP_ANCHOR_Y = -46;

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
  selectedGraphSeason?: GraphSeason;
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

const MAP_CENTER: [number, number] = [MAP_CENTER_LAT, MAP_CENTER_LNG];
const MAP_STYLE: CSSProperties = { height: "100%", width: "100%" };

interface LegendToggleButtonProperties {
  ariaControls: string;
  className: string;
  closedLabel: string;
  isLegendOpen: boolean;
  openLabel: string;
  setIsLegendOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

class LegendToggleButton extends React.PureComponent<LegendToggleButtonProperties> {
  private readonly handleClick = () => {
    this.props.setIsLegendOpen((previous) => !previous);
  };

  public render(): React.ReactElement {
    const { ariaControls, className, closedLabel, isLegendOpen, openLabel } =
      this.props;

    return (
      <button
        aria-controls={ariaControls}
        aria-expanded={isLegendOpen}
        className={className}
        onClick={this.handleClick}
        type="button"
      >
        {isLegendOpen ? openLabel : closedLabel}
      </button>
    );
  }
}

export const MapComponent = memo<MapComponentProperties>(
  ({
    locations,
    onMarkerClick,
    selectedGraphMeasure,
    selectedGraphSeason = DEFAULT_GRAPH_SEASON,
  }) => {
    const [MapContainer, setMapContainer] = useState<MapContainerType>();
    const [TileLayer, setTileLayer] = useState<TileLayerType>();
    const [Marker, setMarker] = useState<MarkerType>();
    const [isLoaded, setIsLoaded] = useState(false);
    const [customIcon, setCustomIcon] = useState<Icon>();
    const [isLegendOpen, setIsLegendOpen] = useState(false);

    const loadMap = useCallback(async () => {
      const reactLeaflet = await import("react-leaflet");

      const L = await import("leaflet");
      const markerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="52" viewBox="0 0 28 40" fill="none"><path d="M14 0C6.268 0 0 6.268 0 14c0 11.2 14 26 14 26s14-14.8 14-26C28 6.268 21.732 0 14 0z" fill="#2563EB"/><circle cx="14" cy="14" r="5" fill="white"/></svg>`;
      const markerUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markerSvg)}`;

      const createdCustomIcon = L.icon({
        className: "pet-map-marker-icon",
        iconAnchor: [ICON_ANCHOR_X, ICON_ANCHOR_Y],
        iconRetinaUrl: markerUrl,
        iconSize: [ICON_SIZE_WIDTH, ICON_SIZE_HEIGHT],
        iconUrl: markerUrl,
        popupAnchor: [POPUP_ANCHOR_X, POPUP_ANCHOR_Y],
      });

      setMapContainer(() => reactLeaflet.MapContainer);
      setTileLayer(() => reactLeaflet.TileLayer);
      setMarker(() => reactLeaflet.Marker);
      setIsLoaded(true);

      setCustomIcon(createdCustomIcon);
    }, []);

    useEffect(() => {
      if (typeof document !== "undefined") {
        void loadMap();
      }
    }, [loadMap]);

    const markers = useMemo(() => {
      if (!locations || !customIcon || !Marker) {
        return undefined;
      }

      return locations.map((loc) => (
        <OptimizedMarker
          icon={customIcon}
          latitude={loc.lat}
          longitude={loc.lng}
          key={loc.location_id}
          locationId={loc.location_id}
          MarkerComponent={Marker}
          onClick={onMarkerClick}
          selectedGraphMeasure={selectedGraphMeasure}
          selectedGraphSeason={selectedGraphSeason}
        />
      ));
    }, [
      locations,
      customIcon,
      Marker,
      onMarkerClick,
      selectedGraphMeasure,
      selectedGraphSeason,
    ]);

    if (!isLoaded || !MapContainer || !TileLayer || !Marker || !customIcon) {
      return <PageLoader />;
    }

    if (!locations || locations.length === 0) {
      return (
        <div className="bg-background/30 flex h-full items-center justify-center px-4">
          <div className="mx-auto max-w-md p-6 text-center">
            <div className="mb-6">
              <svg
                className="text-destructive mx-auto size-12"
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
            <h1 className="text-foreground mb-4 text-2xl font-bold">
              No Map Data Available
            </h1>
            <p className="text-muted-foreground mb-6">
              Unable to load location data for the map. The database may be
              temporarily unavailable.
            </p>
            <div className="glass-panel-muted rounded-2xl p-4">
              <p className="text-foreground text-sm">
                <strong>Need help?</strong> Contact Kenneth Porter at{" "}
                <a
                  className="text-primary hover:text-primary/80 underline underline-offset-4"
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
      <div className="relative h-full w-full">
        <MapContainer
          center={MAP_CENTER}
          scrollWheelZoom
          style={MAP_STYLE}
          zoom={5}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers}
        </MapContainer>
        <div className="pointer-events-none absolute bottom-6 left-6 z-40 hidden sm:block">
          <div className="pointer-events-auto flex flex-col items-start gap-2">
            <LegendToggleButton
              ariaControls="desktop-thermal-stress-legend"
              className="glass-panel-muted text-foreground hover:bg-accent rounded-full px-4 py-2 text-sm font-semibold transition"
              closedLabel="Show Thermal Stress Index"
              isLegendOpen={isLegendOpen}
              openLabel="Hide Thermal Stress Index"
              setIsLegendOpen={setIsLegendOpen}
            />
            {isLegendOpen && (
              <div id="desktop-thermal-stress-legend">
                <HeatStressLegend />
              </div>
            )}
          </div>
        </div>
        <div className="pointer-events-none absolute top-1/2 right-0 z-40 -translate-y-1/2 sm:hidden">
          <div className="pointer-events-auto flex items-center">
            {isLegendOpen && (
              <div
                className="glass-panel mr-2 max-w-[78vw] rounded-3xl p-2 shadow-md"
                id="mobile-thermal-stress-legend"
              >
                <HeatStressLegend />
              </div>
            )}
            <LegendToggleButton
              ariaControls="mobile-thermal-stress-legend"
              className="glass-panel-muted text-foreground hover:bg-accent rounded-l-2xl border-r-0 px-3 py-3 text-xs font-semibold transition"
              closedLabel="Thermal Stress"
              isLegendOpen={isLegendOpen}
              openLabel="Close"
              setIsLegendOpen={setIsLegendOpen}
            />
          </div>
        </div>
      </div>
    );
  },
);

MapComponent.displayName = "MapComponent";
