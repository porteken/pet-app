"use client";

import React from "react";

interface LocationInfo {
  city: string;
  state: string;
}

interface PageHeaderProperties {
  location: LocationInfo;
}

export const PageHeader: React.FC<PageHeaderProperties> = ({ location }) => (
  <div className="fade-in-up climate-hero mb-8 rounded-4xl p-6 sm:p-8">
    <h1 className="mb-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
      {location.city}, {location.state}
    </h1>
    <p className="max-w-3xl text-sm text-white/85 sm:text-base">
      Explore long-term PET trends, compare today&apos;s seasonal patterns with
      a historical baseline, and track where thermal stress is heading.
    </p>
  </div>
);
