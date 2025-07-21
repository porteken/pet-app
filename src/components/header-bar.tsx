"use client";

import { Navbar, NavbarContent, NavbarItem } from "@heroui/react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";

import { NavProps } from "../types/types";

import { APP_CONFIG } from "@/utils/constants";

interface LocationItem {
  key: number;
  title: string;
  state: string;
}

export const HeaderBar = ({
  LocationOptions,
  id,
}: NavProps): React.ReactElement => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const buildUrl = (path: string, includeSearchParams = true) => {
    const baseUrl = path;
    if (includeSearchParams && searchParams.toString() !== "") {
      return `${baseUrl}?${searchParams.toString()}`;
    }
    return baseUrl;
  };

  const isActive = (path: string) => pathname === path;

  const allCities = LocationOptions.flatMap(section =>
    Array.from(section.items || []).map(
      item =>
        ({
          key: item.key,
          title: item.title,
          state: section.title,
        }) as LocationItem
    )
  );

  const currentCity = id ? allCities.find(city => city.key === id) : null;

  return (
    <header className="w-full border-b border-gray-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto max-w-4xl px-4">
        <div className="py-2 text-center">
          <h1 className="text-2xl font-extrabold dark:text-white">
            {APP_CONFIG.NAME}
          </h1>
        </div>
        <Navbar
          classNames={{
            item: [
              "flex",
              "relative",
              "h-full",
              "items-center",
              "data-[active=true]:after:content-['']",
              "data-[active=true]:after:absolute",
              "data-[active=true]:after:bottom-0",
              "data-[active=true]:after:left-0",
              "data-[active=true]:after:right-0",
              "data-[active=true]:after:h-[2px]",
              "data-[active=true]:after:rounded-[2px]",
              "data-[active=true]:after:bg-primary",
            ],
          }}
        >
          <NavbarContent className="hidden gap-4 sm:flex" justify="center">
            <NavbarItem isActive={isActive("/")}>
              <Link
                color="foreground"
                href={buildUrl("/")}
                aria-label="Navigate to map view"
              >
                Map
              </Link>
            </NavbarItem>

            <NavbarItem isActive={id! >= 0}>
              <Autocomplete<LocationItem>
                options={LocationOptions.flatMap(section =>
                  Array.from(section.items || []).map(
                    item =>
                      ({
                        key: item.key,
                        title: item.title,
                        state: section.title,
                      }) as LocationItem
                  )
                )}
                groupBy={option => option.state || ""}
                getOptionLabel={option => option.title}
                filterOptions={(options, { inputValue }) => {
                  const searchTerm = inputValue.toLowerCase();
                  return options.filter(
                    option =>
                      option.title.toLowerCase().includes(searchTerm) ||
                      (option.state || "").toLowerCase().includes(searchTerm)
                  );
                }}
                clearIcon={null}
                sx={{ width: 300, backgroundColor: "white", borderRadius: 1 }}
                renderInput={params => (
                  <TextField
                    {...params}
                    label={id! >= 0 ? "Change City" : "Select City"}
                    variant="outlined"
                    size="small"
                  />
                )}
                onChange={(_, value) => {
                  if (value) {
                    window.location.href = `/${value.key}`;
                  }
                }}
                value={currentCity}
              />
            </NavbarItem>

            <NavbarItem isActive={isActive("/about")}>
              <Link
                color="foreground"
                href="/about"
                aria-label="Navigate to about page"
              >
                About
              </Link>
            </NavbarItem>

            <NavbarItem>
              <Link
                color="foreground"
                href={APP_CONFIG.GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View source code on GitHub"
              >
                Github Repository
              </Link>
            </NavbarItem>
          </NavbarContent>
        </Navbar>
      </div>
    </header>
  );
};
