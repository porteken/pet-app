"use client";

import { GenerateReferenceGraph } from "@/features/graph";
import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import { FetchReferenceGraphData } from "@/lib/api/fetch-client";
import { DEFAULT_GRAPH_SEASON, GRAPH_CONFIG } from "@/lib/constants";
import { YearOptions } from "@/lib/utils/select-options";
import React from "react";

interface ReferenceDataProperties {
  CurrentDates: Date[];
  CurrentPets: number[];
  id: number;
  initialReferenceYear: string;
  onReferenceYearChange: (referenceYear: string) => void;
  referenceYear: string;
  ReferencePets: number[];
}

interface ReferenceGraphSnapshot {
  dates: Date[];
  pets: number[];
  year: string;
}

const REFERENCE_SCROLL_HINT_THRESHOLD = 90;
const REFERENCE_MIN_CHART_WIDTH_MOBILE = 840;
const REFERENCE_MIN_CHART_WIDTH_DESKTOP = 1120;
const REFERENCE_POINT_WIDTH_MOBILE = 3.5;
const REFERENCE_POINT_WIDTH_DESKTOP = 4.5;

const ReferenceDataComponent: React.FC<ReferenceDataProperties> = ({
  CurrentDates,
  CurrentPets,
  id,
  initialReferenceYear,
  onReferenceYearChange,
  referenceYear,
  ReferencePets,
}) => {
  const REFERENCE_YEARS = React.useMemo(() => YearOptions(), []);
  const [referenceGraphSnapshot, setReferenceGraphSnapshot] =
    React.useState<ReferenceGraphSnapshot>();
  const isMobileViewport = useIsMobileViewport();
  const [isMobileLegendOpen, setIsMobileLegendOpen] = React.useState(false);
  const latestReferenceRequestRef = React.useRef(0);

  const showReferenceLegend = !isMobileViewport || isMobileLegendOpen;
  const referencePointCount = referenceGraphSnapshot?.dates.length ?? 0;
  const needsHorizontalScroll =
    referencePointCount >= REFERENCE_SCROLL_HINT_THRESHOLD;
  const referenceChartMinWidth = React.useMemo(() => {
    if (!needsHorizontalScroll) {
      return 0;
    }

    const minimumWidth = isMobileViewport
      ? REFERENCE_MIN_CHART_WIDTH_MOBILE
      : REFERENCE_MIN_CHART_WIDTH_DESKTOP;
    const pointWidth = isMobileViewport
      ? REFERENCE_POINT_WIDTH_MOBILE
      : REFERENCE_POINT_WIDTH_DESKTOP;

    return Math.max(minimumWidth, Math.round(referencePointCount * pointWidth));
  }, [isMobileViewport, needsHorizontalScroll, referencePointCount]);

  const containerStyle = React.useMemo(
    () => ({ minWidth: `${referenceChartMinWidth}px` }),
    [referenceChartMinWidth],
  );

  const generatePetReferenceGraph = React.useCallback(
    async (year: string) => {
      const requestId = ++latestReferenceRequestRef.current;
      const hasInitialReferenceSnapshot =
        CurrentDates.length > 0 &&
        CurrentPets.length === CurrentDates.length &&
        ReferencePets.length === CurrentDates.length;
      const referenceData =
        year === initialReferenceYear && hasInitialReferenceSnapshot
          ? { dates: CurrentDates, pets: ReferencePets }
          : await FetchReferenceGraphData(year, id, DEFAULT_GRAPH_SEASON);

      const { dates, pets } = referenceData;

      if (requestId !== latestReferenceRequestRef.current) {
        return;
      }

      setReferenceGraphSnapshot({ dates, pets, year });
    },
    [CurrentDates, CurrentPets.length, ReferencePets, id, initialReferenceYear],
  );

  const handleReferenceYearChange = React.useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const year = event.target.value;
      setIsMobileLegendOpen(false);
      onReferenceYearChange(year);
    },
    [onReferenceYearChange],
  );

  const handleToggleMobileLegend = React.useCallback(() => {
    setIsMobileLegendOpen((previous) => !previous);
  }, []);

  React.useEffect(() => {
    const performGenerate = async () => {
      try {
        await generatePetReferenceGraph(referenceYear);
      } catch {
        // Error is handled by the graph component's own error state
      }
    };
    void performGenerate();
  }, [generatePetReferenceGraph, referenceYear]);

  return (
    <div className="h-full min-h-0 min-w-0">
      <div className="fade-in-up glass-panel flex h-full min-h-0 min-w-0 flex-col rounded-3xl p-4 sm:px-5 sm:py-6">
        <h2 className="sr-only">Reference Data</h2>
        <div className="mb-5 space-y-4">
          <label
            className="text-foreground mb-2 block text-sm font-medium"
            htmlFor="reference-year"
          >
            Reference Year
          </label>
          <select
            className="border-border bg-background/80 text-foreground focus:border-primary focus:ring-primary/20 h-11 w-full rounded-xl border px-3 shadow-sm transition outline-none focus:ring-2"
            id="reference-year"
            onChange={handleReferenceYearChange}
            value={referenceYear}
          >
            {REFERENCE_YEARS.map((option) => (
              <option key={`year-${option.key}`} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3 sm:hidden">
          <button
            aria-controls="reference-data-graph"
            aria-expanded={isMobileLegendOpen}
            className="border-border bg-background/80 text-foreground hover:bg-accent rounded-full border px-3 py-2 text-sm font-semibold shadow-sm transition"
            onClick={handleToggleMobileLegend}
            type="button"
          >
            {isMobileLegendOpen ? "Hide Graph Legend" : "Show Graph Legend"}
          </button>
        </div>
        <div
          className="flex min-h-[clamp(220px,42vh,520px)] min-w-0 flex-1 flex-col overflow-hidden sm:min-h-[clamp(450px,70vh,850px)]"
          id="reference-data-graph"
        >
          {referenceGraphSnapshot ? (
            <div
              aria-label="Scrollable reference graph"
              className="-mx-4 min-h-0 min-w-0 flex-1 touch-pan-x overflow-x-auto overflow-y-hidden px-4 pb-2 sm:mx-0 sm:px-0"
              data-testid="reference-graph-scroll-region"
            >
              <div className="h-full min-w-full" style={containerStyle}>
                <GenerateReferenceGraph
                  currentPets={CurrentPets}
                  currentYear={
                    CurrentDates.at(-1)?.getUTCFullYear() ??
                    GRAPH_CONFIG.YEAR_RANGE.END
                  }
                  dates={referenceGraphSnapshot.dates}
                  isMobileViewport={isMobileViewport}
                  referencePets={referenceGraphSnapshot.pets}
                  referenceYear={referenceGraphSnapshot.year}
                  season={DEFAULT_GRAPH_SEASON}
                  showLegend={showReferenceLegend}
                />
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground graph-surface-panel flex h-full items-center justify-center rounded-2xl px-4 text-center text-sm">
              Loading chart…
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ReferenceDataComponent.displayName = "ReferenceData";

export const ReferenceData = React.memo(ReferenceDataComponent);
