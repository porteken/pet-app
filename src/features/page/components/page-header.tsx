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
    <div className="mb-8">
      <h1 className="mb-2 text-center text-3xl font-bold text-gray-900">
        {location.city}, {location.state}
      </h1>
    </div>
  );
};
