import { DropdownItemProps, DropdownSectionProps } from "@heroui/react";

export interface LocationProperties {
  location_id: number;
  lat: number;
  lng: number;
  city: string;
  state: string;
}
export interface TrendGraphDataProperties {
  years: number[];
  year_pets: number[];
  trendline_pets: number[];
}
export interface ReferenceGraphDataProperties {
  dates: Date[];
  pets: number[];
}
interface AxisProperties {
  title: string;
  tickformat?: string;
  gridcolor?: string;
  zeroline?: boolean;
}
export interface LayoutProperties {
  xaxis: AxisProperties;
  yaxis: AxisProperties;
  width?: number;
  height?: number;
  title: string;
  plot_bgcolor?: string;
  paper_bgcolor?: string;
  font?: {
    color: string;
  };
  margin?: {
    l: number;
    r: number;
    t: number;
    b: number;
  };
}
export interface SelectOptionProperties {
  key: string;
  label: string;
}
export interface NavProperties {
  name?: string;
  LocationOptions: Partial<DropdownSectionProps<DropdownItemProps>>[];
  id?: number;
}

export interface FetchLocationProperties {
  locations: LocationProperties[];
  LocationOptions: Partial<DropdownSectionProps<DropdownItemProps>>[];
}
