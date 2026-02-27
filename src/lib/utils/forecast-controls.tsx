"use client";

import React from "react";

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
    <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            checked={enabled}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            onChange={event => onToggle(event.target.checked)}
            type="checkbox"
          />
          <span>Show Forecast</span>
        </label>
      </div>

      {enabled && (
        <div className="space-y-2">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="forecast-years"
          >
            Forecast {yearsAhead} year{yearsAhead === 1 ? "" : "s"} ahead
          </label>
          <input
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-300 accent-blue-600"
            id="forecast-years"
            max={75}
            min={5}
            onChange={event => onYearsChange(Number(event.target.value))}
            step={1}
            type="range"
            value={yearsAhead}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>5 years</span>
            <span>75 years</span>
          </div>
        </div>
      )}
    </div>
  );
};

ForecastControlsComponent.displayName = "ForecastControls";

export const ForecastControls = React.memo(ForecastControlsComponent);
