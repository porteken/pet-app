"use client";

import React from "react";

const LEGEND_ITEMS = [
  {
    color: "bg-green-500",
    description: "None to Slight heat stress",
    label: "<29.0",
    marker: "N",
  },
  {
    color: "bg-yellow-500",
    description: "Moderate heat stress",
    label: "29.1–35.0",
    marker: "M",
  },
  {
    color: "bg-orange-500",
    description: "Strong heat stress",
    label: "35.1–41.0",
    marker: "S",
  },
  {
    color: "bg-red-500",
    description: "Extreme heat stress",
    label: ">41.0",
    marker: "E",
  },
] as const;

const HeatStressLegendComponent: React.FC = () => {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">
        Heat Stress Index
      </h3>
      <ul className="space-y-2">
        {LEGEND_ITEMS.map((item) => (
          <li className="flex items-center gap-3" key={item.label}>
            <div
              aria-label={`${item.description} marker`}
              className={`flex h-5 w-5 items-center justify-center rounded border border-gray-300 text-[10px] font-bold text-gray-900 ${item.color}`}
            >
              {item.marker}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-700">
                {item.label}
              </span>
              <span className="text-xs text-gray-600">{item.description}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

HeatStressLegendComponent.displayName = "HeatStressLegend";

export const HeatStressLegend = React.memo(HeatStressLegendComponent);
