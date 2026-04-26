import { DEFAULT_GRAPH_SEASON, type GraphSeason } from "@/lib/constants";
import { SimpleLinearRegression } from "@/lib/utils/simple-linear-regression";
import {
  validateDates,
  validatePets,
  validateYearPets,
  validateYears,
} from "@/lib/utils/validation";
import type {
  ReferenceGraphDataProperties,
  TrendGraphDataProperties,
} from "@/types/types";

interface ReferenceGraphRow {
  date: string;
  pet: number;
}

const SEASON_MONTHS: Record<Exclude<GraphSeason, "Annual">, number[]> = {
  Fall: [9, 10, 11],
  Spring: [3, 4, 5],
  Summer: [6, 7, 8],
  Winter: [12, 1, 2],
};

export const filterReferenceRowsBySeason = <TRow extends ReferenceGraphRow>(
  rows: TRow[],
  season: GraphSeason = DEFAULT_GRAPH_SEASON,
): TRow[] => {
  if (season === DEFAULT_GRAPH_SEASON) {
    return rows;
  }

  const allowedMonths = SEASON_MONTHS[season];

  return rows.filter(({ date }) => {
    const month = Number(date.slice(5, 7));
    return allowedMonths.includes(month);
  });
};

interface TrendGraphRow {
  pet: number;
  year: number;
}

export const mapReferenceRowsToGraphData = (
  rows: ReferenceGraphRow[],
): ReferenceGraphDataProperties => {
  const dates = rows.map(({ date }) => new Date(date));
  const pets = rows.map(({ pet }) => Number(pet));

  validateDates(dates);
  validatePets(pets);

  return { dates, pets };
};

export const mapTrendRowsToGraphData = (
  rows: TrendGraphRow[],
): TrendGraphDataProperties => {
  const years = rows.map(({ year }) => year);
  const year_pets = rows.map(({ pet }) => Number(pet));

  if (years.length === 0 || year_pets.length === 0) {
    return {
      increase_per_year: 0,
      trendline_pets: [],
      year_pets: [],
      years: [],
    };
  }

  validateYears(years);
  validateYearPets(year_pets);

  const regression = new SimpleLinearRegression(years, year_pets);

  return {
    increase_per_year: regression.slope,
    trendline_pets: years.map((year) => regression.predict(year)),
    year_pets,
    years,
  };
};
