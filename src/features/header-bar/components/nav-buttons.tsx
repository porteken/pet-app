"use client";

import { Button } from "@mantine/core";
import Link from "next/link";
import React from "react";

import { APP_CONFIG } from "@/lib/constants";

interface NavButtonsProperties {
  buildUrl: (path: string, includeSearchParameters?: boolean) => string;
}

export const NavButtons: React.FC<NavButtonsProperties> = ({ buildUrl }) => {
  return (
    <>
      <Button
        aria-label="Navigate to map view"
        component={Link}
        href={buildUrl("/")}
        variant="subtle"
      >
        Map
      </Button>

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
    </>
  );
};
