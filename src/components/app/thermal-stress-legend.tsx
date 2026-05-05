"use client";

import { THERMAL_STRESS_LEGEND_ITEMS } from "@/lib/utils/thermal-stress";
import React from "react";

interface HeatStressLegendProperties {
  title?: string;
}

const HeatStressLegendComponent: React.FC<HeatStressLegendProperties> = ({
  title = "Thermal Stress Index",
}) => {
  return (
    <div className="glass-panel-muted rounded-2xl p-4">
      <h3 className="text-foreground mb-3 text-sm font-semibold">{title}</h3>
      <ul className="space-y-2.5">
        {THERMAL_STRESS_LEGEND_ITEMS.map((item) => (
          <li className="flex items-center gap-3" key={item.level}>
            <div
              aria-label={`${item.level} marker`}
              className={`h-5 w-5 rounded ${item.fillClass}`}
            />
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs font-medium">
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
