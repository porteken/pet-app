"use client";

import { ThemeProvider } from "@/components/app/theme-provider";
import { createQueryClient } from "@/lib/api/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";

export const AppProviders = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const [queryClient] = React.useState(createQueryClient);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
};
