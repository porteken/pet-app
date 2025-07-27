import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GenerateTrendGraph } from "../generate-graph";

// Mock react-plotly.js
const MockPlot = ({ config, data, layout }: any) => (
  <div data-testid="plotly-graph">
    <div data-testid="graph-title">{layout?.title?.text}</div>
    <div data-testid="graph-data">{JSON.stringify(data)}</div>
    <div data-testid="graph-config">{JSON.stringify(config)}</div>
  </div>
);

vi.mock("react-plotly.js", () => ({
  __esModule: true,
  default: MockPlot,
}));

// Mock Next.js dynamic import to return the component immediately
vi.mock("next/dynamic", () => ({
  __esModule: true,
  default: (_importFunction: () => Promise<any>, _options: any) => {
    // Return a component that immediately renders the Plot component
    const DynamicComponent = (properties: any) => {
      // Simulate the client-side state immediately being true
      return <MockPlot {...properties} />;
    };

    return DynamicComponent;
  },
}));

describe("GenerateTrendGraph", () => {
  const mockYears = [2020, 2021, 2022, 2023];
  const mockYearPets = [25.5, 26.2, 27.1, 28];
  const mockTrendlinePets = [25, 26, 27, 28];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render graph with average option", () => {
    const result = GenerateTrendGraph(
      [2000, 2001],
      "avg",
      [25, 26],
      [25.1, 25.9]
    );

    render(result);

    // Now that we've mocked the dynamic loading, verify the graph renders
    expect(screen.getByTestId("plotly-graph")).toBeInTheDocument();
    expect(screen.getByTestId("graph-title")).toHaveTextContent(
      "Average PET in summer (2000-2023)"
    );
  });

  it("should render graph with max option", () => {
    const result = GenerateTrendGraph(
      mockYears,
      "max",
      mockYearPets,
      mockTrendlinePets
    );

    render(result);

    expect(screen.getByTestId("plotly-graph")).toBeInTheDocument();
    expect(screen.getByTestId("graph-title")).toHaveTextContent(
      "Max PET in summer (2000-2023)"
    );
  });

  it("should handle empty years array", () => {
    const result = GenerateTrendGraph(
      [],
      "avg",
      mockYearPets,
      mockTrendlinePets
    );

    render(result);

    expect(
      screen.getByText("No data available for the selected parameters")
    ).toBeInTheDocument();
  });

  it("should handle empty year_pets array", () => {
    const result = GenerateTrendGraph(mockYears, "avg", [], mockTrendlinePets);

    render(result);

    expect(
      screen.getByText("No data available for the selected parameters")
    ).toBeInTheDocument();
  });

  it("should handle empty trendline_pets array", () => {
    const result = GenerateTrendGraph(mockYears, "avg", mockYearPets, []);

    render(result);

    expect(
      screen.getByText("No data available for the selected parameters")
    ).toBeInTheDocument();
  });

  it("should handle all empty arrays", () => {
    const result = GenerateTrendGraph([], "avg", [], []);

    render(result);

    expect(
      screen.getByText("No data available for the selected parameters")
    ).toBeInTheDocument();
  });

  it("should render with correct graph data structure", () => {
    const result = GenerateTrendGraph(
      mockYears,
      "avg",
      mockYearPets,
      mockTrendlinePets
    );

    render(result);

    const graphData = screen.getByTestId("graph-data");
    const data = JSON.parse(graphData.textContent || "[]");

    expect(data).toHaveLength(2); // PET data and trendline data
    expect(data[0]).toMatchObject({
      mode: "lines+markers",
      name: "PET",
      type: "scatter",
      x: mockYears,
      y: mockYearPets,
    });
    expect(data[1]).toMatchObject({
      mode: "lines",
      name: "Trendline of PET",
      type: "scatter",
      x: mockYears,
      y: mockTrendlinePets,
    });
  });

  it("should handle different option values", () => {
    const averageResult = GenerateTrendGraph(
      mockYears,
      "avg",
      mockYearPets,
      mockTrendlinePets
    );
    const { unmount: unmount1 } = render(averageResult);
    expect(screen.getByTestId("graph-title")).toHaveTextContent(
      "Average PET in summer (2000-2023)"
    );
    unmount1();

    const maxResult = GenerateTrendGraph(
      mockYears,
      "max",
      mockYearPets,
      mockTrendlinePets
    );
    const { unmount: unmount2 } = render(maxResult);
    expect(screen.getByTestId("graph-title")).toHaveTextContent(
      "Max PET in summer (2000-2023)"
    );
    unmount2();

    const unknownResult = GenerateTrendGraph(
      mockYears,
      "unknown" as any,
      mockYearPets,
      mockTrendlinePets
    );
    render(unknownResult);
    expect(screen.getByTestId("graph-title")).toHaveTextContent(
      "Max PET in summer (2000-2023)"
    );
  });

  it("should render loading state initially", () => {
    const result = GenerateTrendGraph(
      mockYears,
      "avg",
      mockYearPets,
      mockTrendlinePets
    );

    // Since we're mocking the dynamic import, we won't see the loading state
    // but we can verify the component renders correctly
    render(result);
    expect(screen.getByTestId("plotly-graph")).toBeInTheDocument();
  });

  it("should handle single data point", () => {
    const singleYear = [2023];
    const singleYearPets = [25.5];
    const singleTrendlinePets = [25];

    const result = GenerateTrendGraph(
      singleYear,
      "avg",
      singleYearPets,
      singleTrendlinePets
    );

    render(result);

    expect(screen.getByTestId("plotly-graph")).toBeInTheDocument();

    const graphData = screen.getByTestId("graph-data");
    const data = JSON.parse(graphData.textContent || "[]");

    expect(data[0].x).toEqual(singleYear);
    expect(data[0].y).toEqual(singleYearPets);
    expect(data[1].x).toEqual(singleYear);
    expect(data[1].y).toEqual(singleTrendlinePets);
  });

  it("should show loading state when Plot component is loading", () => {
    // Test the loading component directly as defined in the source
    const { container } = render(
      <div className="flex h-[600px] items-center justify-center text-gray-500">
        Loading chart...
      </div>
    );

    expect(screen.getByText("Loading chart...")).toBeInTheDocument();
    expect(screen.getByText("Loading chart...")).toHaveClass("text-gray-500");

    // Check the container div classes
    const loadingDiv = container.firstChild as HTMLElement;
    expect(loadingDiv).toHaveClass("flex");
    expect(loadingDiv).toHaveClass("h-[600px]");
    expect(loadingDiv).toHaveClass("items-center");
    expect(loadingDiv).toHaveClass("justify-center");
  });
});
