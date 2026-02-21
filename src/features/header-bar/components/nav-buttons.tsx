"use client";

import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/lib/constants";

interface NavButtonsProperties {
  buildUrl: (path: string, includeSearchParameters?: boolean) => string;
}

export const NavButtons: React.FC<NavButtonsProperties> = ({ buildUrl }) => {
  return (
    <>
      <Button aria-label="Navigate to map view" asChild variant="ghost">
        <Link href={buildUrl("/")}>Map</Link>
      </Button>

      <Button aria-label="Navigate to rankings page" asChild variant="ghost">
        <Link href="/rankings">Rankings</Link>
      </Button>

      <Button aria-label="Navigate to about page" asChild variant="ghost">
        <Link href="/about">About</Link>
      </Button>

      <Button aria-label="View source code on GitHub" asChild variant="ghost">
        <a
          href={APP_CONFIG.GITHUB_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          Github Repository
        </a>
      </Button>
    </>
  );
};
