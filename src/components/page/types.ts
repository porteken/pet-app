import { SelectSectionProps, SelectItemProps } from "@nextui-org/select";
import { LocationProps } from "../types";
export * from "../types";
export interface PageProps {
  id: number;
  location: LocationProps;
  LocationOptions: Partial<SelectSectionProps<SelectItemProps>>[];
  CurrentPets: number[];
  CurrentDates: Date[];
}
export interface PetTrendProps {
  year_option?: string;
  reference_option?: string;
}
