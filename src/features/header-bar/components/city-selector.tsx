"use client";

/* eslint-disable jsx-a11y/prefer-tag-over-role */
/* oxlint-disable jsx-a11y/prefer-tag-over-role */

import { cn } from "@/lib/utils";
import { ChevronDownIcon, SearchIcon, XIcon } from "lucide-react";
import * as React from "react";

interface CitySelectorItem {
  key?: string;
  label: string;
  value: string;
}

interface CitySelectorGroup {
  group: string;
  items: CitySelectorItem[];
  key?: string;
}

interface CitySelectorProps {
  className?: string;
  clearable?: boolean;
  data: CitySelectorGroup[];
  onChange?: (value: string | null) => void;
  onClear?: () => void;
  placeholder?: string;
  value?: string;
  "data-testid"?: string;
}

const isPrintableKey = (event: React.KeyboardEvent<HTMLButtonElement>) =>
  event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey;

export function CitySelector({
  className,
  clearable,
  data,
  onChange,
  onClear,
  placeholder,
  value,
  "data-testid": testId,
}: Readonly<CitySelectorProps>): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const wrapperReference = React.useRef<HTMLDivElement>(null);
  const triggerReference = React.useRef<HTMLButtonElement>(null);
  const searchInputReference = React.useRef<HTMLInputElement>(null);
  const listboxId = React.useId();

  const selectedOption = React.useMemo(
    () =>
      data.flatMap((group) => group.items).find((item) => item.value === value),
    [data, value],
  );

  const filteredData = React.useMemo(() => {
    if (!searchTerm) {
      return data;
    }

    const lowerSearch = searchTerm.toLowerCase();
    const groups: CitySelectorGroup[] = [];

    for (const group of data) {
      const groupMatches = group.group.toLowerCase().includes(lowerSearch);
      const filteredItems = groupMatches
        ? group.items
        : group.items.filter((item) =>
            item.label.toLowerCase().includes(lowerSearch),
          );

      if (filteredItems.length > 0) {
        groups.push({ ...group, items: filteredItems });
      }
    }

    return groups;
  }, [data, searchTerm]);

  const closeMenu = React.useCallback((restoreFocus = false) => {
    setOpen(false);
    setSearchTerm("");

    if (restoreFocus) {
      requestAnimationFrame(() => {
        triggerReference.current?.focus();
      });
    }
  }, []);

  const openMenu = React.useCallback((initialSearch = "") => {
    setOpen(true);
    setSearchTerm(initialSearch);
  }, []);

  React.useEffect(() => {
    if (!open) {
      return undefined;
    }

    const animationFrame = requestAnimationFrame(() => {
      const searchInput = searchInputReference.current;

      if (!searchInput) {
        return;
      }

      searchInput.focus();

      const caretPosition = searchInput.value.length;
      searchInput.setSelectionRange(caretPosition, caretPosition);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [open, searchTerm]);

  React.useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!(event.target instanceof Node)) {
        return;
      }

      if (!wrapperReference.current?.contains(event.target)) {
        closeMenu();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu, open]);

  const handleTriggerKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (isPrintableKey(event)) {
        event.preventDefault();
        openMenu(event.key);
        return;
      }

      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        openMenu();
      }
    },
    [openMenu],
  );

  const hasValue = value !== undefined && value !== null && value !== "";

  const handleSelect = React.useCallback(
    (newValue: string) => {
      setOpen(false);
      setSearchTerm("");
      onChange?.(newValue);
    },
    [onChange],
  );

  const handleTriggerClick = React.useCallback(() => {
    if (open) {
      closeMenu();
      return;
    }

    openMenu();
  }, [closeMenu, open, openMenu]);

  const handleClearClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      closeMenu();
      onClear?.();
    },
    [closeMenu, onClear],
  );

  const handleSearchChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    },
    [],
  );

  const handleSearchKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
        return;
      }

      event.stopPropagation();
    },
    [closeMenu],
  );

  const handleOptionClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const { value: nextValue } = event.currentTarget.dataset;

      if (nextValue) {
        handleSelect(nextValue);
      }
    },
    [handleSelect],
  );

  return (
    <div className={cn("relative w-full", className)} ref={wrapperReference}>
      <div className="relative flex items-center gap-2">
        <button
          aria-controls={open ? listboxId : undefined}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={cn(
            "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:hover:bg-input/50",
            !selectedOption && "text-muted-foreground",
          )}
          data-placeholder={placeholder}
          data-testid={testId}
          onClick={handleTriggerClick}
          onKeyDown={handleTriggerKeyDown}
          ref={triggerReference}
          type="button"
        >
          <span className="line-clamp-1 flex items-center gap-1.5">
            {selectedOption?.label ?? placeholder}
          </span>
          <ChevronDownIcon
            className={cn(
              "text-muted-foreground size-4 shrink-0 transition-transform",
              open && "rotate-180",
            )}
          />
        </button>

        {clearable && hasValue && (
          <button
            className="text-muted-foreground hover:text-foreground focus:ring-ring absolute right-8 flex size-4 items-center justify-center rounded-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none"
            onClick={handleClearClick}
            type="button"
          >
            <XIcon className="size-3" />
            <span className="sr-only">Clear</span>
          </button>
        )}
      </div>

      {open && (
        <div className="bg-popover text-popover-foreground ring-foreground/10 absolute inset-x-0 top-full z-12000 mt-2 overflow-hidden rounded-lg shadow-md ring-1">
          <div className="bg-popover flex items-center border-b px-3 py-2">
            <SearchIcon className="mr-2 size-4 shrink-0 opacity-50" />
            <input
              className="placeholder:text-muted-foreground flex h-8 w-full rounded-md bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search..."
              ref={searchInputReference}
              value={searchTerm}
            />
          </div>

          <div className="max-h-80 overflow-y-auto p-1" id={listboxId}>
            {filteredData.length === 0 ? (
              <div className="text-muted-foreground py-6 text-center text-sm">
                No results found.
              </div>
            ) : (
              filteredData.map((group, groupIndex) => (
                <div
                  className="scroll-my-1 p-1"
                  key={group.key ?? `group-${groupIndex}`}
                >
                  <div className="text-muted-foreground px-1.5 py-1 text-xs">
                    {group.group}
                  </div>

                  {group.items.map((item, itemIndex) => {
                    const selected = item.value === value;

                    return (
                      <button
                        aria-selected={selected}
                        className={cn(
                          "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                          selected && "bg-accent/60",
                        )}
                        data-value={item.value}
                        key={
                          item.key ?? `${group.key ?? group.group}-${itemIndex}`
                        }
                        onClick={handleOptionClick}
                        role="option"
                        type="button"
                      >
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
