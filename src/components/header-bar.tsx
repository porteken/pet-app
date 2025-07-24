"use client";

import AppBar from "@mui/material/AppBar";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";

import { APP_CONFIG } from "@/utils/constants";

import { NavProperties } from "../types/types";

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

  const allCities = LocationOptions.flatMap(section =>
    [...(section.items || [])].map(
      item =>
        ({
          key: item.key,
          state: section.title,
          title: item.title,
        }) as LocationItem
    )
  );

  const currentCity = id ? allCities.find(city => city.key === id) : undefined;

  return (
    <header className="w-full border-b border-gray-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto max-w-4xl px-4">
        <div className="py-2 text-center">
          <h1 className="text-2xl font-extrabold dark:text-white">
            {APP_CONFIG.NAME}
          </h1>
        </div>
        <AppBar
          color="default"
          position="static"
          sx={{ backgroundColor: "white", boxShadow: "none" }}
        >
          <Toolbar
            className="hidden gap-4 sm:flex"
            sx={{ justifyContent: "center" }}
          >
            <Button
              aria-label="Navigate to map view"
              color="inherit"
              component={Link}
              href={buildUrl("/")}
            >
              Map
            </Button>

            <Autocomplete<LocationItem>
              clearIcon={undefined}
              filterOptions={(options, { inputValue }) => {
                const searchTerm = inputValue.toLowerCase();

                return options.filter(
                  option =>
                    option.title.toLowerCase().includes(searchTerm) ||
                    (option.state || "").toLowerCase().includes(searchTerm)
                );
              }}
              getOptionLabel={option => option.title}
              groupBy={option => option.state || ""}
              onChange={(_, value) => {
                if (value) {
                  globalThis.location.href = `/${value.key}`;
                }
              }}
              options={LocationOptions.flatMap(section =>
                [...(section.items || [])].map(
                  item =>
                    ({
                      key: item.key,
                      state: section.title,
                      title: item.title,
                    }) as LocationItem
                )
              )}
              renderInput={parameters => (
                <TextField
                  {...parameters}
                  label={id! >= 0 ? "Change City" : "Select City"}
                  size="small"
                  variant="outlined"
                />
              )}
              sx={{ backgroundColor: "white", borderRadius: 1, width: 300 }}
              value={currentCity}
            />

            <Button
              aria-label="Navigate to about page"
              color="inherit"
              component={Link}
              href="/about"
            >
              About
            </Button>

            <Button
              aria-label="View source code on GitHub"
              color="inherit"
              component="a"
              href={APP_CONFIG.GITHUB_URL}
              rel="noopener noreferrer"
              target="_blank"
            >
              Github Repository
            </Button>
          </Toolbar>
        </AppBar>
      </div>
    </header>
  );
};
