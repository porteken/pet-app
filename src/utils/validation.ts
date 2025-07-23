export interface Location {
  location_id: number;
  lat: number;
  lng: number;
  city: string;
  state: string;
}

export interface TrendGraphData {
  years: number[];
  year_pets: number[];
  trendline_pets: number[];
}

export interface ReferenceGraphData {
  dates: Date[];
  pets: number[];
}

export interface GraphOption {
  key: string;
  label: string;
}

export type TrendOption = "avg" | "max";

export const validateTrendGraphData = (
  data: unknown
): data is TrendGraphData => {
  if (!data || typeof data !== "object") return false;
  const graphData = data as Record<string, unknown>;

  return (
    Array.isArray(graphData.years) &&
    Array.isArray(graphData.year_pets) &&
    Array.isArray(graphData.trendline_pets) &&
    graphData.years.every(
      (year: unknown) =>
        typeof year === "number" && year >= 1900 && year <= 2100
    ) &&
    graphData.year_pets.every(
      (pet: unknown) => typeof pet === "number" && pet >= 0
    ) &&
    graphData.trendline_pets.every((pet: unknown) => typeof pet === "number")
  );
};

export const validateReferenceGraphData = (
  data: unknown
): data is ReferenceGraphData => {
  if (!data || typeof data !== "object") return false;
  const graphData = data as Record<string, unknown>;

  return (
    Array.isArray(graphData.dates) &&
    Array.isArray(graphData.pets) &&
    graphData.dates.every((date: unknown) => date instanceof Date) &&
    graphData.pets.every((pet: unknown) => typeof pet === "number" && pet >= 0)
  );
};

export const validateYear = (data: unknown): data is string => {
  if (typeof data !== "string") return false;

  return /^\d{4}$/.test(data);
};

export const validateTrendOption = (data: unknown): data is TrendOption => {
  return data === "avg" || data === "max";
};
