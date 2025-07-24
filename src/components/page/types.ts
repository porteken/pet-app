import { LocationOptionSection, LocationProperties } from "../../types/types";
export * from "../../types/types";
export interface PageProperties {
  CurrentDates: Date[];
  CurrentPets: number[];
  id: number;
  location: LocationProperties;
  LocationOptions: LocationOptionSection[];
  ReferencePets: number[];
  TrendlinePets: number[];
  YearPets: number[];
  Years: number[];
}
export interface PetTrendProperties {
  reference_option?: string;
  year_option?: string;
}
