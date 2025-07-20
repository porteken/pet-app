export * from "../../types/types";
import { DropdownItemProps, DropdownSectionProps } from "@heroui/react";
export interface AboutProps {
  LocationOptions: Partial<DropdownSectionProps<DropdownItemProps>>[];
}
