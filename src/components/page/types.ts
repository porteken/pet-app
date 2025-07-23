import { DropdownItemProps, DropdownSectionProps } from "@heroui/react";

import { LocationProperties } from "../../types/types";
export * from "../../types/types";
export interface PageProperties {
  id: number;
  location: LocationProperties;
  LocationOptions: Partial<DropdownSectionProps<DropdownItemProps>>[];
  CurrentPets: number[];
  CurrentDates: Date[];
  YearPets: number[];
  ReferencePets: number[];
  TrendlinePets: number[];
  Years: number[];
}
export interface PetTrendProperties {
  year_option?: string;
  reference_option?: string;
}
