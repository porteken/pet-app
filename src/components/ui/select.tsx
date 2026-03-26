import * as React from "react";

import { cn } from "@/lib/utilities";

interface SearchableOptionButtonProperties {
  onSelect: (value: string) => void;
  option: SelectOption;
}

type SelectData = SelectGroup[] | SelectOption[];

interface SelectGroup {
  group: string;
  items: SelectOption[];
}

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProperties extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "onChange" | "size" | "value"
> {
  clearable?: boolean;
  data: SelectData;
  label?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
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

const preventInputBlur = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
};

const SearchableOptionButton = ({ onSelect, option }: SearchableOptionButtonProperties) => {
  const handleClick = () => {
    onSelect(option.value);
  };

  return (
    <button
      className="block w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-100"
      data-testid="searchable-select-option"
      data-value={option.value}
      onClick={handleClick}
      onMouseDown={preventInputBlur}
      type="button"
    >
      {option.label}
    </button>
  );
};

const Select = React.forwardRef<HTMLSelectElement, SelectProperties>(
  (
    {
      className,
      clearable,
      data,
      disabled,
      id,
      label,
      onChange,
      onClear,
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
    const searchableContainerReference = React.useRef<HTMLDivElement>(null);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const groupedData = isGroupedData(data);
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const selectedOption = React.useMemo(() => {
      if (!value) {
        return;
      }

      if (groupedData) {
        for (const group of data) {
          const option = group.items.find((item) => item.value === value);
          if (option) {
            return { ...option, group: group.group };
          }
        }
        return;
      }

      return data.find((option) => option.value === value);
    }, [data, groupedData, value]);

    const filteredGroupedData = React.useMemo(() => {
      if (!groupedData) {
        return [];
      }

      if (normalizedSearch === "") {
        return data;
      }

      return data
        .map((group) => ({
          ...group,
          items: group.group.toLowerCase().includes(normalizedSearch)
            ? group.items
            : group.items.filter((option) => option.label.toLowerCase().includes(normalizedSearch)),
        }))
        .filter((group) => group.items.length > 0);
    }, [data, groupedData, normalizedSearch]);

    const filteredUngroupedData = React.useMemo(() => {
      if (groupedData) {
        return [];
      }

      if (normalizedSearch === "") {
        return data;
      }

      return data.filter((option) => option.label.toLowerCase().includes(normalizedSearch));
    }, [data, groupedData, normalizedSearch]);

    const showClearButton = clearable && value && value !== "";
    const hasSearchResults = filteredGroupedData.length + filteredUngroupedData.length > 0;

    React.useEffect(() => {
      if (!searchable || !isDropdownOpen) {
        return;
      }

      const handleOutsideClick = (event: MouseEvent) => {
        const target = event.target;
        if (
          searchableContainerReference.current &&
          target instanceof Node &&
          !searchableContainerReference.current.contains(target)
        ) {
          setIsDropdownOpen(false);
          setSearchTerm("");
        }
      };

      document.addEventListener("mousedown", handleOutsideClick);
      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
      };
    }, [isDropdownOpen, searchable]);

    const handleSearchableOptionSelection = (nextValue: string) => {
      onChange?.(nextValue);
      setSearchTerm("");
      setIsDropdownOpen(false);
    };

    let searchableOptionsContent: React.ReactNode;
    if (!hasSearchResults) {
      searchableOptionsContent = (
        <div className="px-3 py-2 text-sm text-gray-500">No results found</div>
      );
    } else if (groupedData) {
      searchableOptionsContent = filteredGroupedData.map((group) => (
        <div key={group.group}>
          <div
            className="px-3 py-1 text-xs font-semibold tracking-wide text-gray-500 uppercase"
            data-testid="searchable-select-group-label"
          >
            {group.group}
          </div>
          {group.items.map((option) => (
            <SearchableOptionButton
              key={option.value}
              onSelect={handleSearchableOptionSelection}
              option={option}
            />
          ))}
        </div>
      ));
    } else {
      searchableOptionsContent = filteredUngroupedData.map((option) => (
        <SearchableOptionButton
          key={option.value}
          onSelect={handleSearchableOptionSelection}
          option={option}
        />
      ));
    }

    return (
      <div className={cn("space-y-2", className)} style={{ width: w }}>
        {label && (
          <label className="text-sm font-medium text-gray-700" htmlFor={selectId}>
            {label}
          </label>
        )}

        {searchable ? (
          <div className="relative" ref={searchableContainerReference}>
            <input
              autoComplete="off"
              className={cn(
                "w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder:text-gray-500",
                "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none",
                getSizeClass(size),
                showClearButton && "pr-8"
              )}
              data-placeholder={placeholder}
              data-searchable="true"
              disabled={disabled}
              id={selectId}
              onChange={(event) => {
                if (!isDropdownOpen) {
                  setIsDropdownOpen(true);
                }
                setSearchTerm(event.target.value);
              }}
              onFocus={() => {
                setSearchTerm("");
                setIsDropdownOpen(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setIsDropdownOpen(false);
                  setSearchTerm("");
                }
              }}
              placeholder={placeholder ?? `Search ${label?.toLowerCase() ?? "options"}...`}
              type="text"
              value={isDropdownOpen ? searchTerm : (selectedOption?.label ?? "")}
              {...(properties as unknown as React.InputHTMLAttributes<HTMLInputElement>)}
            />

            {showClearButton && (
              <button
                aria-label="Clear selection"
                className="absolute top-1/2 right-2 z-30 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600"
                disabled={disabled}
                onClick={(event_) => {
                  event_.preventDefault();
                  event_.stopPropagation();
                  setSearchTerm("");
                  setIsDropdownOpen(false);
                  onClear?.();
                }}
                type="button"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}

            {isDropdownOpen && (
              <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                {searchableOptionsContent}
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            <select
              className={cn(
                "w-full rounded-md border border-gray-300 bg-white text-gray-900 disabled:cursor-not-allowed disabled:opacity-50",
                "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none",
                getSizeClass(size),
                showClearButton && "pr-8"
              )}
              data-placeholder={placeholder}
              data-searchable={searchable ? "true" : "false"}
              disabled={disabled}
              id={selectId}
              onChange={(event) => {
                onChange?.(event.target.value);
              }}
              ref={reference}
              value={value ?? ""}
              {...properties}
            >
              {placeholder && <option value="">{placeholder}</option>}

              {groupedData
                ? filteredGroupedData.map((group) => (
                    <optgroup key={group.group} label={group.group}>
                      {group.items.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </optgroup>
                  ))
                : filteredUngroupedData.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              {!hasSearchResults && (
                <option disabled value="">
                  No results found
                </option>
              )}
            </select>
            {showClearButton && (
              <button
                aria-label="Clear selection"
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600"
                disabled={disabled}
                onClick={(event_) => {
                  event_.preventDefault();
                  event_.stopPropagation();
                  onClear?.();
                }}
                type="button"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
