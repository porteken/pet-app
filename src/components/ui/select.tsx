import * as React from "react";

import { cn } from "@/lib/utilities";

type SelectData = SelectGroup[] | SelectOption[];

interface SelectGroup {
  group: string;
  items: SelectOption[];
}

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProperties
  extends Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    "onChange" | "size" | "value"
  > {
  data: SelectData;
  label?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  size?: "default" | "lg" | "sm";
  value?: string;
  w?: number | string;
}

const getSizeClass = (size: SelectProperties["size"]) => {
  if (size === "sm") {
    return "h-9 px-3 text-sm";
  }

  if (size === "lg") {
    return "h-11 px-4 text-base";
  }

  return "h-10 px-3 text-sm";
};

const isGroupedData = (data: SelectData): data is SelectGroup[] => {
  const firstItem = data.at(0);
  return Boolean(firstItem && "items" in firstItem);
};

const Select = React.forwardRef<HTMLSelectElement, SelectProperties>(
  (
    {
      className,
      data,
      disabled,
      id,
      label,
      onChange,
      placeholder,
      searchable,
      size,
      value,
      w,
      ...properties
    },
    reference
  ) => {
    const selectId = id ?? React.useId();
    const [searchTerm, setSearchTerm] = React.useState("");
    const groupedData = isGroupedData(data);
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filteredGroupedData = React.useMemo(() => {
      if (!groupedData) {
        return [];
      }

      if (normalizedSearch === "") {
        return data;
      }

      return data
        .map(group => ({
          ...group,
          items: group.items.filter(option =>
            option.label.toLowerCase().includes(normalizedSearch)
          ),
        }))
        .filter(group => group.items.length > 0);
    }, [data, groupedData, normalizedSearch]);

    const filteredUngroupedData = React.useMemo(() => {
      if (groupedData) {
        return [];
      }

      if (normalizedSearch === "") {
        return data;
      }

      return data.filter(option =>
        option.label.toLowerCase().includes(normalizedSearch)
      );
    }, [data, groupedData, normalizedSearch]);

    return (
      <div className={cn("space-y-2", className)} style={{ width: w }}>
        {label && (
          <label
            className="text-sm font-medium text-gray-700"
            htmlFor={selectId}
          >
            {label}
          </label>
        )}

        {searchable && (
          <input
            className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            onChange={event => setSearchTerm(event.target.value)}
            placeholder={`Search ${label?.toLowerCase() ?? "options"}...`}
            type="search"
            value={searchTerm}
          />
        )}

        <select
          className={cn(
            "w-full rounded-md border border-gray-300 bg-white text-gray-900 disabled:cursor-not-allowed disabled:opacity-50",
            "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none",
            getSizeClass(size)
          )}
          data-placeholder={placeholder}
          data-searchable={searchable ? "true" : "false"}
          disabled={disabled}
          id={selectId}
          onChange={event => {
            onChange?.(event.target.value);
          }}
          ref={reference}
          value={value ?? ""}
          {...properties}
        >
          {placeholder && <option value="">{placeholder}</option>}

          {groupedData
            ? filteredGroupedData.map(group => (
                <optgroup key={group.group} label={group.group}>
                  {group.items.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              ))
            : filteredUngroupedData.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
          {filteredGroupedData.length + filteredUngroupedData.length === 0 && (
            <option disabled value="">
              No results found
            </option>
          )}
        </select>
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select, type SelectGroup, type SelectOption };
