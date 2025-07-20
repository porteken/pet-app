import { DropdownItemProps, DropdownSectionProps } from "@heroui/react";

import { LocationProps } from "../../types/types";
export * from "../../types/types";
export interface PageProps {
  id: number;
  location: LocationProps;
  LocationOptions: Partial<DropdownSectionProps<DropdownItemProps>>[];
  CurrentPets: number[];
  CurrentDates: Date[];
  YearPets: number[];
  ReferencePets: number[];
  TrendlinePets: number[];
  Years: number[];
}
export interface PetTrendProps {
  year_option?: string;
  reference_option?: string;
}
