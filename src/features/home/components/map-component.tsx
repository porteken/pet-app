"use client";

import { PageLoader } from "@/components/app/page-loader";
import { HeatStressLegend } from "@/components/app/thermal-stress-legend";
import { DEFAULT_GRAPH_SEASON, type GraphSeason } from "@/lib/constants";
import { useTheme } from "next-themes";
import React, { memo, useEffect, useMemo, useState } from "react";
import Map from "react-map-gl/maplibre";

import { OptimizedMarker } from "./optimized-marker";

import type * as MapLibreGL from "maplibre-gl";
import type { CSSProperties } from "react";

type MapLibreModule = typeof MapLibreGL;
type StyleSpecification = MapLibreGL.StyleSpecification;
const MAP_CENTER_LAT = 39.5;
const MAP_CENTER_LNG = -98.35;
const INITIAL_ZOOM = 5;
const LIGHT_TILE_URLS = [
  "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
  "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
  "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
];
const LIGHT_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const DARK_TILE_URLS = [
  "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
  "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
  "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
  "https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
];
const DARK_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
const MAP_SOURCE_ID = "basemap";
const MAP_LAYER_ID = "basemap-raster";
const E2E_MAP_LAYER_ID = "e2e-background";
const IS_E2E_TEST_ENVIRONMENT = process.env.NEXT_PUBLIC_E2E_TEST === "true";

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

const INITIAL_VIEW_STATE = {
  latitude: MAP_CENTER_LAT,
  longitude: MAP_CENTER_LNG,
  zoom: INITIAL_ZOOM,
};
const MAP_STYLE: CSSProperties = { height: "100%", width: "100%" };
const MAP_CONTAINER_TEST_ID = "map-container";

const LIGHT_MAP_STYLE = {
  layers: [
    {
      id: MAP_LAYER_ID,
      source: MAP_SOURCE_ID,
      type: "raster",
    },
  ],
  sources: {
    [MAP_SOURCE_ID]: {
      attribution: LIGHT_TILE_ATTRIBUTION,
      tileSize: 256,
      tiles: LIGHT_TILE_URLS,
      type: "raster",
    },
  },
  version: 8,
} satisfies StyleSpecification;

const DARK_MAP_STYLE = {
  layers: [
    {
      id: MAP_LAYER_ID,
      source: MAP_SOURCE_ID,
      type: "raster",
    },
  ],
  sources: {
    [MAP_SOURCE_ID]: {
      attribution: DARK_TILE_ATTRIBUTION,
      tileSize: 256,
      tiles: DARK_TILE_URLS,
      type: "raster",
    },
  },
  version: 8,
} satisfies StyleSpecification;

const E2E_LIGHT_MAP_STYLE = {
  layers: [
    {
      id: E2E_MAP_LAYER_ID,
      paint: {
        "background-color": "#e2e8f0",
      },
      type: "background",
    },
  ],
  sources: {},
  version: 8,
} satisfies StyleSpecification;

const E2E_DARK_MAP_STYLE = {
  layers: [
    {
      id: E2E_MAP_LAYER_ID,
      paint: {
        "background-color": "#0f172a",
      },
      type: "background",
    },
  ],
  sources: {},
  version: 8,
} satisfies StyleSpecification;

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
    const { resolvedTheme } = useTheme();
    const [mapLib, setMapLib] = useState<MapLibreModule | null>(null);
    const [isLegendOpen, setIsLegendOpen] = useState(false);

    useEffect(() => {
      let isCancelled = false;

      const loadMapLibrary = async () => {
        try {
          const loadedMapLib = await import("maplibre-gl");
          if (!isCancelled) {
            setMapLib(loadedMapLib);
          }
        } catch {
          // Ignore map library load failures and keep fallback UI.
        }
      };

      void loadMapLibrary();

      return () => {
        isCancelled = true;
      };
    }, []);

    const markers = useMemo(() => {
      if (!locations || locations.length === 0) {
        return null;
      }

      return locations.map((loc) => (
        <OptimizedMarker
          city={loc.city}
          latitude={loc.lat}
          longitude={loc.lng}
          key={loc.location_id}
          locationId={loc.location_id}
          onClick={onMarkerClick}
          selectedGraphMeasure={selectedGraphMeasure}
          selectedGraphSeason={selectedGraphSeason}
          state={loc.state}
        />
      ));
    }, [locations, onMarkerClick, selectedGraphMeasure, selectedGraphSeason]);

    if (!mapLib) {
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

    const isDarkTheme = resolvedTheme === "dark";
    const standardMapStyle = isDarkTheme ? DARK_MAP_STYLE : LIGHT_MAP_STYLE;
    const e2eMapStyle = isDarkTheme ? E2E_DARK_MAP_STYLE : E2E_LIGHT_MAP_STYLE;
    const mapStyleDefinition = IS_E2E_TEST_ENVIRONMENT
      ? e2eMapStyle
      : standardMapStyle;

    return (
      <div className="relative size-full">
        <div
          className="size-full"
          data-map-provider="maplibre"
          data-map-theme={isDarkTheme ? "dark" : "light"}
          data-testid={MAP_CONTAINER_TEST_ID}
        >
          <Map
            dragRotate={false}
            initialViewState={INITIAL_VIEW_STATE}
            mapLib={mapLib}
            mapStyle={mapStyleDefinition}
            scrollZoom
            style={MAP_STYLE}
          >
            {markers}
          </Map>
        </div>
        <div className="pointer-events-none absolute bottom-6 left-6 z-40 hidden sm:block">
          <div className="pointer-events-auto flex flex-col items-start gap-2">
            <LegendToggleButton
              ariaControls="desktop-thermal-stress-legend"
              className="text-foreground glass-panel-muted hover:bg-accent rounded-full px-4 py-2 text-sm font-semibold transition"
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
              className="text-foreground glass-panel-muted hover:bg-accent rounded-l-2xl border-r-0 p-3 text-xs font-semibold transition"
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
