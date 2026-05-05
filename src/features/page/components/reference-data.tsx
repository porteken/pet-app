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

  const showReferenceLegend = !isMobileViewport || isMobileLegendOpen;

  const generatePetReferenceGraph = React.useCallback(
    async (year: string) => {
      const referenceData =
        year === initialReferenceYear
          ? { dates: CurrentDates, pets: ReferencePets }
          : await FetchReferenceGraphData(year, id, DEFAULT_GRAPH_SEASON);

      const { dates, pets } = referenceData;
      setReferenceGraphSnapshot({ dates, pets, year });
    },
    [CurrentDates, ReferencePets, id, initialReferenceYear],
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
    generatePetReferenceGraph(referenceYear).catch(() => {
      // Error is handled by the graph component's own error state
    });
  }, [generatePetReferenceGraph, referenceYear]);

  return (
    <div className="h-full min-h-0">
      <div className="glass-panel fade-in-up flex h-full min-h-0 flex-col rounded-3xl p-4 sm:px-5 sm:py-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-primary mb-1 text-xs font-semibold tracking-[0.24em] uppercase">
              Historical comparison
            </p>
            <h2 className="text-foreground text-lg font-semibold sm:text-xl">
              Reference Data
            </h2>
          </div>
        </div>
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
          className="min-h-[clamp(220px,42vh,520px)] flex-1 overflow-hidden sm:min-h-[clamp(450px,70vh,850px)]"
          id="reference-data-graph"
        >
          {referenceGraphSnapshot ? (
            <GenerateReferenceGraph
              currentPets={CurrentPets}
              currentYear={
                CurrentDates.at(-1)?.getFullYear() ??
                GRAPH_CONFIG.YEAR_RANGE.END
              }
              dates={referenceGraphSnapshot.dates}
              isMobileViewport={isMobileViewport}
              referencePets={referenceGraphSnapshot.pets}
              referenceYear={referenceGraphSnapshot.year}
              season={DEFAULT_GRAPH_SEASON}
              showLegend={showReferenceLegend}
            />
          ) : (
            <div className="graph-surface-panel text-muted-foreground flex h-full items-center justify-center rounded-2xl px-4 text-center text-sm">
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
