"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

import { getQueryClient } from "@/lib/api/query-client";

interface QueryProviderProperties {
  children: ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProperties) => {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
