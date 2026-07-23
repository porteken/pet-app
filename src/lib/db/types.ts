export type NumericLike = number | string;

export interface CityRankingsViewTable {
  avg_pet: NumericLike;
  avg_pet_avg: NumericLike;
  change_from_2000: NumericLike | null;
  change_from_2000_avg: NumericLike | null;
  city: string;
  future_lower: NumericLike | null;
  future_lower_avg: NumericLike | null;
  future_upper: NumericLike | null;
  future_upper_avg: NumericLike | null;
  location_id: number;
  max_pet: NumericLike | null;
  max_pet_avg: NumericLike | null;
  p10: NumericLike | null;
  p10_avg: NumericLike | null;
  p90: NumericLike | null;
  p90_avg: NumericLike | null;
  season?: string | null;
  state: string;
  year: number;
}

interface LocationsTable {
  city: string;
  id?: number | null;
  lat: NumericLike;
  lng: NumericLike;
  location_id?: number | null;
  state: string;
}

export interface PetForecastTable {
  location_id: number;
  lower: NumericLike;
  lower_avg: NumericLike | null;
  pet: NumericLike;
  pet_avg: NumericLike | null;
  season?: string | null;
  upper: NumericLike;
  upper_avg: NumericLike | null;
  year: number;
}

interface PetTable {
  date: Date | string;
  location_id: number;
  pet: NumericLike;
  pet_avg: NumericLike | null;
}

export interface PetYearStatsTable {
  avg_pet: NumericLike;
  avg_pet_avg: NumericLike;
  location_id: number;
  max_pet: NumericLike;
  max_pet_avg: NumericLike | null;
  p10: NumericLike | null;
  p10_avg: NumericLike | null;
  p90: NumericLike | null;
  p90_avg: NumericLike | null;
  season?: string | null;
  year: number;
}

export interface Database {
  city_rankings_view: CityRankingsViewTable;
  locations: LocationsTable;
  pet: PetTable;
  pet_forecast: PetForecastTable;
  pet_forecast_max: PetForecastTable;
  pet_year_stats: PetYearStatsTable;
}
