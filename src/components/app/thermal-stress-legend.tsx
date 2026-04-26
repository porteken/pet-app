"use client";

import React from "react";

import { THERMAL_STRESS_LEGEND_ITEMS } from "@/lib/utils/thermal-stress";

interface HeatStressLegendProperties {
  title?: string;
}

const HeatStressLegendComponent: React.FC<HeatStressLegendProperties> = ({
  title = "Thermal Stress Index",
}) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">{title}</h3>
      <ul className="space-y-2.5">
        {THERMAL_STRESS_LEGEND_ITEMS.map((item) => (
          <li className="flex items-center gap-3" key={item.level}>
            <div
              aria-label={`${item.level} marker`}
              className={`h-5 w-5 rounded border border-gray-300 ${item.fillClass}`}
            />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-700">
                {item.rangeLabel}
              </span>
              <span className={`text-xs font-medium ${item.colorClass}`}>
                {item.level}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

HeatStressLegendComponent.displayName = "HeatStressLegend";

export const HeatStressLegend = React.memo(HeatStressLegendComponent);
