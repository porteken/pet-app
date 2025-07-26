import { LocationOptionSection, LocationProperties } from "@/types/types";

export interface MapProperties {
  initialGraphMeasure: string;
  LocationOptions: LocationOptionSection[];
  locations: LocationProperties[];
}
