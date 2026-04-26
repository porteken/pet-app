"use client";

import dynamic from "next/dynamic";
import type { Layout } from "plotly.js";
import React from "react";

import {
  DEFAULT_GRAPH_SEASON,
  GRAPH_COLORS,
  type GraphSeason,
} from "@/lib/constants";

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
  season?: GraphSeason;
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
  season: GraphSeason;
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

type GenerateReferenceGraphArguments = readonly [
  referenceYear: string,
  dates: Date[],
  referencePets: number[],
  currentPets: number[],
  showLegend?: boolean,
  isMobileViewport?: boolean,
  season?: GraphSeason,
  currentYear?: number,
];

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
      season = DEFAULT_GRAPH_SEASON,
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
      season,
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
    season: DEFAULT_GRAPH_SEASON,
    showLegend,
    trendlinePets,
    useCompactDesktopHeight,
    yearPets,
    years,
  };
};

const getGraphFillHeightClass = (useCompactDesktopHeight: boolean): string =>
  useCompactDesktopHeight
    ? "h-full min-h-[clamp(220px,42vh,520px)] sm:min-h-[clamp(300px,45vh,500px)]"
    : "h-full min-h-[clamp(220px,42vh,520px)] sm:min-h-[clamp(450px,70vh,850px)]";

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
    season,
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
      l: isMobileViewport ? 30 : 32,
      r: isMobileViewport ? 6 : 10,
      t: isMobileViewport ? 52 : 60,
    },
    paper_bgcolor: GRAPH_COLORS.background,
    plot_bgcolor: GRAPH_COLORS.background,
    showlegend: showLegend,
    title: {
      text: `${graphType} ${season} PET (2000-2025)<br><sub>Increase per year: ${increaseText}°C</sub>`,
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

async function generateReferenceGraphInternal(
  ...[
    referenceYear,
    dates,
    referencePets,
    currentPets,
    showLegend = true,
    isMobileViewport = false,
    season = DEFAULT_GRAPH_SEASON,
    currentYear = 2025,
  ]: GenerateReferenceGraphArguments
): Promise<React.ReactElement> {
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
      l: isMobileViewport ? 30 : 32,
      r: isMobileViewport ? 6 : 10,
      t: isMobileViewport ? 38 : 40,
    },
    paper_bgcolor: GRAPH_COLORS.background,
    plot_bgcolor: GRAPH_COLORS.background,
    showlegend: showLegend,
    title: { text: `${season} PET in ${currentYear} vs ${referenceYear}` },
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
}

export const GenerateReferenceGraph = (
  ...arguments_: GenerateReferenceGraphArguments
): Promise<React.ReactElement> => {
  return generateReferenceGraphInternal(...arguments_);
};
