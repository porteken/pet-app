"use client";

import { Button, Group, Paper, Select } from "@mantine/core";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useMemo } from "react";

import { APP_CONFIG } from "@/lib/utils/constants";
import { NavProperties } from "@/types/types";

interface LocationItem {
  key: number;
  state: string;
  title: string;
}

export const HeaderBar = ({
  id,
  LocationOptions,
}: NavProperties): React.ReactElement => {
  const searchParameters = useSearchParams();

  const buildUrl = (path: string, includeSearchParameters = true) => {
    const baseUrl = path;
    if (includeSearchParameters && searchParameters.toString() !== "") {
      return `${baseUrl}?${searchParameters.toString()}`;
    }

    return baseUrl;
  };

  // Ensure LocationOptions is an array and has the expected structure
  const safeLocationOptions = Array.isArray(LocationOptions)
    ? LocationOptions
    : [];

  // Create grouped and sorted data for the select
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

    // Group cities by state and sort alphabetically
    const grouped: Record<string, LocationItem[]> = {};
    for (const city of allCities) {
      if (!grouped[city.state]) {
        grouped[city.state] = [];
      }
      grouped[city.state].push(city);
    }

    // Sort states alphabetically and cities within each state
    const sortedStates = Object.keys(grouped).sort((a, b) =>
      a.localeCompare(b)
    );
    const sortedGrouped = sortedStates.map(state => ({
      group: state,
      items: grouped[state].toSorted((a, b) => a.title.localeCompare(b.title)),
    }));

    return sortedGrouped;
  }, [safeLocationOptions]);

  const currentCity = useMemo(() => {
    if (!id) {
      return;
    }
    return groupedCities
      .flatMap(group => group.items)
      .find(city => city.key === id);
  }, [id, groupedCities]);

  // Create data for Select with grouping
  const selectData = useMemo(() => {
    return groupedCities.map(group => ({
      group: group.group,
      items: group.items.map(city => ({
        key: `city-${city.key}`, // Add key prop to resolve warning
        label: `${city.title}, ${city.state}`,
        value: city.key.toString(),
      })),
      key: `group-${group.group}`, // Add key prop to group
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
        <Paper className="bg-white shadow-none" p="md">
          <Group className="hidden justify-center gap-4 sm:flex">
            <Button
              aria-label="Navigate to map view"
              component={Link}
              href={buildUrl("/")}
              variant="subtle"
            >
              Map
            </Button>

            <Select
              data={selectData}
              onChange={value => {
                if (value) {
                  globalThis.location.href = `/${value}`;
                }
              }}
              placeholder={id! >= 0 ? "Change City" : "Select City"}
              searchable
              styles={{
                dropdown: {
                  backgroundColor: "white",
                  borderRadius: "4px",
                },
              }}
              value={currentCity?.key.toString()}
              w={300}
            />

            <Button
              aria-label="Navigate to about page"
              component={Link}
              href="/about"
              variant="subtle"
            >
              About
            </Button>

            <Button
              aria-label="View source code on GitHub"
              component="a"
              href={APP_CONFIG.GITHUB_URL}
              rel="noopener noreferrer"
              target="_blank"
              variant="subtle"
            >
              Github Repository
            </Button>
          </Group>
        </Paper>
      </div>
    </header>
  );
};
