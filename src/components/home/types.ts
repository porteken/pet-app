export * from "../types";
import { DropdownItemProps, DropdownSectionProps } from "@nextui-org/react";

import { LocationProps } from "../types";
export interface MapProps {
  locations: LocationProps[];
  LocationOptions: Partial<DropdownSectionProps<DropdownItemProps>>[];
}
