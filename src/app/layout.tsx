import type { Metadata } from "next";

import "@mantine/core/styles.css";
import {
  ColorSchemeScript,
  mantineHtmlProps,
  MantineProvider,
} from "@mantine/core";
import * as React from "react";

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
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <title />
      </head>
      {/* suppressHydrationWarning needed for Mantine's ColorSchemeScript
          which injects inline scripts that differ between server and client */}
      <body suppressHydrationWarning>
        <MantineProvider>{children}</MantineProvider>
      </body>
    </html>
  );
}
