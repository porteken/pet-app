import type { GraphSeason } from "@/lib/constants";
import type { ForecastGraphData } from "@/lib/utils/trend-analysis";
import type { LocationOptionSection, LocationProperties } from "@/types/types";

export interface PageProperties {
  CurrentDates: Date[];
  CurrentPets: number[];
  graphDataError: boolean;
  IncreasePerYear: number;
  id: number;
  initialForecastData?: ForecastGraphData;
  initialForecastEnabled: boolean;
  initialForecastYearsAhead: number;
  initialGraphMeasure: string;
  initialGraphSeason: GraphSeason;
  initialReferenceYear: string;
  location: LocationProperties;
  LocationOptions: LocationOptionSection[];
  ReferencePets: number[];
  TrendlinePets: number[];
  YearPets: number[];
  Years: number[];
}
