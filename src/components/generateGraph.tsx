"use client";

import Plot from "react-plotly.js";
import { FetchTrendGraphData } from "./fetchClient";
import { LayoutProps, TrendGraphDataProps } from "./types";

// Generate trend graph based on selected option and location ID
export const GenerateTrendGraph = (
  years: number[],
  option: string,
  year_pets: number[],
  trendline_pets: number[],
  size?: number,
): JSX.Element => {
  // Fetch graph data
  const graph_type = option === "avg" ? "Average" : "Max";

  // Define layout with optional size adjustment
  const layout: LayoutProps = {
    xaxis: { title: "Year" },
    yaxis: { title: "PET" },
    title: `${graph_type} PET (2000-2023)`,
    ...(size && { width: size, height: size }), // Apply size if provided
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
          marker: { color: "red" },
          name: "PET",
        },
        {
          x: years,
          y: trendline_pets,
          type: "scatter",
          mode: "lines",
          line: { dash: "dashdot", color: "black" },
          name: "Trendline of PET",
        },
      ]}
      layout={layout}
    />
  );
};

// Generate reference graph comparing a specific year with the current year
export const GenerateReferenceGraph = async (
  referenceYear: string,
  dates: Date[],
  referencePets: number[],
  currentPets: number[],
): Promise<JSX.Element> => {
  // Define layout
  const layout: LayoutProps = {
    xaxis: { title: "Date", tickformat: "%b %-d" },
    yaxis: { title: "PET" },
    title: `PET in Summer 2023 vs ${referenceYear}`,
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
          marker: { color: "red" },
          hovertemplate: "Date: %{x|%b %-d}<br>Pets: %{y}",
          name: "2023 PET",
        },
        {
          x: dates,
          y: referencePets,
          type: "scatter",
          mode: "lines+markers",
          line: { dash: "dashdot", color: "black" },
          hovertemplate: "Date: %{x|%b %-d}<br>Pets: %{y}",
          name: `${referenceYear} PET`,
        },
      ]}
      layout={layout}
    />
  );
};
