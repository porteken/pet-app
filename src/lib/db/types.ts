export type NumericLike = number | string;

export interface CityRankingsViewTable {
  avg_pet: NumericLike;
  change_from_2000: NumericLike | null;
  city: string;
  future_lower: NumericLike | null;
  future_upper: NumericLike | null;
  location_id: number;
  max_pet: NumericLike | null;
  p10: NumericLike | null;
  p90: NumericLike | null;
  season?: string | null;
  state: string;
  year: number;
}

export interface LocationsTable {
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
  pet: NumericLike;
  season?: string | null;
  upper: NumericLike;
  year: number;
}

export interface PetTable {
  date: Date | string;
  location_id: number;
  pet: NumericLike;
}

export interface PetYearStatsTable {
  avg_pet: NumericLike;
  location_id: number;
  max_pet: NumericLike;
  p10: NumericLike | null;
  p90: NumericLike | null;
  season?: string | null;
  year: number;
}

export interface Database {
  city_rankings_view: CityRankingsViewTable;
  locations: LocationsTable;
  pet: PetTable;
  pet_forecast: PetForecastTable;
  pet_year_stats: PetYearStatsTable;
}
