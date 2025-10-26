"use client";

import { MultiSelect, Pagination, Select } from "@mantine/core";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

import { HeaderBar } from "@/features/header-bar";
import { getHeatStressInfo } from "@/lib/utils/heat-stress";
import { LocationOptionSection } from "@/types/types";

const getPetRange = (p25: number, p75: number): string => {
  return `${p25.toFixed(1)}-${p75.toFixed(1)}`;
};

interface RankingItem {
  changeFrom2000: null | number;
  city: string;
  location_id: number;
  p25: number;
  p75: number;
  pet: number;
  rank: number;
  state: string;
}

interface RankingsMainProperties {
  initialMeasure: "avg" | "max";
  initialYear: number;
  LocationOptions: LocationOptionSection[];
  rankings: RankingItem[];
}

export const RankingsMain: React.FC<RankingsMainProperties> = ({
  initialMeasure,
  initialYear,
  LocationOptions,
  rankings,
}) => {
  const router = useRouter();
  const [selectedMeasure, setSelectedMeasure] = useState(initialMeasure);
  const [selectedYear, setSelectedYear] = useState(initialYear);

  // Filter states
  // eslint-disable-next-line unicorn/no-null -- Mantine Select requires null for clearable functionality
  const [stateFilter, setStateFilter] = useState<null | string>(null);
  const [heatStressFilter, setHeatStressFilter] = useState<string[]>([]);

  // Sorting state
  type SortColumn =
    | "change"
    | "city"
    | "heat_stress"
    | "pet"
    | "rank"
    | "state";
  const [sortColumn, setSortColumn] = useState<SortColumn>("rank");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Generate year options from 2000 to 2025
  const yearOptions = Array.from({ length: 26 }, (_, index) => ({
    label: String(2000 + index),
    value: String(2000 + index),
  }));

  const measureOptions = [
    { label: "Average", value: "avg" },
    { label: "Maximum", value: "max" },
  ];

  // Get unique states from rankings
  const stateOptions = useMemo(() => {
    const uniqueStates = [...new Set(rankings.map(r => r.state))].toSorted();
    return uniqueStates.map(state => ({ label: state, value: state }));
  }, [rankings]);

  const heatStressOptions = [
    { label: "None to Slight", value: "None to Slight" },
    { label: "Moderate", value: "Moderate" },
    { label: "Strong", value: "Strong" },
    { label: "Very Strong", value: "Very Strong" },
    { label: "Extreme", value: "Extreme" },
  ];

  // Filter and sort rankings
  const filteredAndSortedRankings = useMemo(() => {
    // First filter
    const filtered = rankings.filter(({ pet, state }) => {
      // State filter
      if (stateFilter && state !== stateFilter) {
        return false;
      }

      // Heat stress level filter
      if (heatStressFilter.length > 0) {
        const heatStressInfo = getHeatStressInfo(pet);
        if (!heatStressFilter.includes(heatStressInfo.level)) {
          return false;
        }
      }

      return true;
    });

    // Then sort
    return filtered.toSorted((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
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
        case "heat_stress": {
          const aLevel = getHeatStressInfo(a.pet).level;
          const bLevel = getHeatStressInfo(b.pet).level;
          comparison = aLevel.localeCompare(bLevel);
          break;
        }
        case "pet": {
          comparison = a.pet - b.pet;
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

  // Paginate the results
  const paginatedRankings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedRankings.slice(startIndex, endIndex);
  }, [filteredAndSortedRankings, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredAndSortedRankings.length / itemsPerPage);

  // Reset to page 1 when filters or sorting changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [stateFilter, heatStressFilter, sortColumn, sortDirection]);

  const handleYearChange = (value: null | string) => {
    if (value) {
      setSelectedYear(Number(value));
      router.push(`/rankings?year=${value}&measure=${selectedMeasure}`);
    }
  };

  const handleMeasureChange = (value: null | string) => {
    if (value) {
      setSelectedMeasure(value as "avg" | "max");
      router.push(`/rankings?year=${selectedYear}&measure=${value}`);
    }
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new column and default to ascending
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
            City Rankings by Heat Stress
          </h1>
          <p className="text-gray-600">
            Cities ranked by PET (Physiological Equivalent Temperature) values
            in descending order
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-4">
          <Select
            className="w-48"
            data={yearOptions}
            label="Year"
            onChange={handleYearChange}
            value={String(selectedYear)}
          />
          <Select
            className="w-48"
            data={measureOptions}
            label="Measure Type"
            onChange={handleMeasureChange}
            value={selectedMeasure}
          />
          <Select
            className="w-48"
            clearable
            data={stateOptions}
            label="State"
            onChange={setStateFilter}
            placeholder="All states"
            value={stateFilter}
          />
          <MultiSelect
            className="w-64"
            clearable
            data={heatStressOptions}
            label="Heat Stress Level"
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
                    onClick={() => handleSort("pet")}
                  >
                    <div className="flex items-center gap-1">
                      PET Value
                      {sortColumn === "pet" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    PET Range
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
                    onClick={() => handleSort("heat_stress")}
                  >
                    <div className="flex items-center gap-1">
                      Heat Stress Level
                      {sortColumn === "heat_stress" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {paginatedRankings.map(
                  ({
                    changeFrom2000,
                    city,
                    location_id,
                    p25,
                    p75,
                    pet,
                    rank,
                    state,
                  }) => {
                    const heatStressInfo = getHeatStressInfo(pet);
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
                            className={`font-semibold ${heatStressInfo.color}`}
                          >
                            {pet.toFixed(1)}
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
                              className={`font-semibold ${
                                changeFrom2000 > 0
                                  ? "text-red-600"
                                  : changeFrom2000 < 0
                                    ? "text-blue-600"
                                    : "text-gray-600"
                              }`}
                            >
                              {changeFrom2000 > 0 ? "+" : ""}
                              {changeFrom2000.toFixed(1)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${heatStressInfo.color}`}
                          >
                            {heatStressInfo.level}
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
