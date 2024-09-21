export * from "../types";
import { DropdownItemProps, DropdownSectionProps } from "@nextui-org/react";
export interface AboutProps {
  LocationOptions: Partial<DropdownSectionProps<DropdownItemProps>>[];
}
