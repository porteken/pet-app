export interface FetchLocationProperties {
  LocationOptions: LocationOptionSection[];
  locations: LocationProperties[];
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
  trendline_pets: number[];
  year_pets: number[];
  years: number[];
}

interface LocationOptionItem {
  key: number;
  title: string;
}
