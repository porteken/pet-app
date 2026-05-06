import { prefetchTrendGraphData } from "@/lib/api/query-client";
import { DEFAULT_GRAPH_SEASON, type GraphSeason } from "@/lib/constants";
import { useQueryClient } from "@tanstack/react-query";
import React, { memo, useCallback } from "react";

import type { Icon } from "leaflet";

interface MarkerProperties {
  eventHandlers: {
    click: () => void;
    mouseover?: () => void;
  };
  icon?: Icon;
  key?: React.Key;
  position: [number, number];
}

interface OptimizedMarkerProperties {
  icon: Icon;
  latitude: number;
  longitude: number;
  locationId: number;
  MarkerComponent: React.ComponentType<MarkerProperties>;
  onClick: (locationId: number) => void;
  selectedGraphMeasure: string;
  selectedGraphSeason?: GraphSeason;
}

export const OptimizedMarker = memo<OptimizedMarkerProperties>(
  ({
    icon,
    latitude,
    longitude,
    locationId,
    MarkerComponent: Marker,
    onClick,
    selectedGraphMeasure,
    selectedGraphSeason = DEFAULT_GRAPH_SEASON,
  }) => {
    const queryClient = useQueryClient();
    const position = React.useMemo(
      () => [latitude, longitude] as [number, number],
      [latitude, longitude],
    );

    const handleMouseEnter = useCallback(async () => {
      try {
        await prefetchTrendGraphData(
          queryClient,
          locationId,
          selectedGraphMeasure,
          selectedGraphSeason,
        );
      } catch {
        // Ignore prefetch failures
      }
    }, [locationId, queryClient, selectedGraphMeasure, selectedGraphSeason]);

    const handleClick = useCallback(() => {
      onClick(locationId);
    }, [onClick, locationId]);

    const eventHandlers = React.useMemo(
      () => ({
        click: handleClick,
        mouseover: handleMouseEnter,
      }),
      [handleClick, handleMouseEnter],
    );

    return (
      <Marker eventHandlers={eventHandlers} icon={icon} position={position} />
    );
  },
);

OptimizedMarker.displayName = "OptimizedMarker";
