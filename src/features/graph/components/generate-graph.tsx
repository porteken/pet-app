"use client";

import dynamic from "next/dynamic";
import type { Layout } from "plotly.js";
import React from "react";

import { GRAPH_COLORS } from "@/lib/constants";

type GenerateTrendGraphLegacyArguments = [
  years: number[],
  option: string,
  year_pets: number[],
  trendline_pets: number[],
  increase_per_year: number,
  forecastData?: TrendForecastData,
  showLegend?: boolean,
  isMobileViewport?: boolean,
  useCompactDesktopHeight?: boolean,
];

interface GenerateTrendGraphOptions {
  forecastData?: TrendForecastData;
  increasePerYear: number;
  isMobileViewport?: boolean;
  option: string;
  showLegend?: boolean;
  trendlinePets: number[];
  useCompactDesktopHeight?: boolean;
  yearPets: number[];
  years: number[];
}

interface NormalizedGenerateTrendGraphOptions extends Omit<
  GenerateTrendGraphOptions,
  "isMobileViewport" | "showLegend" | "useCompactDesktopHeight"
> {
  isMobileViewport: boolean;
  showLegend: boolean;
  useCompactDesktopHeight: boolean;
}

interface PlotlyConfig {
  displaylogo: boolean;
  displayModeBar: "hover" | boolean;
  modeBarButtonsToRemove: ("lasso2d" | "pan2d" | "select2d")[];
  responsive: boolean;
}

interface PlotlyTrace {
  fill?: "none" | "tonexty" | "tozeroy";
  fillcolor?: string;
  hovertemplate: string;
  line: {
    color: string;
    dash?: "dashdot" | "dot";
    width: number;
  };
  marker?: {
    color: string;
    size: number;
  };
  mode: "lines" | "lines+markers" | "none";
  name: string;
  showlegend?: boolean;
  type: "scatter";
  x: Date[] | number[];
  y: number[];
}

interface TrendForecastData {
  forecastValues: number[];
  forecastYears: number[];
  lowerBound10: number[];
  upperBound90: number[];
}

const normalizeGenerateTrendGraphOptions = (
  input: [GenerateTrendGraphOptions] | GenerateTrendGraphLegacyArguments,
): NormalizedGenerateTrendGraphOptions => {
  const [firstInput] = input;

  if (
    input.length === 1 &&
    typeof firstInput === "object" &&
    !Array.isArray(firstInput)
  ) {
    const {
      forecastData,
      increasePerYear,
      isMobileViewport = false,
      option,
      showLegend = true,
      trendlinePets,
      useCompactDesktopHeight = false,
      yearPets,
      years,
    } = firstInput;

    return {
      forecastData,
      increasePerYear,
      isMobileViewport,
      option,
      showLegend,
      trendlinePets,
      useCompactDesktopHeight,
      yearPets,
      years,
    };
  }

  const [
    years,
    option,
    yearPets,
    trendlinePets,
    increasePerYear,
    forecastData,
    showLegend = true,
    isMobileViewport = false,
    useCompactDesktopHeight = false,
  ] = input as GenerateTrendGraphLegacyArguments;

  return {
    forecastData,
    increasePerYear,
    isMobileViewport,
    option,
    showLegend,
    trendlinePets,
    useCompactDesktopHeight,
    yearPets,
    years,
  };
};

const getGraphFillHeightClass = (useCompactDesktopHeight: boolean): string =>
  useCompactDesktopHeight
    ? "h-[clamp(220px,42vh,520px)] sm:h-[clamp(300px,45vh,500px)]"
    : "h-[clamp(220px,42vh,520px)] sm:h-[clamp(450px,70vh,850px)]";

const Plot = dynamic(
  async () => {
    const createPlotlyComponent = (await import("react-plotly.js/factory"))
      .default;
    const Plotly = await import("plotly.js-basic-dist-min");

    return createPlotlyComponent(Plotly as never);
  },
  {
    loading: () => (
      <div
        className={`flex items-center justify-center text-gray-500 ${getGraphFillHeightClass(false)}`}
      >
        Loading chart...
      </div>
    ),
    ssr: false,
  },
);

const PlotWrapper: React.FC<{
  config: PlotlyConfig;
  data: PlotlyTrace[];
  layout: Partial<Layout>;
}> = ({ config, data, layout }) => {
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
  ...input: [GenerateTrendGraphOptions] | GenerateTrendGraphLegacyArguments
): React.ReactElement => {
  const {
    forecastData,
    increasePerYear,
    isMobileViewport,
    option,
    showLegend,
    trendlinePets,
    useCompactDesktopHeight,
    yearPets,
    years,
  } = normalizeGenerateTrendGraphOptions(input);

  const graphFillHeightClass = getGraphFillHeightClass(useCompactDesktopHeight);

  if (
    years.length === 0 ||
    yearPets.length === 0 ||
    trendlinePets.length === 0
  ) {
    return (
      <div
        className={`flex items-center justify-center text-gray-500 ${graphFillHeightClass}`}
      >
        No data available for the selected parameters
      </div>
    );
  }

  const graphType = option === "avg" ? "Average" : "Max";
  const increaseText =
    increasePerYear >= 0
      ? `+${increasePerYear.toFixed(2)}`
      : increasePerYear.toFixed(2);

  const layout: Partial<Layout> = {
    autosize: true,
    font: {
      color: "#374151",
    },
    margin: {
      b: isMobileViewport ? 34 : 40,
      l: isMobileViewport ? 34 : 40,
      r: isMobileViewport ? 10 : 20,
      t: isMobileViewport ? 52 : 60,
    },
    paper_bgcolor: GRAPH_COLORS.background,
    plot_bgcolor: GRAPH_COLORS.background,
    showlegend: showLegend,
    title: {
      text: `${graphType} PET in summer (2000-2025)<br><sub>Increase per year: ${increaseText}°C</sub>`,
    },
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
      y: yearPets,
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
      y: trendlinePets,
    },
  ];

  if (forecastData && forecastData.forecastYears.length > 0) {
    const lastYear = years.at(-1)!;
    const lastPetValue = yearPets.at(-1)!;
    const lastLowerBound = lastPetValue;
    const lastUpperBound = lastPetValue;

    data.push(
      {
        fill: "none",
        hovertemplate:
          "Year: %{x}<br>Upper Bound (90%): %{y:.2f}°C<extra></extra>",
        line: {
          color: "rgba(99, 102, 241, 0.2)",
          width: 0,
        },
        mode: "lines",
        name: "90% Confidence",
        showlegend: false,
        type: "scatter",
        x: [lastYear, ...forecastData.forecastYears],
        y: [lastUpperBound, ...forecastData.upperBound90],
      },
      {
        fill: "tonexty",
        fillcolor: "rgba(99, 102, 241, 0.2)",
        hovertemplate:
          "Year: %{x}<br>Lower Bound (10%): %{y:.2f}°C<extra></extra>",
        line: {
          color: "rgba(99, 102, 241, 0.2)",
          width: 0,
        },
        mode: "lines",
        name: "80% Confidence Interval",
        showlegend: true,
        type: "scatter",
        x: [lastYear, ...forecastData.forecastYears],
        y: [lastLowerBound, ...forecastData.lowerBound10],
      },
      {
        hovertemplate: "Year: %{x}<br>Forecast: %{y:.2f}°C<extra></extra>",
        line: {
          color: GRAPH_COLORS.secondary,
          dash: "dot",
          width: 2,
        },
        mode: "lines",
        name: "Forecast",
        type: "scatter",
        x: [lastYear, ...forecastData.forecastYears],
        y: [lastPetValue, ...forecastData.forecastValues],
      },
    );
  }

  const config: PlotlyConfig = {
    displaylogo: false,
    displayModeBar: "hover",
    modeBarButtonsToRemove: ["pan2d", "lasso2d", "select2d"],
    responsive: true,
  };

  return (
    <div
      className={graphFillHeightClass}
      style={{
        margin: "0 auto",
        maxWidth: 1100,
        width: "100%",
      }}
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
  currentPets: number[],
  showLegend = true,
  isMobileViewport = false,
): Promise<React.ReactElement> => {
  const graphFillHeightClass = getGraphFillHeightClass(false);

  if (
    dates.length === 0 ||
    referencePets.length === 0 ||
    currentPets.length === 0
  ) {
    return (
      <div
        className={`flex items-center justify-center text-gray-500 ${graphFillHeightClass}`}
      >
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
      b: isMobileViewport ? 34 : 40,
      l: isMobileViewport ? 34 : 40,
      r: isMobileViewport ? 10 : 20,
      t: isMobileViewport ? 38 : 40,
    },
    paper_bgcolor: GRAPH_COLORS.background,
    plot_bgcolor: GRAPH_COLORS.background,
    showlegend: showLegend,
    title: { text: `PET in summer 2025 vs ${referenceYear}` },
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
      name: "2025 PET",
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
    displayModeBar: "hover",
    modeBarButtonsToRemove: ["pan2d", "lasso2d", "select2d"],
    responsive: true,
  };

  return (
    <div
      className={graphFillHeightClass}
      style={{
        margin: "0 auto",
        maxWidth: 900,
        width: "100%",
      }}
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
