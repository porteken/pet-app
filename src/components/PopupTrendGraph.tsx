"use client";
import dynamic from "next/dynamic";
import type { PlotData, Layout, Config } from "plotly.js";
import React, { useEffect, useState } from "react";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] items-center justify-center text-gray-500">
      Loading chart...
    </div>
  ),
});

const GRAPH_COLORS = {
  primary: "#ef4444",
  secondary: "#000000",
  background: "#ffffff",
  grid: "#e5e7eb",
} as const;

const PopupTrendGraph: React.FC<{
  years: number[];
  option: string;
  year_pets: number[];
  trendline_pets: number[];
}> = ({ years, option, year_pets, trendline_pets }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!years.length || !year_pets.length || !trendline_pets.length) {
    return (
      <div className="flex h-[300px] items-center justify-center text-gray-500">
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
      color: "#374151",
    },
    margin: {
      l: 60,
      r: 40,
      t: 60,
      b: 60,
    },
    autosize: false,
    width: 400,
    height: 300,
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
    responsive: false,
  };

  if (!isClient) {
    return (
      <div className="flex h-[300px] items-center justify-center text-gray-500">
        Loading chart...
      </div>
    );
  }

  return (
    <Plot
      data={data as Partial<PlotData>[]}
      layout={layout as Partial<Layout>}
      config={config as Partial<Config>}
      style={{ width: 400, height: 300 }}
    />
  );
};

export default PopupTrendGraph;
