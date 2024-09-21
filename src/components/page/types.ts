import { LocationProps } from "../types";
import { DropdownItemProps, DropdownSectionProps } from "@nextui-org/react";
export * from "../types";
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
