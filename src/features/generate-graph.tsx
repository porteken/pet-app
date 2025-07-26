"use client";

import type { Layout } from "plotly.js";

import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";

interface PlotlyConfig {
  displaylogo: boolean;
  displayModeBar: boolean;
  modeBarButtonsToRemove: ("lasso2d" | "pan2d" | "select2d")[];
  responsive: boolean;
}

interface PlotlyTrace {
  hovertemplate: string;
  line: {
    color: string;
    dash?: "dashdot";
    width: number;
  };
  marker?: {
    color: string;
    size: number;
  };
  mode: "lines" | "lines+markers";
  name: string;
  type: "scatter";
  x: Date[] | number[];
  y: number[];
}

const Plot = dynamic(() => import("react-plotly.js"), {
  loading: () => (
    <div className="flex h-[600px] items-center justify-center text-gray-500">
      Loading chart...
    </div>
  ),
});

const GRAPH_COLORS = {
  background: "#ffffff",
  grid: "#e5e7eb",
  primary: "#ef4444",
  secondary: "#000000",
} as const;

const PlotWrapper: React.FC<{
  config: PlotlyConfig;
  data: PlotlyTrace[];
  layout: Partial<Layout>;
}> = ({ config, data, layout }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        Loading chart...
      </div>
    );
  }

  return (
    <Plot
      config={config}
      data={data}
      layout={{
        ...layout,
        autosize: true,
        height: undefined,
        width: undefined,
      }}
      style={{ height: "100%", width: "100%" }}
      useResizeHandler
    />
  );
};

export const GenerateTrendGraph = (
  years: number[],
  option: string,
  year_pets: number[],
  trendline_pets: number[]
): React.ReactElement => {
  if (
    years.length === 0 ||
    year_pets.length === 0 ||
    trendline_pets.length === 0
  ) {
    return (
      <div className="flex h-[600px] items-center justify-center text-gray-500">
        No data available for the selected parameters
      </div>
    );
  }

  const graph_type = option === "avg" ? "Average" : "Max";

  const layout: Partial<Layout> = {
    autosize: true,
    font: {
      color: "#374151",
    },
    margin: {
      b: 40,
      l: 40,
      r: 20,
      t: 40,
    },
    paper_bgcolor: GRAPH_COLORS.background,
    plot_bgcolor: GRAPH_COLORS.background,
    title: { text: `${graph_type} PET in summer (2000-2023)` },
    xaxis: {
      gridcolor: GRAPH_COLORS.grid,
      title: { text: "Year" },
      zeroline: false,
    },
    yaxis: {
      gridcolor: GRAPH_COLORS.grid,
      title: { text: "PET" },
      zeroline: false,
    },
  };

  const data: PlotlyTrace[] = [
    {
      hovertemplate: "Year: %{x}<br>PET: %{y:.2f}<extra></extra>",
      line: {
        color: GRAPH_COLORS.primary,
        width: 2,
      },
      marker: {
        color: GRAPH_COLORS.primary,
        size: 6,
      },
      mode: "lines+markers",
      name: "PET",
      type: "scatter",
      x: years,
      y: year_pets,
    },
    {
      hovertemplate: "Year: %{x}<br>Trendline: %{y:.2f}<extra></extra>",
      line: {
        color: GRAPH_COLORS.secondary,
        dash: "dashdot",
        width: 2,
      },
      mode: "lines",
      name: "Trendline of PET",
      type: "scatter",
      x: years,
      y: trendline_pets,
    },
  ];

  const config: PlotlyConfig = {
    displaylogo: false,
    displayModeBar: true,
    modeBarButtonsToRemove: ["pan2d", "lasso2d", "select2d"],
    responsive: true,
  };

  return (
    <div
      style={{ height: 600, margin: "0 auto", maxWidth: 900, width: "100%" }}
    >
      <PlotWrapper
        config={config}
        data={data}
        layout={{
          ...layout,
          autosize: true,
          height: undefined,
          width: undefined,
        }}
      />
    </div>
  );
};

export const GenerateReferenceGraph = async (
  referenceYear: string,
  dates: Date[],
  referencePets: number[],
  currentPets: number[]
): Promise<React.ReactElement> => {
  if (
    dates.length === 0 ||
    referencePets.length === 0 ||
    currentPets.length === 0
  ) {
    return (
      <div className="flex h-[600px] items-center justify-center text-gray-500">
        No data available for the selected parameters
      </div>
    );
  }

  const layout: Partial<Layout> = {
    autosize: true,
    font: {
      color: "#374151",
    },
    margin: {
      b: 40,
      l: 40,
      r: 20,
      t: 40,
    },
    paper_bgcolor: GRAPH_COLORS.background,
    plot_bgcolor: GRAPH_COLORS.background,
    title: { text: `PET in summer 2023 vs ${referenceYear}` },
    xaxis: {
      gridcolor: GRAPH_COLORS.grid,
      tickformat: "%b %-d",
      title: { text: "Date" },
      zeroline: false,
    },
    yaxis: {
      gridcolor: GRAPH_COLORS.grid,
      title: { text: "PET" },
      zeroline: false,
    },
  };

  const data: PlotlyTrace[] = [
    {
      hovertemplate: "Date: %{x|%b %-d}<br>PET: %{y:.2f}<extra></extra>",
      line: {
        color: GRAPH_COLORS.primary,
        width: 2,
      },
      marker: {
        color: GRAPH_COLORS.primary,
        size: 6,
      },
      mode: "lines+markers",
      name: "2023 PET",
      type: "scatter",
      x: dates,
      y: currentPets,
    },
    {
      hovertemplate: "Date: %{x|%b %-d}<br>PET: %{y:.2f}<extra></extra>",
      line: {
        color: GRAPH_COLORS.secondary,
        dash: "dashdot",
        width: 2,
      },
      marker: {
        color: GRAPH_COLORS.secondary,
        size: 6,
      },
      mode: "lines+markers",
      name: `${referenceYear} PET`,
      type: "scatter",
      x: dates,
      y: referencePets,
    },
  ];

  const config: PlotlyConfig = {
    displaylogo: false,
    displayModeBar: true,
    modeBarButtonsToRemove: ["pan2d", "lasso2d", "select2d"],
    responsive: true,
  };

  return (
    <PlotWrapper
      config={config}
      data={data}
      layout={{ ...layout, height: 600, width: 900 }}
    />
  );
};
