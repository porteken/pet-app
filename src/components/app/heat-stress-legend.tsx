"use client";

import React from "react";

const LEGEND_ITEMS = [
  {
    color: "bg-green-500",
    description: "None to Slight heat stress",
    label: "<29.0",
  },
  {
    color: "bg-yellow-500",
    description: "Moderate heat stress",
    label: "29.1–35.0",
  },
  {
    color: "bg-orange-500",
    description: "Strong heat stress",
    label: "35.1–41.0",
  },
  {
    color: "bg-red-500",
    description: "Extreme heat stress",
    label: ">41.0",
  },
] as const;

const HeatStressLegendComponent: React.FC = () => {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">
        Heat Stress Index
      </h3>
      <div className="space-y-2">
        {LEGEND_ITEMS.map((item) => (
          <div className="flex items-center gap-3" key={item.label}>
            <div className={`h-4 w-4 rounded ${item.color}`} />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-700">
                {item.label}
              </span>
              <span className="text-xs text-gray-600">{item.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

HeatStressLegendComponent.displayName = "HeatStressLegend";

export const HeatStressLegend = React.memo(HeatStressLegendComponent);
