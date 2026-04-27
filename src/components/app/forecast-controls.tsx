"use client";

import * as React from "react";

import {
  MAX_FORECAST_YEARS_AHEAD,
  MIN_FORECAST_YEARS_AHEAD,
} from "@/lib/constants";

interface ForecastControlsProperties {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onYearsChange: (years: number) => void;
  yearsAhead: number;
}

const ForecastControlsComponent: React.FC<ForecastControlsProperties> = ({
  enabled,
  onToggle,
  onYearsChange,
  yearsAhead,
}) => {
  return (
    <div className="glass-panel-muted space-y-3 rounded-2xl p-4">
      <div className="flex items-center justify-between gap-3">
        <label className="text-foreground flex items-center gap-3 text-sm font-medium">
          <input
            checked={enabled}
            className="border-border bg-background text-primary focus-visible:ring-primary size-4 rounded border focus-visible:ring-2"
            onChange={(event) => onToggle(event.target.checked)}
            type="checkbox"
          />
          <span>Show Forecast</span>
        </label>
        <span className="rounded-full bg-(--pill-surface) px-2.5 py-1 text-xs font-semibold text-(--pill-foreground)">
          Avg only
        </span>
      </div>

      {enabled && (
        <div className="space-y-2">
          <label
            className="text-foreground block text-sm font-medium"
            htmlFor="forecast-years"
          >
            Forecast {yearsAhead} year{yearsAhead === 1 ? "" : "s"} ahead
          </label>
          <input
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-(--slider-track) accent-(--slider-thumb)"
            id="forecast-years"
            max={MAX_FORECAST_YEARS_AHEAD}
            min={MIN_FORECAST_YEARS_AHEAD}
            onChange={(event) => onYearsChange(Number(event.target.value))}
            step={1}
            type="range"
            value={yearsAhead}
          />
          <div className="text-muted-foreground flex justify-between text-xs">
            <span>{MIN_FORECAST_YEARS_AHEAD} years</span>
            <span>{MAX_FORECAST_YEARS_AHEAD} years</span>
          </div>
        </div>
      )}
    </div>
  );
};

ForecastControlsComponent.displayName = "ForecastControls";

export const ForecastControls = React.memo(ForecastControlsComponent);
