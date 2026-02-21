"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useMemo } from "react";

import { Select } from "@/components/ui/select";
import { APP_CONFIG } from "@/lib/constants";
import { NavProperties } from "@/types/types";

import { NavButtons } from "./header-bar/components";

interface LocationItem {
  key: number;
  state: string;
  title: string;
}

export const HeaderBar = ({
  id,
  LocationOptions,
}: NavProperties): React.ReactElement => {
  const router = useRouter();
  const searchParameters = useSearchParams();

  const buildUrl = (path: string, includeSearchParameters = true) => {
    const baseUrl = path;
    if (includeSearchParameters && searchParameters.toString() !== "") {
      return `${baseUrl}?${searchParameters.toString()}`;
    }

    return baseUrl;
  };

  const safeLocationOptions = Array.isArray(LocationOptions)
    ? LocationOptions
    : [];

  const groupedCities = useMemo(() => {
    const allCities = safeLocationOptions.flatMap(section =>
      [...(section.items || [])].map(
        item =>
          ({
            key: item.key,
            state: section.title,
            title: item.title,
          }) as LocationItem
      )
    );

    const grouped: Record<string, LocationItem[]> = {};
    for (const city of allCities) {
      if (!grouped[city.state]) {
        grouped[city.state] = [];
      }
      grouped[city.state].push(city);
    }

    const sortedStates = Object.keys(grouped).toSorted((a, b) =>
      a.localeCompare(b)
    );
    return sortedStates.map(state => ({
      group: state,
      items: grouped[state].toSorted((a, b) => a.title.localeCompare(b.title)),
    }));
  }, [safeLocationOptions]);

  const currentCity = useMemo(() => {
    if (!id) {
      return;
    }
    return groupedCities
      .flatMap(group => group.items)
      .find(city => city.key === id);
  }, [id, groupedCities]);

  const selectData = useMemo(() => {
    return groupedCities.map(group => ({
      group: group.group,
      items: group.items.map(city => ({
        key: `city-${city.key}`,
        label: `${city.title}, ${city.state}`,
        value: city.key.toString(),
      })),
      key: `group-${group.group}`,
    }));
  }, [groupedCities]);

  return (
    <header className="w-full border-b border-gray-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto max-w-4xl px-4">
        <div className="py-2 text-center">
          <h1 className="text-2xl font-extrabold dark:text-white">
            {APP_CONFIG.NAME}
          </h1>
        </div>
        <div className="rounded-md bg-white p-4">
          <div className="flex flex-wrap justify-center gap-3">
            <Select
              className="w-full sm:w-[300px]"
              data={selectData}
              data-testid="city-selector"
              onChange={value => {
                if (value) {
                  router.push(`/${value}`);
                }
              }}
              placeholder={id! >= 0 ? "Change City" : "Select City"}
              searchable
              value={currentCity?.key.toString()}
              w={300}
            />

            <NavButtons buildUrl={buildUrl} />
          </div>
        </div>
      </div>
    </header>
  );
};
