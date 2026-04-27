"use client";

import { useRouter } from "next/navigation";
import React, { useMemo, useState, useTransition } from "react";

import { HeatStressLegend } from "@/components/app/thermal-stress-legend";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { HeaderBar } from "@/features/header-bar";
import {
  setRankingsHeatStress,
  setRankingsSeason,
  setRankingsState,
  setRankingsYear,
} from "@/lib/actions/actions";
import {
  APP_CONFIG,
  GRAPH_SEASONS,
  normalizeGraphSeason,
  type GraphSeason,
} from "@/lib/constants";
import { YearOptions } from "@/lib/utils/select-options";
import {
  getHeatStressInfo,
  THERMAL_STRESS_LEGEND_ITEMS,
} from "@/lib/utils/thermal-stress";
import { type LocationOptionSection } from "@/types/types";

const getPetRange = (p10: number, p90: number): string => {
  return `${p10.toFixed(1)}-${p90.toFixed(1)}`;
};
const colorMapping = (value: number) => {
  if (value > 0) {
    return "text-red-600";
  } else if (value < 0) {
    return "text-blue-600";
  }

  return "text-gray-600";
};

const YEAR_OPTIONS = YearOptions().map(({ key, label }) => ({
  label,
  value: key,
}));

const ALL_THERMAL_STRESS_LEVELS = THERMAL_STRESS_LEGEND_ITEMS.map((item) => ({
  label: item.level,
  value: item.level,
}));

const SEASON_OPTIONS = GRAPH_SEASONS.map((season) => ({
  label: season,
  value: season,
}));

interface RankingItem {
  avg_pet: number;
  changePerDecade: number | undefined;
  city: string;
  FutureValueLower: number | undefined;
  FutureValueUpper: number | undefined;
  location_id: number;
  max_pet: number | undefined;
  p10: number | undefined;
  p90: number | undefined;
  rank: number;
  state: string;
}

type SortColumn = "avg_pet" | "change" | "city" | "max_pet" | "rank" | "state";

function compareRankingItems(
  a: RankingItem,
  b: RankingItem,
  column: SortColumn,
): number {
  switch (column) {
    case "avg_pet":
      return a.avg_pet - b.avg_pet;
    case "change":
      return (a.changePerDecade ?? 0) - (b.changePerDecade ?? 0);
    case "city":
      return a.city.localeCompare(b.city);
    case "max_pet":
      return (a.max_pet ?? 0) - (b.max_pet ?? 0);
    case "rank":
      return a.rank - b.rank;
    case "state":
      return a.state.localeCompare(b.state);
  }
}

function filterRanking(
  item: RankingItem,
  stateFilter: string,
  heatStressFilter: string,
): boolean {
  if (stateFilter !== "" && item.state !== stateFilter) {
    return false;
  }
  if (heatStressFilter !== "") {
    const heatStressInfo = getHeatStressInfo(item.avg_pet);
    if (heatStressInfo.level !== heatStressFilter) {
      return false;
    }
  }
  return true;
}

function getRankBadgeClasses(rank: number): string {
  if (rank === 1) {
    return "border border-amber-300 bg-amber-100 text-amber-900";
  }

  if (rank === 2) {
    return "border border-slate-300 bg-slate-100 text-slate-900";
  }

  if (rank === 3) {
    return "border border-orange-300 bg-orange-100 text-orange-900";
  }

  return "border border-border bg-background/80 text-foreground";
}

interface RankingsMainProperties {
  initialHeatStress: string;
  initialSeason: GraphSeason;
  initialState: string;
  initialYear: number;
  LocationOptions: LocationOptionSection[];
  rankings: RankingItem[];
  shouldPersistInitialSeason?: boolean;
}

function SortHeader({
  column,
  currentColumn,
  currentDirection,
  label,
  onSort,
}: Readonly<{
  column: SortColumn;
  currentColumn: SortColumn;
  currentDirection: "asc" | "desc";
  label: string;
  onSort: (column: SortColumn) => void;
}>) {
  return (
    <th
      className="text-muted-foreground hover:bg-accent/60 cursor-pointer px-6 py-4 text-left text-xs font-medium tracking-[0.2em] uppercase transition"
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-1">
        {label}
        {currentColumn === column && (
          <span>{currentDirection === "asc" ? "↑" : "↓"}</span>
        )}
      </div>
    </th>
  );
}

export function RankingsMain({
  initialHeatStress,
  initialSeason,
  initialState,
  initialYear,
  LocationOptions,
  rankings,
  shouldPersistInitialSeason = false,
}: Readonly<RankingsMainProperties>) {
  const router = useRouter();
  const [selectedSeason, setSelectedSeason] = useState(initialSeason);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [isPending, startTransition] = useTransition();

  const [stateFilter, setStateFilter] = useState(initialState);
  const [heatStressFilter, setHeatStressFilter] = useState(initialHeatStress);

  const [sortColumn, setSortColumn] = useState<SortColumn>("rank");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const stateOptions = useMemo(() => {
    const filteredByHeatStress = heatStressFilter
      ? rankings.filter(
          (r) => getHeatStressInfo(r.avg_pet).level === heatStressFilter,
        )
      : rankings;

    const uniqueStates = [
      ...new Set(filteredByHeatStress.map((r) => r.state)),
    ].toSorted((a, b) => a.localeCompare(b));
    return uniqueStates.map((state) => ({ label: state, value: state }));
  }, [rankings, heatStressFilter]);

  const heatStressOptions = useMemo(() => {
    const filteredByState = stateFilter
      ? rankings.filter((r) => r.state === stateFilter)
      : rankings;

    const availableLevels = new Set(
      filteredByState.map((r) => getHeatStressInfo(r.avg_pet).level),
    );

    return ALL_THERMAL_STRESS_LEVELS.filter((option) =>
      availableLevels.has(option.value),
    );
  }, [rankings, stateFilter]);

  const filteredAndSortedRankings = useMemo(() => {
    const filtered = rankings.filter((item) =>
      filterRanking(item, stateFilter, heatStressFilter),
    );

    return filtered.toSorted((a, b) => {
      const comparison = compareRankingItems(a, b, sortColumn);
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [rankings, stateFilter, heatStressFilter, sortColumn, sortDirection]);

  const paginatedRankings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedRankings.slice(startIndex, endIndex);
  }, [filteredAndSortedRankings, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedRankings.length / itemsPerPage);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [
    stateFilter,
    heatStressFilter,
    selectedSeason,
    sortColumn,
    sortDirection,
  ]);

  React.useEffect(() => {
    if (!shouldPersistInitialSeason) {
      return;
    }

    startTransition(() => {
      void setRankingsSeason(initialSeason);
    });
  }, [initialSeason, shouldPersistInitialSeason, startTransition]);

  const handleYearChange = (value: string) => {
    if (value) {
      const year = Number(value);
      setSelectedYear(year);
      startTransition(() => {
        void setRankingsYear(year);
      });
    }
  };

  const handleSeasonChange = (value: string) => {
    const season = normalizeGraphSeason(value);
    setSelectedSeason(season);
    startTransition(() => {
      void setRankingsSeason(season);
    });
  };

  const handleHeatStressChange = (value: string) => {
    setHeatStressFilter(value);
    startTransition(() => {
      void setRankingsHeatStress(value);
    });
  };

  const handleHeatStressClear = () => {
    setHeatStressFilter("");
    startTransition(() => {
      void setRankingsHeatStress("");
    });
  };

  const handleStateChange = (value: string) => {
    setStateFilter(value);
    startTransition(() => {
      void setRankingsState(value);
    });
  };

  const handleStateClear = () => {
    setStateFilter("");
    startTransition(() => {
      void setRankingsState("");
    });
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  return (
    <div className="min-h-screen">
      <HeaderBar LocationOptions={LocationOptions} />
      <main
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10"
        id="main-content"
      >
        <section className="climate-hero fade-in-up mb-8 rounded-4xl p-6 sm:p-8">
          <p className="mb-2 text-xs font-semibold tracking-[0.24em] text-white/80 uppercase">
            City rankings
          </p>
          <h1 className="mb-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Cities ranked by Average PET
          </h1>
          <p className="max-w-3xl text-sm text-white/85 sm:text-base">
            Compare thermal stress conditions across cities, filter by season or
            state, and trace which places are warming fastest.{" "}
            {APP_CONFIG.TAGLINE}
          </p>
        </section>

        <section className="glass-panel fade-in-up mb-6 rounded-3xl p-4 [animation-delay:80ms] sm:p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              className="w-full"
              data={YEAR_OPTIONS}
              disabled={isPending}
              label="Year"
              onChange={handleYearChange}
              value={String(selectedYear)}
            />
            <Select
              className="w-full"
              data={SEASON_OPTIONS}
              disabled={isPending}
              label="Season"
              onChange={handleSeasonChange}
              value={selectedSeason}
            />
            <Select
              className="w-full"
              clearable
              data={stateOptions}
              disabled={isPending}
              label="State"
              onChange={handleStateChange}
              onClear={handleStateClear}
              placeholder="All states"
              value={stateFilter}
            />
            <Select
              className="w-full"
              clearable
              data={heatStressOptions}
              disabled={isPending}
              label="Avg Thermal Stress Level"
              onChange={handleHeatStressChange}
              onClear={handleHeatStressClear}
              placeholder="All levels"
              value={heatStressFilter}
            />
          </div>
        </section>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-muted-foreground text-sm">
            Showing{" "}
            {filteredAndSortedRankings.length === 0
              ? 0
              : (currentPage - 1) * itemsPerPage + 1}
            -
            {Math.min(
              currentPage * itemsPerPage,
              filteredAndSortedRankings.length,
            )}{" "}
            of {filteredAndSortedRankings.length} cities
            {filteredAndSortedRankings.length !== rankings.length &&
              ` (filtered from ${rankings.length} total)`}
          </div>
          {isPending && (
            <div className="rounded-full bg-(--pill-surface) px-3 py-1 text-xs font-semibold text-(--pill-foreground)">
              Refreshing filters…
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 xl:flex-row">
          <div className="w-full xl:w-64 xl:shrink-0">
            <div className="glass-panel rounded-3xl p-6 xl:sticky xl:top-28">
              <HeatStressLegend />
            </div>
          </div>

          <div className="glass-panel flex-1 overflow-hidden rounded-3xl">
            <div className="overflow-x-auto">
              <table className="divide-border/70 min-w-full divide-y">
                <thead className="bg-background/55 backdrop-blur-xl">
                  <tr>
                    <SortHeader
                      column="rank"
                      currentColumn={sortColumn}
                      currentDirection={sortDirection}
                      label="Rank"
                      onSort={handleSort}
                    />
                    <SortHeader
                      column="city"
                      currentColumn={sortColumn}
                      currentDirection={sortDirection}
                      label="City"
                      onSort={handleSort}
                    />
                    <SortHeader
                      column="state"
                      currentColumn={sortColumn}
                      currentDirection={sortDirection}
                      label="State"
                      onSort={handleSort}
                    />
                    <SortHeader
                      column="avg_pet"
                      currentColumn={sortColumn}
                      currentDirection={sortDirection}
                      label="Avg PET"
                      onSort={handleSort}
                    />
                    <SortHeader
                      column="max_pet"
                      currentColumn={sortColumn}
                      currentDirection={sortDirection}
                      label="Max PET"
                      onSort={handleSort}
                    />
                    <th className="text-muted-foreground px-6 py-4 text-left text-xs font-medium tracking-[0.2em] uppercase">
                      PET Range (10th-90th percentile)
                    </th>
                    <SortHeader
                      column="change"
                      currentColumn={sortColumn}
                      currentDirection={sortDirection}
                      label="Change per Decade"
                      onSort={handleSort}
                    />
                    <th className="text-muted-foreground px-6 py-4 text-left text-xs font-medium tracking-[0.2em] uppercase">
                      2100 Forecast Range
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border/70 divide-y bg-transparent">
                  {paginatedRankings.length === 0 ? (
                    <tr>
                      <td
                        className="text-muted-foreground px-6 py-12 text-center text-sm"
                        colSpan={8}
                      >
                        No cities match the current filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedRankings.map(
                      ({
                        avg_pet,
                        changePerDecade,
                        city,
                        FutureValueLower,
                        FutureValueUpper,
                        location_id,
                        max_pet,
                        p10,
                        p90,
                        rank,
                        state,
                      }) => {
                        const avgheatStressInfo = getHeatStressInfo(avg_pet);

                        return (
                          <tr
                            className="hover:bg-accent/45 even:bg-background/30 cursor-pointer transition hover:-translate-y-px"
                            key={location_id}
                            onClick={() => router.push(`/${location_id}`)}
                          >
                            <td className="text-foreground px-6 py-4 text-sm font-medium whitespace-nowrap">
                              <span
                                className={`inline-flex min-w-10 items-center justify-center rounded-full px-3 py-1 text-xs font-bold ${getRankBadgeClasses(rank)}`}
                              >
                                {rank}
                              </span>
                            </td>
                            <td className="text-foreground px-6 py-4 text-sm whitespace-nowrap">
                              {city}
                            </td>
                            <td className="text-muted-foreground px-6 py-4 text-sm whitespace-nowrap">
                              <span className="bg-background/80 text-foreground rounded-full px-2.5 py-1 font-medium">
                                {state}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                              <span
                                className={`font-semibold ${avgheatStressInfo.color}`}
                              >
                                {avg_pet.toFixed(1)}°C
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                              {max_pet === undefined ? (
                                <span className="text-muted-foreground">
                                  N/A
                                </span>
                              ) : (
                                <span
                                  className={`font-semibold ${getHeatStressInfo(max_pet).color}`}
                                >
                                  {max_pet.toFixed(1)}°C
                                </span>
                              )}
                            </td>
                            <td className="text-muted-foreground px-6 py-4 text-sm whitespace-nowrap">
                              {p10 !== undefined && p90 !== undefined ? (
                                `${getPetRange(p10, p90)}°C`
                              ) : (
                                <span className="text-muted-foreground">
                                  N/A
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                              {changePerDecade === undefined ? (
                                <span className="text-muted-foreground">
                                  N/A
                                </span>
                              ) : (
                                <span
                                  className={`font-semibold ${colorMapping(changePerDecade)}`}
                                >
                                  {changePerDecade > 0 ? "+" : ""}
                                  {changePerDecade.toFixed(1)}°C
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                              {FutureValueLower !== undefined &&
                              FutureValueUpper !== undefined ? (
                                <div>
                                  <span
                                    className={`font-semibold ${
                                      getHeatStressInfo(FutureValueLower).color
                                    }`}
                                  >
                                    {FutureValueLower.toFixed(1)}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {" "}
                                    -{" "}
                                  </span>
                                  <span
                                    className={`font-semibold ${
                                      getHeatStressInfo(FutureValueUpper).color
                                    }`}
                                  >
                                    {FutureValueUpper.toFixed(1)}°C
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">
                                  N/A
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      },
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination
              onChange={setCurrentPage}
              total={totalPages}
              value={currentPage}
            />
          </div>
        )}
      </main>
    </div>
  );
}
