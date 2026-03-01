import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { memo, useCallback, useMemo } from "react";

import type { HeatStressDescription } from "@/lib/utils/heat-stress";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ForecastControls } from "@/lib/utils/forecast-controls";

interface GraphSectionProperties {
  forecastEnabled: boolean;
  forecastHeatStress?: HeatStressDescription;
  forecastYearsAhead: number;
  graphLoading: boolean;
  heatStressDescription?: HeatStressDescription;
  isMobileGraphLegendOpen?: boolean;
  isMobileViewport?: boolean;
  onForecastToggle: (enabled: boolean) => void;
  onForecastYearsChange: (years: number) => void;
  onSelectChange: (value: string) => void;
  onToggleMobileGraphLegend?: () => void;
  petGraph?: React.ReactElement;
  selectedGraphMeasure: string;
  selectedLocation?: {
    city: string;
    location_id: number;
    state: string;
  };
  selectOptions: Array<{ label: string; value: string }>;
}

export const GraphSection = memo<GraphSectionProperties>(
  ({
    forecastEnabled,
    forecastHeatStress,
    forecastYearsAhead,
    graphLoading,
    heatStressDescription,
    isMobileGraphLegendOpen = false,
    isMobileViewport = false,
    onForecastToggle,
    onForecastYearsChange,
    onSelectChange,
    onToggleMobileGraphLegend,
    petGraph,
    selectedGraphMeasure,
    selectedLocation,
    selectOptions,
  }) => {
    const router = useRouter();
    const loadingUI = useMemo(
      () => (
        <div className="flex size-full flex-col items-center justify-center">
          <Loader2
            aria-label="Loading graph"
            className="size-6 animate-spin text-blue-600"
            data-testid="graph-loader"
          />
          <span className="mt-2 text-gray-500">Loading graph...</span>
        </div>
      ),
      []
    );

    const handleViewDetails = useCallback(() => {
      if (selectedLocation) {
        router.push(`/${selectedLocation.location_id}`);
      }
    }, [router, selectedLocation]);

    const detailsButton = useMemo(() => {
      return (
        <div className="flex justify-center">
          <Button disabled={!selectedLocation} onClick={handleViewDetails}>
            View Full Details
          </Button>
        </div>
      );
    }, [handleViewDetails, selectedLocation]);

    const graphContent = useMemo(
      () => (
        <div className="flex min-h-[clamp(220px,42vh,520px)] w-full max-w-full items-center justify-center sm:min-h-75 sm:max-w-4xl">
          {graphLoading ? loadingUI : petGraph}
        </div>
      ),
      [graphLoading, loadingUI, petGraph]
    );
    return (
      <div className="flex w-full max-w-full min-w-0 flex-col items-center space-y-3 sm:min-h-85 sm:max-w-[90vw] sm:min-w-[320px] sm:space-y-4">
        <div className="w-full max-w-md space-y-3 sm:space-y-4">
          <Select
            className="w-full"
            data={selectOptions}
            label="Measure"
            onChange={value => {
              if (value) {
                onSelectChange(value);
              }
            }}
            size="sm"
            value={selectedGraphMeasure}
          />
          {selectedGraphMeasure === "avg" && (
            <ForecastControls
              enabled={forecastEnabled}
              onToggle={onForecastToggle}
              onYearsChange={onForecastYearsChange}
              yearsAhead={forecastYearsAhead}
            />
          )}
          {heatStressDescription && (
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-sm font-medium text-gray-900">
                {heatStressDescription.prefix}{" "}
                <span
                  className={`font-bold ${heatStressDescription.colorClass}`}
                >
                  {heatStressDescription.value}
                </span>
              </p>
              {forecastEnabled && forecastHeatStress && (
                <p className="mt-2 text-sm font-medium text-gray-900">
                  {forecastHeatStress.prefix}{" "}
                  <span
                    className={`font-bold ${forecastHeatStress.colorClass}`}
                  >
                    {forecastHeatStress.value}
                  </span>
                  {forecastHeatStress.confidenceRange && (
                    <span className="ml-2 text-xs text-gray-600">
                      {forecastHeatStress.confidenceRange}
                    </span>
                  )}
                </p>
              )}
            </div>
          )}
          {isMobileViewport && onToggleMobileGraphLegend && (
            <div className="sm:hidden">
              <Button
                aria-controls="mobile-trend-graph"
                aria-expanded={isMobileGraphLegendOpen}
                onClick={onToggleMobileGraphLegend}
                type="button"
                variant="outline"
              >
                {isMobileGraphLegendOpen
                  ? "Hide Graph Legend"
                  : "Show Graph Legend"}
              </Button>
            </div>
          )}
        </div>
        <div className="w-full" id="mobile-trend-graph">
          {graphContent}
        </div>
        {detailsButton}
      </div>
    );
  }
);

GraphSection.displayName = "GraphSection";
