"use client";

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
      return () => {};
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

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [open, searchTerm]);

  React.useEffect(() => {
    if (!open) {
      return () => {};
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        event.target instanceof Node &&
        !wrapperReference.current?.contains(event.target)
      ) {
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
            `flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:hover:bg-input/50`,
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
              "size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </button>

        {clearable && hasValue && (
          <button
            className="absolute right-8 flex size-4 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:pointer-events-none"
            onClick={handleClearClick}
            type="button"
          >
            <XIcon className="size-3" />
            <span className="sr-only">Clear</span>
          </button>
        )}
      </div>

      {open && (
        <div
          className="absolute inset-x-0 top-full z-12000 mt-2 overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10"
          data-slot="select-content"
        >
          <div className="flex items-center border-b bg-popover px-3 py-2">
            <SearchIcon className="mr-2 size-4 shrink-0 opacity-50" />
            <input
              aria-label="Search cities"
              className="flex h-8 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search..."
              ref={searchInputReference}
              value={searchTerm}
            />
          </div>

          <div className="max-h-80 overflow-y-auto p-1" id={listboxId}>
            {filteredData.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No results found.
              </div>
            ) : (
              filteredData.map((group) => (
                <div className="scroll-my-1 p-1" key={group.key ?? group.group}>
                  <div
                    className="px-1.5 py-1 text-xs text-muted-foreground"
                    data-testid="searchable-select-group-label"
                  >
                    {group.group}
                  </div>

                  {group.items.map((item) => {
                    const selected = item.value === value;

                    return (
                      <button
                        aria-pressed={selected}
                        className={cn(
                          `relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground`,
                          selected && "bg-accent/60",
                        )}
                        data-testid="searchable-select-option"
                        data-value={item.value}
                        key={
                          item.key ??
                          `${group.key ?? group.group}-${item.value}`
                        }
                        onClick={handleOptionClick}
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
