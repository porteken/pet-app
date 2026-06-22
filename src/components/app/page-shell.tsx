"use client";

import { HeaderBar } from "@/features/header-bar";
import React from "react";

import type { NavProperties } from "@/types/types";

interface PageShellProperties extends NavProperties {
  children: React.ReactNode;
  headerWrapperClassName?: string;
  mainClassName: string;
}

export const PageShell = ({
  children,
  headerWrapperClassName,
  mainClassName,
  ...headerProperties
}: PageShellProperties): React.ReactElement => {
  const header = <HeaderBar {...headerProperties} />;

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      {headerWrapperClassName ? (
        <div className={headerWrapperClassName}>{header}</div>
      ) : (
        header
      )}
      <main className={mainClassName} id="main-content">
        {children}
      </main>
    </>
  );
};
