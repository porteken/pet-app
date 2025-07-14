export * from "../types";
import { DropdownItemProps, DropdownSectionProps } from "@heroui/react";
export interface AboutProps {
  LocationOptions: Partial<DropdownSectionProps<DropdownItemProps>>[];
}
