import { useQueryClient } from "@tanstack/react-query";
import { Icon } from "leaflet";
import React, { memo, useCallback } from "react";

import { prefetchTrendGraphData } from "@/lib/api/query-client";
import { DEFAULT_GRAPH_SEASON, type GraphSeason } from "@/lib/constants";

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
  locationId: number;
  MarkerComponent: React.ComponentType<MarkerProperties>;
  onClick: (locationId: number) => void;
  position: [number, number];
  selectedGraphMeasure: string;
  selectedGraphSeason?: GraphSeason;
}

export const OptimizedMarker = memo<OptimizedMarkerProperties>(
  ({
    icon,
    locationId,
    MarkerComponent: Marker,
    onClick,
    position,
    selectedGraphMeasure,
    selectedGraphSeason = DEFAULT_GRAPH_SEASON,
  }) => {
    const queryClient = useQueryClient();

    const handleMouseEnter = useCallback(() => {
      Promise.resolve()
        .then(() =>
          prefetchTrendGraphData(
            queryClient,
            locationId,
            selectedGraphMeasure,
            selectedGraphSeason,
          ),
        )
        .catch(() => {});
    }, [locationId, queryClient, selectedGraphMeasure, selectedGraphSeason]);

    const handleClick = useCallback(() => {
      onClick(locationId);
    }, [onClick, locationId]);

    return (
      <Marker
        eventHandlers={{
          click: handleClick,
          mouseover: handleMouseEnter,
        }}
        icon={icon}
        position={position}
      />
    );
  },
);

OptimizedMarker.displayName = "OptimizedMarker";
