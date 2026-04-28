"use client";

import { ThemeToggle } from "@/components/app/theme-toggle";
import { Select } from "@/components/ui/select";
import { APP_CONFIG } from "@/lib/constants";
import { NavProperties } from "@/types/types";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useMemo } from "react";

import { NavButtons } from "./nav-buttons";

interface LocationItem {
  key: number;
  state: string;
  title: string;
}

const HeaderBarComponent = ({
  id,
  LocationOptions,
}: NavProperties): React.ReactElement => {
  const router = useRouter();
  const searchParameters = useSearchParams();

  const buildUrl = useCallback(
    (path: string, includeSearchParameters = true) => {
      const baseUrl = path;
      if (includeSearchParameters && searchParameters.toString() !== "") {
        return `${baseUrl}?${searchParameters.toString()}`;
      }

      return baseUrl;
    },
    [searchParameters],
  );

  const handleCityChange = useCallback(
    (value: string | null) => {
      if (value) {
        router.push(`/${value}`);
      }
    },
    [router],
  );

  const handleClear = useCallback(() => {
    router.push(buildUrl("/", true));
  }, [router, buildUrl]);

  const groupedCities = useMemo(() => {
    const options = Array.isArray(LocationOptions) ? LocationOptions : [];

    const allCities = options.flatMap((section) =>
      [...(section.items || [])].map(
        (item) =>
          ({
            key: item.key,
            state: section.title,
            title: item.title,
          }) as LocationItem,
      ),
    );

    const grouped: Record<string, LocationItem[]> = {};
    for (const city of allCities) {
      if (!grouped[city.state]) {
        grouped[city.state] = [];
      }
      grouped[city.state].push(city);
    }

    const sortedStates = Object.keys(grouped).toSorted((a, b) =>
      a.localeCompare(b),
    );
    return sortedStates.map((state) => ({
      group: state,
      items: grouped[state].toSorted((a, b) => a.title.localeCompare(b.title)),
    }));
  }, [LocationOptions]);

  const currentCity = useMemo(() => {
    if (!id) {
      return;
    }
    return groupedCities
      .flatMap((group) => group.items)
      .find((city) => city.key === id);
  }, [id, groupedCities]);

  const selectData = useMemo(() => {
    return groupedCities.map((group) => ({
      group: group.group,
      items: group.items.map((city) => ({
        key: `city-${city.key}`,
        label: city.title,
        value: city.key.toString(),
      })),
      key: `group-${group.group}`,
    }));
  }, [groupedCities]);

  return (
    <header className="border-border/70 bg-background/80 sticky top-0 z-20 w-full border-b backdrop-blur-xl">
      <div className="via-primary/60 absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="text-primary text-xs font-semibold tracking-[0.24em] uppercase">
                Physiological Equivalent Temperature
              </p>
              <div>
                <h1 className="brand-gradient-text text-2xl font-black tracking-tight">
                  {APP_CONFIG.NAME}
                </h1>
                <p className="text-muted-foreground max-w-2xl text-sm">
                  {APP_CONFIG.TAGLINE}
                </p>
              </div>
            </div>
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
          </div>

          <div className="glass-panel-muted rounded-3xl p-3 sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <Select
                className="w-full lg:max-w-xl"
                clearable
                data={selectData}
                data-testid="city-selector"
                onChange={handleCityChange}
                onClear={handleClear}
                placeholder={
                  id !== undefined && id >= 0 ? "Change City" : "Select City"
                }
                searchable
                value={currentCity?.key.toString()}
              />

              <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-start">
                <NavButtons buildUrl={buildUrl} />
                <div className="sm:hidden">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

HeaderBarComponent.displayName = "HeaderBar";

export const HeaderBar = React.memo(HeaderBarComponent);
