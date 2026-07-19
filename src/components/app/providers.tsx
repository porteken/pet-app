"use client";

import { BasisProvider } from "@/components/app/basis-provider";
import { ThemeProvider } from "@/components/app/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import * as React from "react";

export const AppProviders = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => (
  <ThemeProvider>
    <BasisProvider>
      <ToastProvider>{children}</ToastProvider>
    </BasisProvider>
  </ThemeProvider>
);
