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
