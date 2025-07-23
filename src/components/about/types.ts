export * from "../../types/types";
import { DropdownItemProps, DropdownSectionProps } from "@heroui/react";
export interface AboutProperties {
  LocationOptions: Partial<DropdownSectionProps<DropdownItemProps>>[];
}
