"use client";

import { ThemeProvider } from "@/components/app/theme-provider";
import * as React from "react";

export const AppProviders = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => (
  <ThemeProvider>{children}</ThemeProvider>
);
