// oxlint-disable-next-line import/no-unassigned-import
import "leaflet/dist/leaflet.css";
// oxlint-disable-next-line import/no-unassigned-import
import "./globals.css";

import { AppProviders } from "@/components/app/providers";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next";
import { Geist } from "next/font/google";
import * as React from "react";

import type { Metadata } from "next";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

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
    <html
      className={cn("font-sans", geist.variable)}
      lang="en"
      suppressHydrationWarning
    >
      <body className="app-shell min-h-screen" suppressHydrationWarning>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <AppProviders>{children}</AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
