export * from "../types";
import { DropdownItemProps, DropdownSectionProps } from "@heroui/react";

import { LocationProps } from "../types";
export interface MapProps {
  locations: LocationProps[];
  LocationOptions: Partial<DropdownSectionProps<DropdownItemProps>>[];
}
