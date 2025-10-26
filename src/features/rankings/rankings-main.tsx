"use client";

import { MultiSelect, Pagination, Select } from "@mantine/core";
import { useRouter } from "next/navigation";
import React, { useMemo, useState, useTransition } from "react";

import { HeaderBar } from "@/features/header-bar";
import { setRankingsYear } from "@/lib/actions/rankings-actions";
import { getHeatStressInfo } from "@/lib/utils/heat-stress";
import { LocationOptionSection } from "@/types/types";

const getPetRange = (p25: number, p75: number): string => {
  return `${p25.toFixed(1)}-${p75.toFixed(1)}`;
};
const color_mapping = (value: number) => {
  if (value > 0) {
    return "text-red-600";
  } else if (value < 0) {
    return "text-blue-600";
  }

  return "text-grey-600";
};
interface RankingItem {
  avg_pet: number;
  changeFrom2000: null | number;
  city: string;
  FutureValue: null | number;
  location_id: number;
  max_pet: number;
  p25: number;
  p75: number;
  rank: number;
  state: string;
}

interface RankingsMainProperties {
  initialYear: number;
  LocationOptions: LocationOptionSection[];
  rankings: RankingItem[];
}

export const RankingsMain: React.FC<RankingsMainProperties> = ({
  initialYear,
  LocationOptions,
  rankings,
}) => {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [isPending, startTransition] = useTransition();

  const [stateFilter, setStateFilter] = useState<string[]>([]);
  const [heatStressFilter, setHeatStressFilter] = useState<string[]>([]);

  type SortColumn =
    | "avg_pet"
    | "change"
    | "city"
    | "FutureValue"
    | "max_pet"
    | "rank"
    | "state";
  const [sortColumn, setSortColumn] = useState<SortColumn>("rank");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const yearOptions = Array.from({ length: 26 }, (_, index) => ({
    label: String(2000 + index),
    value: String(2000 + index),
  }));

  const stateOptions = useMemo(() => {
    const uniqueStates = [...new Set(rankings.map(r => r.state))].toSorted(
      (a, b) => a.localeCompare(b)
    );
    return uniqueStates.map(state => ({ label: state, value: state }));
  }, [rankings]);

  const heatStressOptions = [
    { label: "None to Slight", value: "None to Slight" },
    { label: "Moderate", value: "Moderate" },
    { label: "Strong", value: "Strong" },
    { label: "Extreme", value: "Extreme" },
  ];

  const filteredAndSortedRankings = useMemo(() => {
    const filtered = rankings.filter(({ avg_pet, state }) => {
      if (stateFilter.length > 0 && !stateFilter.includes(state)) {
        return false;
      }

      if (heatStressFilter.length > 0) {
        const heatStressInfo = getHeatStressInfo(avg_pet);
        if (!heatStressFilter.includes(heatStressInfo.level)) {
          return false;
        }
      }

      return true;
    });

    return filtered.toSorted((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case "avg_pet": {
          comparison = a.avg_pet - b.avg_pet;
          break;
        }
        case "change": {
          const aChange = a.changeFrom2000 ?? 0;
          const bChange = b.changeFrom2000 ?? 0;
          comparison = aChange - bChange;
          break;
        }
        case "city": {
          comparison = a.city.localeCompare(b.city);
          break;
        }
        case "FutureValue": {
          comparison = a.FutureValue! - b.FutureValue!;
          break;
        }
        case "max_pet": {
          comparison = a.max_pet - b.max_pet;
          break;
        }
        case "rank": {
          comparison = a.rank - b.rank;
          break;
        }
        case "state": {
          comparison = a.state.localeCompare(b.state);
          break;
        }
      }

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
  }, [stateFilter, heatStressFilter, sortColumn, sortDirection]);

  const handleYearChange = (value: null | string) => {
    if (value) {
      const year = Number(value);
      setSelectedYear(year);
      startTransition(() => {
        void setRankingsYear(year);
      });
    }
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
    <div className="min-h-screen bg-gray-50">
      <HeaderBar LocationOptions={LocationOptions} />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Cities ranked by Average PET
          </h1>
        </div>

        <div className="mb-6 flex flex-wrap gap-4">
          <Select
            className="w-48"
            data={yearOptions}
            disabled={isPending}
            label="Year"
            onChange={handleYearChange}
            value={String(selectedYear)}
          />
          <MultiSelect
            className="w-48"
            clearable
            data={stateOptions}
            disabled={isPending}
            label="State"
            onChange={setStateFilter}
            placeholder="All states"
            value={stateFilter}
          />
          <MultiSelect
            className="w-64"
            clearable
            data={heatStressOptions}
            disabled={isPending}
            label="Avg Heat Stress Level"
            onChange={setHeatStressFilter}
            placeholder="All levels"
            value={heatStressFilter}
          />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing{" "}
            {filteredAndSortedRankings.length === 0
              ? 0
              : (currentPage - 1) * itemsPerPage + 1}
            -
            {Math.min(
              currentPage * itemsPerPage,
              filteredAndSortedRankings.length
            )}{" "}
            of {filteredAndSortedRankings.length} cities
            {filteredAndSortedRankings.length !== rankings.length &&
              ` (filtered from ${rankings.length} total)`}
          </div>
          {totalPages > 1 && (
            <Pagination
              onChange={setCurrentPage}
              total={totalPages}
              value={currentPage}
            />
          )}
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase hover:bg-gray-100"
                    onClick={() => handleSort("rank")}
                  >
                    <div className="flex items-center gap-1">
                      Rank
                      {sortColumn === "rank" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase hover:bg-gray-100"
                    onClick={() => handleSort("city")}
                  >
                    <div className="flex items-center gap-1">
                      City
                      {sortColumn === "city" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase hover:bg-gray-100"
                    onClick={() => handleSort("state")}
                  >
                    <div className="flex items-center gap-1">
                      State
                      {sortColumn === "state" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase hover:bg-gray-100"
                    onClick={() => handleSort("avg_pet")}
                  >
                    <div className="flex items-center gap-1">
                      Avg Value
                      {sortColumn === "avg_pet" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase hover:bg-gray-100"
                    onClick={() => handleSort("max_pet")}
                  >
                    <div className="flex items-center gap-1">
                      Max Value
                      {sortColumn === "max_pet" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    PET Range (25th to 75th percentile)
                  </th>
                  <th
                    className="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase hover:bg-gray-100"
                    onClick={() => handleSort("change")}
                  >
                    <div className="flex items-center gap-1">
                      Change from 2000
                      {sortColumn === "change" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase hover:bg-gray-100"
                    onClick={() => handleSort("FutureValue")}
                  >
                    <div className="flex items-center gap-1">
                      2100 Forecasted PET
                      {sortColumn === "FutureValue" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {paginatedRankings.map(
                  ({
                    avg_pet,
                    changeFrom2000,
                    city,
                    FutureValue,
                    location_id,
                    max_pet,
                    p25,
                    p75,
                    rank,
                    state,
                  }) => {
                    const avgheatStressInfo = getHeatStressInfo(avg_pet);
                    const maxheatStressInfo = getHeatStressInfo(max_pet);
                    const futureheatStressInfo = FutureValue
                      ? getHeatStressInfo(FutureValue)
                      : "";
                    return (
                      <tr
                        className="hover:bg-gray-50"
                        key={location_id}
                        onClick={() => router.push(`/${location_id}`)}
                        style={{ cursor: "pointer" }}
                      >
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                          {rank}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                          {city}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                          {state}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          <span
                            className={`font-semibold ${avgheatStressInfo.color}`}
                          >
                            {avg_pet.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          <span
                            className={`font-semibold ${maxheatStressInfo.color}`}
                          >
                            {max_pet.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                          {getPetRange(p25, p75)}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          {changeFrom2000 === null ? (
                            <span className="text-gray-400">N/A</span>
                          ) : (
                            <span
                              className={`font-semibold ${color_mapping(
                                changeFrom2000
                              )}`}
                            >
                              {changeFrom2000 > 0 ? "+" : ""}
                              {changeFrom2000.toFixed(1)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          <span
                            className={`font-semibold ${futureheatStressInfo ? futureheatStressInfo.color : ""}`}
                          >
                            {FutureValue ? FutureValue.toFixed(1) : ""}
                          </span>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
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
};
