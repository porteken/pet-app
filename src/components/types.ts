import { DropdownItemProps, DropdownSectionProps } from "@nextui-org/react";

export interface LocationProps {
  location_id: number;
  lat: number;
  lng: number;
  city: string;
  state: string;
}
export interface TrendGraphDataProps {
  years: number[];
  year_pets: number[];
  trendline_pets: number[];
}
export interface ReferenceGraphDataProps {
  dates: Date[];
  pets: number[];
}
interface AxisProps {
  title: string;
  tickformat?: string;
}
export interface LayoutProps {
  xaxis: AxisProps;
  yaxis: AxisProps;
  width?: number;
  height?: number;
  title: string;
}
export interface SelectOptionProps {
  key: any;
  label: any;
}
export interface NavProps {
  name?: string;
  LocationOptions: Partial<DropdownSectionProps<DropdownItemProps>>[];
  id?: number;
}

export interface FetchLocationProps {
  locations: LocationProps[];
  LocationOptions: Partial<DropdownSectionProps<DropdownItemProps>>[];
}
