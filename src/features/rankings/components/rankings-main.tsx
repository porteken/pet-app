"use client";

const RANK_THREE = 3;

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
  GRAPH_SEASONS,
  normalizeGraphSeason,
  type GraphSeason,
} from "@/lib/constants";
import { YearOptions } from "@/lib/utils/select-options";
import {
  getHeatStressInfo,
  THERMAL_STRESS_LEGEND_ITEMS,
} from "@/lib/utils/thermal-stress";
import { useRouter } from "next/navigation";
import React, { useMemo, useState, useTransition } from "react";

import type { LocationOptionSection } from "@/types/types";

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

interface SelectOption {
  label: string;
  value: string;
}

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
  changeFrom2000: number | undefined;
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
      return (a.changeFrom2000 ?? 0) - (b.changeFrom2000 ?? 0);
    case "city":
      return a.city.localeCompare(b.city);
    case "max_pet":
      return (a.max_pet ?? 0) - (b.max_pet ?? 0);
    case "rank":
      return a.rank - b.rank;
    case "state":
      return a.state.localeCompare(b.state);
    default:
      return 0;
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

  if (rank === RANK_THREE) {
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

interface RankingsFiltersProperties {
  heatStressFilter: string;
  heatStressOptions: SelectOption[];
  isPending: boolean;
  selectedSeason: GraphSeason;
  selectedYear: number;
  setHeatStressFilter: React.Dispatch<React.SetStateAction<string>>;
  setSelectedSeason: React.Dispatch<React.SetStateAction<GraphSeason>>;
  setSelectedYear: React.Dispatch<React.SetStateAction<number>>;
  setStateFilter: React.Dispatch<React.SetStateAction<string>>;
  startTransition: React.TransitionStartFunction;
  stateFilter: string;
  stateOptions: SelectOption[];
}

class RankingsFilters extends React.PureComponent<RankingsFiltersProperties> {
  private readonly handleHeatStressChange = (value: string) => {
    this.props.setHeatStressFilter(value);
    this.props.startTransition(() => {
      void setRankingsHeatStress(value);
    });
  };

  private readonly handleHeatStressClear = () => {
    this.props.setHeatStressFilter("");
    this.props.startTransition(() => {
      void setRankingsHeatStress("");
    });
  };

  private readonly handleSeasonChange = (value: string) => {
    const season = normalizeGraphSeason(value);
    this.props.setSelectedSeason(season);
    this.props.startTransition(() => {
      void setRankingsSeason(season);
    });
  };

  private readonly handleStateChange = (value: string) => {
    this.props.setStateFilter(value);
    this.props.startTransition(() => {
      void setRankingsState(value);
    });
  };

  private readonly handleStateClear = () => {
    this.props.setStateFilter("");
    this.props.startTransition(() => {
      void setRankingsState("");
    });
  };

  private readonly handleYearChange = (value: string) => {
    if (!value) {
      return;
    }

    const year = Number(value);
    this.props.setSelectedYear(year);
    this.props.startTransition(() => {
      void setRankingsYear(year);
    });
  };

  public render(): React.ReactElement {
    const {
      heatStressFilter,
      heatStressOptions,
      isPending,
      selectedSeason,
      selectedYear,
      stateFilter,
      stateOptions,
    } = this.props;

    return (
      <section className="glass-panel fade-in-up mb-6 rounded-3xl p-4 [animation-delay:80ms] sm:p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            className="w-full"
            data={YEAR_OPTIONS}
            disabled={isPending}
            label="Year"
            onChange={this.handleYearChange}
            value={String(selectedYear)}
          />
          <Select
            className="w-full"
            data={SEASON_OPTIONS}
            disabled={isPending}
            label="Season"
            onChange={this.handleSeasonChange}
            value={selectedSeason}
          />
          <Select
            className="w-full"
            clearable
            data={stateOptions}
            disabled={isPending}
            label="State"
            onChange={this.handleStateChange}
            onClear={this.handleStateClear}
            placeholder="All states"
            value={stateFilter}
          />
          <Select
            className="w-full"
            clearable
            data={heatStressOptions}
            disabled={isPending}
            label="Avg Thermal Stress Level"
            onChange={this.handleHeatStressChange}
            onClear={this.handleHeatStressClear}
            placeholder="All levels"
            value={heatStressFilter}
          />
        </div>
      </section>
    );
  }
}

class SortHeader extends React.PureComponent<{
  column: SortColumn;
  currentColumn: SortColumn;
  currentDirection: "asc" | "desc";
  label: string;
  setSortColumn: React.Dispatch<React.SetStateAction<SortColumn>>;
  setSortDirection: React.Dispatch<React.SetStateAction<"asc" | "desc">>;
}> {
  private readonly handleClick = () => {
    const {
      column,
      currentColumn,
      currentDirection,
      setSortColumn,
      setSortDirection,
    } = this.props;

    if (currentColumn === column) {
      setSortDirection(currentDirection === "asc" ? "desc" : "asc");
      return;
    }

    setSortColumn(column);
    setSortDirection("asc");
  };

  public render(): React.ReactElement {
    const { column, currentColumn, currentDirection, label } = this.props;

    return (
      <th
        className="text-muted-foreground hover:bg-accent/60 cursor-pointer px-6 py-4 text-left text-xs font-medium tracking-[0.2em] uppercase transition"
        onClick={this.handleClick}
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
}

class RankingRow extends React.PureComponent<{
  item: RankingItem;
  push: (href: string) => void;
}> {
  private readonly handleClick = () => {
    this.props.push(`/${this.props.item.location_id}`);
  };

  public render(): React.ReactElement {
    const {
      item: {
        avg_pet,
        changeFrom2000,
        city,
        FutureValueLower,
        FutureValueUpper,
        max_pet,
        p10,
        p90,
        rank,
        state,
      },
    } = this.props;
    const avgHeatStressInfo = getHeatStressInfo(avg_pet);

    return (
      <tr
        className="hover:bg-accent/45 even:bg-background/30 cursor-pointer transition hover:-translate-y-px"
        onClick={this.handleClick}
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
          <span className={`font-semibold ${avgHeatStressInfo.color}`}>
            {avg_pet.toFixed(1)}°C
          </span>
        </td>
        <td className="px-6 py-4 text-sm whitespace-nowrap">
          {max_pet === undefined ? (
            <span className="text-muted-foreground">N/A</span>
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
            <span className="text-muted-foreground">N/A</span>
          )}
        </td>
        <td className="px-6 py-4 text-sm whitespace-nowrap">
          {changeFrom2000 === undefined ? (
            <span className="text-muted-foreground">N/A</span>
          ) : (
            <span className={`font-semibold ${colorMapping(changeFrom2000)}`}>
              {changeFrom2000 > 0 ? "+" : ""}
              {changeFrom2000.toFixed(1)}°C
            </span>
          )}
        </td>
        <td className="px-6 py-4 text-sm whitespace-nowrap">
          {FutureValueLower !== undefined && FutureValueUpper !== undefined ? (
            <div>
              <span
                className={`font-semibold ${getHeatStressInfo(FutureValueLower).color}`}
              >
                {FutureValueLower.toFixed(1)}
              </span>
              <span className="text-muted-foreground"> - </span>
              <span
                className={`font-semibold ${getHeatStressInfo(FutureValueUpper).color}`}
              >
                {FutureValueUpper.toFixed(1)}°C
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">N/A</span>
          )}
        </td>
      </tr>
    );
  }
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
  const handlePush = React.useCallback(
    (url: string) => {
      router.push(url);
    },
    [router],
  );
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

  return (
    <div className="min-h-screen">
      <HeaderBar compact LocationOptions={LocationOptions} />
      <main
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10"
        id="main-content"
      >
        <section className="glass-panel fade-in-up mb-8 overflow-hidden rounded-4xl">
          <div className="bg-primary px-6 py-5 sm:px-8 sm:py-6">
            <h1 className="text-primary-foreground text-3xl font-black tracking-tight sm:text-4xl">
              Cities ranked by Average PET
            </h1>
          </div>
        </section>

        <RankingsFilters
          heatStressFilter={heatStressFilter}
          heatStressOptions={heatStressOptions}
          isPending={isPending}
          selectedSeason={selectedSeason}
          selectedYear={selectedYear}
          setHeatStressFilter={setHeatStressFilter}
          setSelectedSeason={setSelectedSeason}
          setSelectedYear={setSelectedYear}
          setStateFilter={setStateFilter}
          startTransition={startTransition}
          stateFilter={stateFilter}
          stateOptions={stateOptions}
        />

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
                      setSortColumn={setSortColumn}
                      setSortDirection={setSortDirection}
                    />
                    <SortHeader
                      column="city"
                      currentColumn={sortColumn}
                      currentDirection={sortDirection}
                      label="City"
                      setSortColumn={setSortColumn}
                      setSortDirection={setSortDirection}
                    />
                    <SortHeader
                      column="state"
                      currentColumn={sortColumn}
                      currentDirection={sortDirection}
                      label="State"
                      setSortColumn={setSortColumn}
                      setSortDirection={setSortDirection}
                    />
                    <SortHeader
                      column="avg_pet"
                      currentColumn={sortColumn}
                      currentDirection={sortDirection}
                      label="Avg PET"
                      setSortColumn={setSortColumn}
                      setSortDirection={setSortDirection}
                    />
                    <SortHeader
                      column="max_pet"
                      currentColumn={sortColumn}
                      currentDirection={sortDirection}
                      label="Max PET"
                      setSortColumn={setSortColumn}
                      setSortDirection={setSortDirection}
                    />
                    <th className="text-muted-foreground px-6 py-4 text-left text-xs font-medium tracking-[0.2em] uppercase">
                      PET Range (10th-90th percentile)
                    </th>
                    <SortHeader
                      column="change"
                      currentColumn={sortColumn}
                      currentDirection={sortDirection}
                      label="Change from 2000"
                      setSortColumn={setSortColumn}
                      setSortDirection={setSortDirection}
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
                    paginatedRankings.map((item) => (
                      <RankingRow
                        item={item}
                        key={item.location_id}
                        push={handlePush}
                      />
                    ))
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
