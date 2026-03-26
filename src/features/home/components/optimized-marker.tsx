import { useQueryClient } from "@tanstack/react-query";
import { Icon } from "leaflet";
import React, { memo, useCallback } from "react";

import { prefetchTrendGraphData } from "@/lib/api/query-client";

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
}

export const OptimizedMarker = memo<OptimizedMarkerProperties>(
  ({
    icon,
    locationId,
    MarkerComponent: Marker,
    onClick,
    position,
    selectedGraphMeasure,
  }) => {
    const queryClient = useQueryClient();

    const handleMouseEnter = useCallback(() => {
      Promise.resolve()
        .then(() =>
          prefetchTrendGraphData(queryClient, locationId, selectedGraphMeasure),
        )
        .catch(() => {});
    }, [locationId, queryClient, selectedGraphMeasure]);

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
