"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utilities";

interface NavButtonsProperties {
  buildUrl: (path: string, includeSearchParameters?: boolean) => string;
}

export const NavButtons: React.FC<NavButtonsProperties> = ({ buildUrl }) => {
  const pathname = usePathname();

  const isActivePath = (path: string): boolean => pathname === path;

  return (
    <>
      <Button aria-label="Navigate to map view" asChild variant="ghost">
        <Link
          aria-current={isActivePath("/") ? "page" : undefined}
          className={cn(
            "rounded-md px-1",
            isActivePath("/") && "bg-gray-100 font-semibold text-gray-900",
          )}
          href={buildUrl("/")}
        >
          Map
        </Link>
      </Button>

      <Button aria-label="Navigate to rankings page" asChild variant="ghost">
        <Link
          aria-current={isActivePath("/rankings") ? "page" : undefined}
          className={cn(
            "rounded-md px-1",
            isActivePath("/rankings") &&
              "bg-gray-100 font-semibold text-gray-900",
          )}
          href="/rankings"
        >
          Rankings
        </Link>
      </Button>

      <Button aria-label="Navigate to about page" asChild variant="ghost">
        <Link
          aria-current={isActivePath("/about") ? "page" : undefined}
          className={cn(
            "rounded-md px-1",
            isActivePath("/about") && "bg-gray-100 font-semibold text-gray-900",
          )}
          href="/about"
        >
          About
        </Link>
      </Button>

      <Button aria-label="View source code on GitHub" asChild variant="ghost">
        <a
          href={APP_CONFIG.GITHUB_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span className="sm:hidden">GitHub</span>
          <span className="hidden sm:inline">GitHub Repository</span>
        </a>
      </Button>
    </>
  );
};
