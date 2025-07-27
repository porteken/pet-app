"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

import { queryClient } from "@/lib/api/query-client";

type ProvidersProperties = {
  children: ReactNode;
};

export const Providers = ({ children }: ProvidersProperties) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
