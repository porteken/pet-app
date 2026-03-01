import { LocationOptionSection, LocationProperties } from "@/types/types";

export interface PageProperties {
  CurrentDates: Date[];
  CurrentPets: number[];
  id: number;
  initialForecastEnabled: boolean;
  initialForecastYearsAhead: number;
  initialGraphMeasure: string;
  location: LocationProperties;
  LocationOptions: LocationOptionSection[];
  ReferencePets: number[];
  TrendlinePets: number[];
  YearPets: number[];
  Years: number[];
}
