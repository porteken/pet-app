"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";

import { createQueryClient } from "@/lib/api/query-client";

export const AppProviders = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const [queryClient] = React.useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
