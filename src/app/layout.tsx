import type { Metadata } from "next";

import "leaflet/dist/leaflet.css";
import * as React from "react";

import { AppProviders } from "@/components/app/providers";

import "./globals.css";

export const metadata: Metadata = {
  description: "Physiological Equivalent Temperature data for US cities",
  title: "Historical PET USA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
