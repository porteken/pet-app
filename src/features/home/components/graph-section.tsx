/* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
import { ForecastControls } from "@/components/app/forecast-controls";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { GenerateTrendGraph } from "@/features/graph";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { memo, useCallback } from "react";

import { ErrorGraphDisplay } from "./error-graph-display";

import type { GraphSeason } from "@/lib/constants";
import type { HeatStressDescription } from "@/lib/utils/thermal-stress";
import type { TrendGraphSnapshot } from "@/lib/utils/trend-analysis";

interface GraphSectionProperties {
  forecastEnabled: boolean;
  forecastHeatStress?: HeatStressDescription;
  forecastYearsAhead: number;
  graphHasError?: boolean;
  graphLoading: boolean;
  heatStressDescription?: HeatStressDescription;
  isMobileGraphLegendOpen?: boolean;
  isMobileViewport?: boolean;
  onForecastToggle: (enabled: boolean) => void;
  onForecastYearsChange: (years: number) => void;
  onSeasonChange: (value: GraphSeason) => void;
  onSelectChange: (value: string) => void;
  onToggleMobileGraphLegend?: () => void;
  selectedGraphMeasure: string;
  selectedGraphSeason: GraphSeason;
  selectedLocation?: {
    city: string;
    location_id: number;
    state: string;
  };
  seasonOptions: Array<{ label: string; value: GraphSeason }>;
  selectOptions: Array<{ label: string; value: string }>;
  trendGraphSnapshot?: TrendGraphSnapshot;
}

interface GraphContentProperties {
  graphHasError?: boolean;
  graphLoading: boolean;
  isMobileViewport: boolean;
  showTrendLegend: boolean;
  trendGraphSnapshot?: TrendGraphSnapshot;
}

interface GraphControlsPanelProperties {
  forecastEnabled: boolean;
  forecastHeatStress?: HeatStressDescription;
  forecastYearsAhead: number;
  heatStressDescription?: HeatStressDescription;
  isMobileGraphLegendOpen: boolean;
  isMobileViewport: boolean;
  onForecastToggle: (enabled: boolean) => void;
  onForecastYearsChange: (years: number) => void;
  onSeasonChange: (value: GraphSeason) => void;
  onSelectChange: (value: string) => void;
  onToggleMobileGraphLegend?: () => void;
  selectedGraphMeasure: string;
  selectedGraphSeason: GraphSeason;
  seasonOptions: Array<{ label: string; value: GraphSeason }>;
  selectOptions: Array<{ label: string; value: string }>;
}

interface GraphHeatStressSummaryProperties {
  forecastEnabled: boolean;
  forecastHeatStress?: HeatStressDescription;
  heatStressDescription?: HeatStressDescription;
}

interface MobileLegendToggleProperties {
  isMobileGraphLegendOpen: boolean;
  onToggleMobileGraphLegend: () => void;
}

const GraphLoadingState = (): React.ReactElement => {
  return (
    <div className="graph-surface-panel flex size-full flex-col items-center justify-center rounded-2xl">
      <Loader2
        aria-label="Loading graph"
        className="text-primary size-6 animate-spin"
        data-testid="graph-loader"
      />
      <span className="text-muted-foreground mt-2">Loading graph...</span>
    </div>
  );
};

const GraphEmptyState = (): React.ReactElement => {
  return (
    <div className="graph-surface-panel text-muted-foreground flex size-full items-center justify-center rounded-2xl px-4 text-center text-sm">
      Select a city to view PET trend data.
    </div>
  );
};

const GraphContent = ({
  graphHasError = false,
  graphLoading,
  isMobileViewport,
  showTrendLegend,
  trendGraphSnapshot,
}: GraphContentProperties): React.ReactElement => {
  if (graphLoading) {
    return <GraphLoadingState />;
  }

  if (graphHasError) {
    return <ErrorGraphDisplay />;
  }

  if (!trendGraphSnapshot) {
    return <GraphEmptyState />;
  }

  return (
    <GenerateTrendGraph
      forecastData={trendGraphSnapshot.forecastData}
      increasePerYear={trendGraphSnapshot.increase_per_year}
      isMobileViewport={isMobileViewport}
      option={trendGraphSnapshot.option}
      season={trendGraphSnapshot.season}
      showLegend={showTrendLegend}
      trendlinePets={trendGraphSnapshot.trendline_pets}
      yearPets={trendGraphSnapshot.year_pets}
      years={trendGraphSnapshot.years}
    />
  );
};

const handleSeasonSelectChange = (
  value: string | undefined,
  onSeasonChange: (value: GraphSeason) => void,
): void => {
  if (!value) {
    return;
  }

  onSeasonChange(value as GraphSeason);
};

const handleMeasureSelectChange = (
  value: string | undefined,
  onSelectChange: (value: string) => void,
): void => {
  if (!value) {
    return;
  }

  onSelectChange(value);
};

const GraphHeatStressSummary = ({
  forecastEnabled,
  forecastHeatStress,
  heatStressDescription,
}: GraphHeatStressSummaryProperties): React.ReactElement | null => {
  if (!heatStressDescription) {
    return null;
  }

  const visibleForecastHeatStress = forecastEnabled
    ? forecastHeatStress
    : undefined;

  return (
    <div className="glass-panel-muted rounded-2xl p-4">
      <p className="text-foreground text-sm font-medium">
        {heatStressDescription.prefix}{" "}
        <span className={`font-bold ${heatStressDescription.colorClass}`}>
          {heatStressDescription.value}
        </span>
      </p>
      {visibleForecastHeatStress && (
        <p className="text-foreground mt-2 text-sm font-medium">
          {visibleForecastHeatStress.prefix}{" "}
          <span className={`font-bold ${visibleForecastHeatStress.colorClass}`}>
            {visibleForecastHeatStress.value}
          </span>
          {visibleForecastHeatStress.confidenceRange && (
            <span className="text-muted-foreground ml-2 text-xs">
              {visibleForecastHeatStress.confidenceRange}
            </span>
          )}
        </p>
      )}
    </div>
  );
};

const MobileLegendToggle = ({
  isMobileGraphLegendOpen,
  onToggleMobileGraphLegend,
}: MobileLegendToggleProperties): React.ReactElement => {
  return (
    <div className="sm:hidden">
      <Button
        aria-controls="mobile-trend-graph"
        aria-expanded={isMobileGraphLegendOpen}
        onClick={onToggleMobileGraphLegend}
        type="button"
        variant="outline"
      >
        {isMobileGraphLegendOpen ? "Hide Graph Legend" : "Show Graph Legend"}
      </Button>
    </div>
  );
};

class GraphControlsPanel extends React.PureComponent<GraphControlsPanelProperties> {
  private readonly handleMeasureChange = (value: string | undefined) => {
    handleMeasureSelectChange(value, this.props.onSelectChange);
  };

  private readonly handleSeasonChange = (value: string | undefined) => {
    handleSeasonSelectChange(value, this.props.onSeasonChange);
  };

  public render(): React.ReactElement {
    const {
      forecastEnabled,
      forecastHeatStress,
      forecastYearsAhead,
      heatStressDescription,
      isMobileGraphLegendOpen,
      isMobileViewport,
      onForecastToggle,
      onForecastYearsChange,
      onToggleMobileGraphLegend,
      selectedGraphMeasure,
      selectedGraphSeason,
      seasonOptions,
      selectOptions,
    } = this.props;

    const showForecastControls = selectedGraphMeasure === "avg";
    const showMobileLegendToggle =
      isMobileViewport && onToggleMobileGraphLegend !== undefined;

    return (
      <div className="w-full max-w-md space-y-3 sm:space-y-4">
        <Select
          className="w-full"
          data={seasonOptions}
          label="Season"
          onChange={this.handleSeasonChange}
          size="sm"
          value={selectedGraphSeason}
        />
        <Select
          className="w-full"
          data={selectOptions}
          label="Measure"
          onChange={this.handleMeasureChange}
          size="sm"
          value={selectedGraphMeasure}
        />
        {showForecastControls && (
          <ForecastControls
            enabled={forecastEnabled}
            onToggle={onForecastToggle}
            onYearsChange={onForecastYearsChange}
            yearsAhead={forecastYearsAhead}
          />
        )}
        <GraphHeatStressSummary
          forecastEnabled={forecastEnabled}
          forecastHeatStress={forecastHeatStress}
          heatStressDescription={heatStressDescription}
        />
        {showMobileLegendToggle && onToggleMobileGraphLegend && (
          <MobileLegendToggle
            isMobileGraphLegendOpen={isMobileGraphLegendOpen}
            onToggleMobileGraphLegend={onToggleMobileGraphLegend}
          />
        )}
      </div>
    );
  }
}

export const GraphSection = memo<GraphSectionProperties>(
  ({
    forecastEnabled,
    forecastHeatStress,
    forecastYearsAhead,
    graphHasError = false,
    graphLoading,
    heatStressDescription,
    isMobileGraphLegendOpen = false,
    isMobileViewport = false,
    onForecastToggle,
    onForecastYearsChange,
    onSeasonChange,
    onSelectChange,
    onToggleMobileGraphLegend,
    selectedGraphMeasure,
    selectedGraphSeason,
    selectedLocation,
    seasonOptions,
    selectOptions,
    trendGraphSnapshot,
  }) => {
    const router = useRouter();
    const showTrendLegend = !isMobileViewport || isMobileGraphLegendOpen;

    const handleViewDetails = useCallback(() => {
      if (selectedLocation) {
        router.push(`/${selectedLocation.location_id}`);
      }
    }, [router, selectedLocation]);

    return (
      <div className="flex h-full w-full max-w-full min-w-0 flex-col items-center gap-4 sm:min-h-0 sm:max-w-[95vw] sm:min-w-[320px] sm:flex-1 sm:gap-5">
        <GraphControlsPanel
          forecastEnabled={forecastEnabled}
          forecastHeatStress={forecastHeatStress}
          forecastYearsAhead={forecastYearsAhead}
          heatStressDescription={heatStressDescription}
          isMobileGraphLegendOpen={isMobileGraphLegendOpen}
          isMobileViewport={isMobileViewport}
          onForecastToggle={onForecastToggle}
          onForecastYearsChange={onForecastYearsChange}
          onSeasonChange={onSeasonChange}
          onSelectChange={onSelectChange}
          onToggleMobileGraphLegend={onToggleMobileGraphLegend}
          selectedGraphMeasure={selectedGraphMeasure}
          selectedGraphSeason={selectedGraphSeason}
          seasonOptions={seasonOptions}
          selectOptions={selectOptions}
        />
        <div className="flex w-full flex-1" id="mobile-trend-graph">
          <div className="flex min-h-[clamp(260px,48vh,620px)] w-full max-w-full flex-1 items-center justify-center sm:min-h-140 sm:max-w-5xl">
            <GraphContent
              graphHasError={graphHasError}
              graphLoading={graphLoading}
              isMobileViewport={isMobileViewport}
              showTrendLegend={showTrendLegend}
              trendGraphSnapshot={trendGraphSnapshot}
            />
          </div>
        </div>
        <div className="flex justify-center">
          <Button disabled={!selectedLocation} onClick={handleViewDetails}>
            View Full Details
          </Button>
        </div>
      </div>
    );
  },
);

GraphSection.displayName = "GraphSection";
