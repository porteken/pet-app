import type { Metadata } from "next";
import { Inter } from "next/font/google";
import * as React from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Historical PET USA",
  description: "Physiological Equivalent Temperature data for US cities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          {children}
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
