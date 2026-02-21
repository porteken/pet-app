import { Icon } from "leaflet";
import React, { memo, useCallback } from "react";

import { prefetchTrendGraphData } from "@/lib/api/query-client";

interface MarkerEventHandlers {
  click: () => void;
  mouseover?: () => void;
}

interface MarkerProperties {
  eventHandlers: MarkerEventHandlers;
  icon: Icon;
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
    const handleMouseEnter = useCallback(() => {
      void prefetchTrendGraphData(locationId, selectedGraphMeasure);
    }, [locationId, selectedGraphMeasure]);

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
  }
);

OptimizedMarker.displayName = "OptimizedMarker";
