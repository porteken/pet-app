"use client";

import Plot from "react-plotly.js";

import { GRAPH_CONFIG } from "@/utils/constants";

import { LayoutProps } from "./types";

// Graph color scheme for better accessibility
const GRAPH_COLORS = {
  primary: "#ef4444", // red-500
  secondary: "#000000", // black
  background: "#ffffff", // white
  grid: "#e5e7eb", // gray-200
} as const;

// Generate trend graph based on selected option and location ID
export const GenerateTrendGraph = (
  years: number[],
  option: string,
  year_pets: number[],
  trendline_pets: number[],
  size?: number
): JSX.Element => {
  // Validate inputs
  if (!years.length || !year_pets.length || !trendline_pets.length) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        No data available for the selected parameters
      </div>
    );
  }

  // Determine graph type
  const graph_type =
    option === GRAPH_CONFIG.TREND_OPTIONS.AVG ? "Average" : "Max";

  // Define layout with optional size adjustment
  const layout: LayoutProps = {
    xaxis: {
      title: "Year",
      gridcolor: GRAPH_COLORS.grid,
      zeroline: false,
    },
    yaxis: {
      title: "PET",
      gridcolor: GRAPH_COLORS.grid,
      zeroline: false,
    },
    title: `${graph_type} PET in summer (2000-2023)`,
    plot_bgcolor: GRAPH_COLORS.background,
    paper_bgcolor: GRAPH_COLORS.background,
    font: {
      color: "#374151", // gray-700
    },
    margin: {
      l: 60,
      r: 40,
      t: 60,
      b: 60,
    },
    ...(size && { width: size, height: size }),
  };

  // Return the rendered Plot component
  return (
    <Plot
      data={[
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
      ]}
      layout={layout}
      config={{
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ["pan2d", "lasso2d", "select2d"],
        responsive: true,
      }}
      useResizeHandler={true}
      style={{ width: "100%", height: "100%" }}
    />
  );
};

// Generate reference graph comparing a specific year with the current year
export const GenerateReferenceGraph = async (
  referenceYear: string,
  dates: Date[],
  referencePets: number[],
  currentPets: number[]
): Promise<JSX.Element> => {
  // Validate inputs
  if (!dates.length || !referencePets.length || !currentPets.length) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        No data available for the selected parameters
      </div>
    );
  }

  // Define layout
  const layout: LayoutProps = {
    xaxis: {
      title: "Date",
      tickformat: "%b %-d",
      gridcolor: GRAPH_COLORS.grid,
      zeroline: false,
    },
    yaxis: {
      title: "PET",
      gridcolor: GRAPH_COLORS.grid,
      zeroline: false,
    },
    title: `PET in summer 2023 vs ${referenceYear}`,
    plot_bgcolor: GRAPH_COLORS.background,
    paper_bgcolor: GRAPH_COLORS.background,
    font: {
      color: "#374151", // gray-700
    },
    margin: {
      l: 60,
      r: 40,
      t: 60,
      b: 60,
    },
  };

  // Return the rendered Plot component
  return (
    <Plot
      data={[
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
      ]}
      layout={layout}
      config={{
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ["pan2d", "lasso2d", "select2d"],
        responsive: true,
      }}
      useResizeHandler={true}
      style={{ width: "100%", height: "100%" }}
    />
  );
};
