import React, { memo, useCallback } from "react";

import { prefetchTrendGraphData } from "@/lib/api/query-client";

interface OptimizedMarkerProperties {
  icon: any;
  locationId: number;
  MarkerComponent: any;
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
      prefetchTrendGraphData(locationId, selectedGraphMeasure);
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
