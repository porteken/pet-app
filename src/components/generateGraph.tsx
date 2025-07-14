"use client";

import dynamic from "next/dynamic";
import { Layout } from "plotly.js";
import React, { useEffect, useState } from "react";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center text-gray-500">
      Loading chart...
    </div>
  ),
});

// Graph color scheme for better accessibility
const GRAPH_COLORS = {
  primary: "#ef4444", // red-500
  secondary: "#000000", // black
  background: "#ffffff", // white
  grid: "#e5e7eb", // gray-200
} as const;

const PlotWrapper: React.FC<{
  data: any[];
  layout: Partial<Layout>;
  config: any;
}> = ({ data, layout, config }) => {
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
      data={data}
      layout={layout}
      config={config}
      useResizeHandler={true}
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export const GenerateTrendGraph = (
  years: number[],
  option: string,
  year_pets: number[],
  trendline_pets: number[]
): React.ReactElement => {
  if (!years.length || !year_pets.length || !trendline_pets.length) {
    return (
      <div className="flex h-[600px] items-center justify-center text-gray-500">
        No data available for the selected parameters
      </div>
    );
  }

  const graph_type = option === "avg" ? "Average" : "Max";

  const layout: Partial<Layout> = {
    xaxis: {
      title: { text: "Year" },
      gridcolor: GRAPH_COLORS.grid,
      zeroline: false,
    },
    yaxis: {
      title: { text: "PET" },
      gridcolor: GRAPH_COLORS.grid,
      zeroline: false,
    },
    title: { text: `${graph_type} PET in summer (2000-2023)` },
    plot_bgcolor: GRAPH_COLORS.background,
    paper_bgcolor: GRAPH_COLORS.background,
    font: {
      color: "#374151", // gray-700
    },
    margin: {
      l: 40,
      r: 20,
      t: 40,
      b: 40,
    },
    autosize: true,
  };

  const data = [
    {
      x: years,
      y: year_pets,
      type: "scatter",
      mode: "lines+markers",
      marker: {
        color: GRAPH_COLORS.primary,
        size: 6,
      },
      line: {
        color: GRAPH_COLORS.primary,
        width: 2,
      },
      name: "PET",
      hovertemplate: "Year: %{x}<br>PET: %{y:.2f}<extra></extra>",
    },
    {
      x: years,
      y: trendline_pets,
      type: "scatter",
      mode: "lines",
      line: {
        dash: "dashdot",
        color: GRAPH_COLORS.secondary,
        width: 2,
      },
      name: "Trendline of PET",
      hovertemplate: "Year: %{x}<br>Trendline: %{y:.2f}<extra></extra>",
    },
  ];

  const config = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ["pan2d", "lasso2d", "select2d"],
    responsive: true,
  };

  return <PlotWrapper data={data} layout={layout} config={config} />;
};

export const GenerateReferenceGraph = async (
  referenceYear: string,
  dates: Date[],
  referencePets: number[],
  currentPets: number[]
): Promise<React.ReactElement> => {
  if (!dates.length || !referencePets.length || !currentPets.length) {
    return (
      <div className="flex h-[600px] items-center justify-center text-gray-500">
        No data available for the selected parameters
      </div>
    );
  }

  const layout: Partial<Layout> = {
    xaxis: {
      title: { text: "Date" },
      tickformat: "%b %-d",
      gridcolor: GRAPH_COLORS.grid,
      zeroline: false,
    },
    yaxis: {
      title: { text: "PET" },
      gridcolor: GRAPH_COLORS.grid,
      zeroline: false,
    },
    title: { text: `PET in summer 2023 vs ${referenceYear}` },
    plot_bgcolor: GRAPH_COLORS.background,
    paper_bgcolor: GRAPH_COLORS.background,
    font: {
      color: "#374151", // gray-700
    },
    margin: {
      l: 40,
      r: 20,
      t: 40,
      b: 40,
    },
    autosize: true,
  };

  const data = [
    {
      x: dates,
      y: currentPets,
      type: "scatter",
      mode: "lines+markers",
      marker: {
        color: GRAPH_COLORS.primary,
        size: 6,
      },
      line: {
        color: GRAPH_COLORS.primary,
        width: 2,
      },
      hovertemplate: "Date: %{x|%b %-d}<br>PET: %{y:.2f}<extra></extra>",
      name: "2023 PET",
    },
    {
      x: dates,
      y: referencePets,
      type: "scatter",
      mode: "lines+markers",
      line: {
        dash: "dashdot",
        color: GRAPH_COLORS.secondary,
        width: 2,
      },
      marker: {
        color: GRAPH_COLORS.secondary,
        size: 6,
      },
      hovertemplate: "Date: %{x|%b %-d}<br>PET: %{y:.2f}<extra></extra>",
      name: `${referenceYear} PET`,
    },
  ];

  const config = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ["pan2d", "lasso2d", "select2d"],
    responsive: true,
  };

  return <PlotWrapper data={data} layout={layout} config={config} />;
};
