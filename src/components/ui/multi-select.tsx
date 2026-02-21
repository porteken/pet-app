import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utilities";

interface MultiSelectOption {
  label: string;
  value: string;
}

interface MultiSelectProperties
  extends Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    "multiple" | "onChange" | "size" | "value"
  > {
  clearable?: boolean;
  data: MultiSelectOption[];
  label?: string;
  onChange?: (value: string[]) => void;
  placeholder?: string;
  value?: string[];
}

const MultiSelect = React.forwardRef<HTMLSelectElement, MultiSelectProperties>(
  (
    {
      className,
      clearable = false,
      data,
      disabled,
      id,
      label,
      onChange,
      placeholder,
      value = [],
      ...properties
    },
    reference
  ) => {
    const selectId = id ?? React.useId();

    return (
      <div className={cn("space-y-2", className)}>
        {(label || (clearable && value.length > 0)) && (
          <div className="flex items-center justify-between gap-2">
            {label ? (
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor={selectId}
              >
                {label}
              </label>
            ) : (
              <span />
            )}

            {clearable && value.length > 0 && (
              <Button
                className="h-auto px-0 py-0 text-xs"
                disabled={disabled}
                onClick={() => onChange?.([])}
                type="button"
                variant="link"
              >
                Clear
              </Button>
            )}
          </div>
        )}

        <select
          className={cn(
            "min-h-28 w-full rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-900 disabled:cursor-not-allowed disabled:opacity-50",
            "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
          )}
          disabled={disabled}
          id={selectId}
          multiple
          onChange={event => {
            const values = Array.from(event.target.selectedOptions, option => {
              return option.value;
            });
            onChange?.(values);
          }}
          ref={reference}
          value={value}
          {...properties}
        >
          {data.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <p className="text-xs text-gray-500">
          {value.length > 0
            ? `${value.length} selected`
            : (placeholder ?? "No filters selected")}
        </p>
      </div>
    );
  }
);

MultiSelect.displayName = "MultiSelect";

export { MultiSelect, type MultiSelectOption };
