export * from "../../types/types";
import { DropdownItemProps, DropdownSectionProps } from "@heroui/react";

import { LocationProperties } from "../../types/types";
export interface MapProperties {
  locations: LocationProperties[];
  LocationOptions: Partial<DropdownSectionProps<DropdownItemProps>>[];
}
