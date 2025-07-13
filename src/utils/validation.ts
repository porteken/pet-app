// Type definitions for validation
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

// Validation functions
export const validateLocation = (data: unknown): data is Location => {
  if (!data || typeof data !== "object") return false;
  const location = data as Record<string, unknown>;

  return (
    typeof location.location_id === "number" &&
    typeof location.lat === "number" &&
    typeof location.lng === "number" &&
    typeof location.city === "string" &&
    typeof location.state === "string" &&
    location.lat >= -90 &&
    location.lat <= 90 &&
    location.lng >= -180 &&
    location.lng <= 180 &&
    location.city.length > 0 &&
    location.city.length <= 100 &&
    location.state.length > 0 &&
    location.state.length <= 50
  );
};

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

export const validateGraphOption = (data: unknown): data is GraphOption => {
  if (!data || typeof data !== "object") return false;
  const option = data as Record<string, unknown>;

  return typeof option.key === "string" && typeof option.label === "string";
};

export const validateYear = (data: unknown): data is string => {
  if (typeof data !== "string") return false;
  return /^\d{4}$/.test(data);
};

export const validateTrendOption = (data: unknown): data is TrendOption => {
  return data === "avg" || data === "max";
};
