"use client";
import Plot from "react-plotly.js";
import { FetchTrendGraphData } from "./fetchData";
import { LayoutProps, TrendGraphDataProps } from "./types";
export const GenerateTrendGraph = async (
  id: number,
  option: string,
  size?: number,
) => {
  const { type, years, pets, trendline_pets }: TrendGraphDataProps =
    await FetchTrendGraphData(option, id);
  var layout: LayoutProps = {
    xaxis: { title: "Year" },
    yaxis: { title: "Pet" },
    title: `${type} Pet from 2000-2023`,
  };
  layout = size ? { ...layout, width: size, height: size } : layout;
  return (
    <Plot
      data={[
        {
          x: years,
          y: pets,
          type: "scatter",
          name: "pet",
          mode: "lines+markers",
          marker: { color: "red" },
        },
        {
          x: years,
          y: trendline_pets,
          type: "scatter",
          name: "trendline",
          mode: "lines",
          line: { dash: "dashdot", color: "black" },
        },
      ]}
      layout={layout}
    />
  );
};
export const GenerateReferenceGraph = async (
  reference_year: string,
  dates: Date[],
  referencePets: number[],
  currentPets: number[],
) => {
  var layout: LayoutProps = {
    xaxis: { title: "Year", tickformat: "%b, %-d" },
    yaxis: { title: "Pet" },
    title: `Pet during summer 2023 vs ${reference_year}`,
  };
  return (
    <Plot
      data={[
        {
          x: dates,
          y: currentPets,
          hovertemplate: `date: %{x|%b %-d} pet: %{y}`,
          type: "scatter",
          name: `2023 pet`,
          mode: "lines+markers",
          marker: { color: "red" },
        },
        {
          x: dates,
          y: referencePets,
          hovertemplate: `date: %{x|%b %-d} pet: %{y}`,
          type: "scatter",
          name: `${reference_year} pet`,
          mode: "lines+markers",
          line: { dash: "dashdot", color: "black" },
        },
      ]}
      layout={layout}
    />
  );
};
