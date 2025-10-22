export interface FetchLocationProperties {
  LocationOptions: LocationOptionSection[];
  locations: LocationProperties[];
}

export interface ForecastData {
  forecastValues: number[];
  forecastYears: number[];
  lowerBound: number[];
  upperBound: number[];
}

export interface ForecastSettings {
  enabled: boolean;
  yearsAhead: number;
}

export interface LocationOptionSection {
  items: LocationOptionItem[];
  title: string;
}

export interface LocationProperties {
  city: string;
  lat: number;
  lng: number;
  location_id: number;
  state: string;
}

export interface NavProperties {
  id?: number;
  LocationOptions: LocationOptionSection[];
  name?: string;
}

export interface ReferenceGraphDataProperties {
  dates: Date[];
  pets: number[];
}

export interface SelectOptionProperties {
  key: string;
  label: string;
}

export interface TrendGraphDataProperties {
  increase_per_year: number;
  trendline_pets: number[];
  year_pets: number[];
  years: number[];
}

interface LocationOptionItem {
  key: number;
  title: string;
}
