import { LocationOptionSection, LocationProperties } from "@/types/types";

export interface MapProperties {
  initialForecastEnabled: boolean;
  initialForecastYearsAhead: number;
  initialGraphMeasure: string;
  LocationOptions: LocationOptionSection[];
  locations: LocationProperties[];
}
