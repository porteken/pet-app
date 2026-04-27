"use client";

import React from "react";

interface LocationInfo {
  city: string;
  state: string;
}

interface PageHeaderProperties {
  location: LocationInfo;
}

export const PageHeader: React.FC<PageHeaderProperties> = ({ location }) => {
  return (
    <div className="climate-hero fade-in-up mb-8 rounded-4xl p-6 sm:p-8">
      <p className="mb-2 text-xs font-semibold tracking-[0.24em] text-white/80 uppercase">
        Location profile
      </p>
      <h1 className="mb-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
        {location.city}, {location.state}
      </h1>
      <p className="max-w-3xl text-sm text-white/85 sm:text-base">
        Explore long-term PET trends, compare today&apos;s seasonal patterns
        with a historical baseline, and track where thermal stress is heading.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
          Trend analysis
        </span>
        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
          Reference comparison
        </span>
      </div>
    </div>
  );
};
