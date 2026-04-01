import "leaflet/dist/leaflet.css";
import "./globals.css";

import type { Metadata } from "next";
import * as React from "react";

import { AppProviders } from "@/components/app/providers";

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
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
