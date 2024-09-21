export interface LocationProps {
  location_id: number;
  lat: number;
  lng: number;
  city: string;
  state: string;
}
export interface TrendGraphDataProps {
  type: string;
  years: number[];
  pets: number[];
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
interface CityProps {
  key: number;
  title: string;
}
