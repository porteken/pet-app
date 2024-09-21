import { SelectOptionProps } from "./types";

export const GraphOptions: SelectOptionProps[] = [
  { key: "avg", label: "Average" },
  { key: "max", label: "Max" },
];

export const YearOptions = (): SelectOptionProps[] => {
  return Array.from({ length: 2024 - 2000 }, (_, i) => {
    const year = (2000 + i).toString();
    return { key: year, label: year };
  });
};
