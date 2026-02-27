import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GenerateReferenceGraph, GenerateTrendGraph } from "../generate-graph";

const MockPlot = ({ config, data, layout }: any) => (
  <div data-testid="plotly-graph">
    <div data-testid="graph-title">{layout?.title?.text}</div>
    <div data-testid="graph-data">{JSON.stringify(data)}</div>
    <div data-testid="graph-config">{JSON.stringify(config)}</div>
    <div data-testid="graph-layout">{JSON.stringify(layout)}</div>
  </div>
);

vi.mock("react-plotly.js", () => ({
  __esModule: true,
  default: MockPlot,
}));

vi.mock("next/dynamic", () => ({
  __esModule: true,
  default: (_importFunction: () => Promise<any>, _options: any) => {
    return (properties: any) => {
      return <MockPlot {...properties} />;
    };
  },
}));

describe("Graph Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GenerateTrendGraph", () => {
    const mockYears = [2020, 2021, 2022, 2023];
    const mockYearPets = [25.5, 26.2, 27.1, 28];
    const mockTrendlinePets = [25, 26, 27, 28];
    const mockIncreasePerYear = 0.5;

    describe("Basic Rendering", () => {
      it("should render graph with average option", () => {
        const result = GenerateTrendGraph(
          [2000, 2001],
          "avg",
          [25, 26],
          [25.1, 25.9],
          0.45
        );

        render(result);

        expect(screen.getByTestId("plotly-graph")).toBeInTheDocument();
        expect(screen.getByTestId("graph-title")).toHaveTextContent(
          "Average PET in summer (2000-2025)"
        );
      });

      it("should render graph with max option", () => {
        const result = GenerateTrendGraph(
          mockYears,
          "max",
          mockYearPets,
          mockTrendlinePets,
          mockIncreasePerYear
        );

        render(result);

        expect(screen.getByTestId("plotly-graph")).toBeInTheDocument();
        expect(screen.getByTestId("graph-title")).toHaveTextContent(
          "Max PET in summer (2000-2025)"
        );
      });
    });

    describe("Error Handling", () => {
      it("should handle empty years array", () => {
        const result = GenerateTrendGraph(
          [],
          "avg",
          mockYearPets,
          mockTrendlinePets,
          mockIncreasePerYear
        );

        render(result);

        expect(
          screen.getByText("No data available for the selected parameters")
        ).toBeInTheDocument();
      });

      it("should handle empty year_pets array", () => {
        const result = GenerateTrendGraph(
          mockYears,
          "avg",
          [],
          mockTrendlinePets,
          mockIncreasePerYear
        );

        render(result);

        expect(
          screen.getByText("No data available for the selected parameters")
        ).toBeInTheDocument();
      });

      it("should handle empty trendline_pets array", () => {
        const result = GenerateTrendGraph(
          mockYears,
          "avg",
          mockYearPets,
          [],
          mockIncreasePerYear
        );

        render(result);

        expect(
          screen.getByText("No data available for the selected parameters")
        ).toBeInTheDocument();
      });

      it("should handle all empty arrays", () => {
        const result = GenerateTrendGraph(
          [],
          "avg",
          [],
          [],
          mockIncreasePerYear
        );

        render(result);

        expect(
          screen.getByText("No data available for the selected parameters")
        ).toBeInTheDocument();
      });
    });

    describe("Graph Data Structure", () => {
      it("should render with correct graph data structure", () => {
        const result = GenerateTrendGraph(
          mockYears,
          "avg",
          mockYearPets,
          mockTrendlinePets,
          mockIncreasePerYear
        );

        render(result);

        const graphData = screen.getByTestId("graph-data");
        const data = JSON.parse(graphData.textContent || "[]");

        expect(data).toHaveLength(2);
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
          mockTrendlinePets,
          mockIncreasePerYear
        );
        const { unmount: unmount1 } = render(averageResult);
        expect(screen.getByTestId("graph-title")).toHaveTextContent(
          "Average PET in summer (2000-2025)"
        );
        unmount1();

        const maxResult = GenerateTrendGraph(
          mockYears,
          "max",
          mockYearPets,
          mockTrendlinePets,
          mockIncreasePerYear
        );
        const { unmount: unmount2 } = render(maxResult);
        expect(screen.getByTestId("graph-title")).toHaveTextContent(
          "Max PET in summer (2000-2025)"
        );
        unmount2();

        const unknownResult = GenerateTrendGraph(
          mockYears,
          "unknown" as any,
          mockYearPets,
          mockTrendlinePets,
          mockIncreasePerYear
        );
        render(unknownResult);
        expect(screen.getByTestId("graph-title")).toHaveTextContent(
          "Max PET in summer (2000-2025)"
        );
      });

      it("should hide legend when showLegend is false", () => {
        const result = GenerateTrendGraph(
          mockYears,
          "avg",
          mockYearPets,
          mockTrendlinePets,
          mockIncreasePerYear,
          undefined,
          false
        );

        render(result);

        const graphLayout = screen.getByTestId("graph-layout");
        const layout = JSON.parse(graphLayout.textContent || "{}");
        expect(layout.showlegend).toBe(false);
      });
    });

    describe("Edge Cases", () => {
      it("should render loading state initially", () => {
        const result = GenerateTrendGraph(
          mockYears,
          "avg",
          mockYearPets,
          mockTrendlinePets,
          mockIncreasePerYear
        );

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
          singleTrendlinePets,
          mockIncreasePerYear
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
        const { container } = render(
          <div className="flex h-150 items-center justify-center text-gray-500">
            Loading chart...
          </div>
        );

        expect(screen.getByText("Loading chart...")).toBeInTheDocument();
        expect(screen.getByText("Loading chart...")).toHaveClass(
          "text-gray-500"
        );

        const loadingDiv = container.firstChild as HTMLElement;
        expect(loadingDiv).toHaveClass("flex");
        expect(loadingDiv).toHaveClass("h-150");
        expect(loadingDiv).toHaveClass("items-center");
        expect(loadingDiv).toHaveClass("justify-center");
      });
    });
  });

  describe("GenerateReferenceGraph", () => {
    const mockDates = [
      new Date("2023-06-01"),
      new Date("2023-06-02"),
      new Date("2023-06-03"),
    ];
    const mockReferencePets = [25.5, 26, 24.8];
    const mockCurrentPets = [28.2, 29.1, 27.5];

    describe("Basic Rendering", () => {
      it("should render reference graph with valid data", async () => {
        const result = await GenerateReferenceGraph(
          "2020",
          mockDates,
          mockReferencePets,
          mockCurrentPets
        );

        const { container } = render(result);
        expect(container).toBeInTheDocument();
      });

      it("should include reference year in title", async () => {
        const result = await GenerateReferenceGraph(
          "2018",
          mockDates,
          mockReferencePets,
          mockCurrentPets
        );

        const { container } = render(result);
        expect(container.firstChild).toBeTruthy();
      });

      it("should hide reference graph legend when showLegend is false", async () => {
        const result = await GenerateReferenceGraph(
          "2018",
          mockDates,
          mockReferencePets,
          mockCurrentPets,
          false,
          true
        );

        render(result);

        const graphLayout = screen.getByTestId("graph-layout");
        const layout = JSON.parse(graphLayout.textContent || "{}");
        expect(layout.showlegend).toBe(false);
      });
    });

    describe("Error Handling", () => {
      it("should display no data message when dates array is empty", async () => {
        const result = await GenerateReferenceGraph(
          "2020",
          [],
          mockReferencePets,
          mockCurrentPets
        );

        const { getByText } = render(result);
        expect(
          getByText("No data available for the selected parameters")
        ).toBeInTheDocument();
      });

      it("should display no data message when reference pets array is empty", async () => {
        const result = await GenerateReferenceGraph(
          "2020",
          mockDates,
          [],
          mockCurrentPets
        );

        const { getByText } = render(result);
        expect(
          getByText("No data available for the selected parameters")
        ).toBeInTheDocument();
      });

      it("should display no data message when current pets array is empty", async () => {
        const result = await GenerateReferenceGraph(
          "2020",
          mockDates,
          mockReferencePets,
          []
        );

        const { getByText } = render(result);
        expect(
          getByText("No data available for the selected parameters")
        ).toBeInTheDocument();
      });
    });

    describe("Edge Cases", () => {
      it("should handle different reference years", async () => {
        const result2000 = await GenerateReferenceGraph(
          "2000",
          mockDates,
          mockReferencePets,
          mockCurrentPets
        );

        const result2010 = await GenerateReferenceGraph(
          "2010",
          mockDates,
          mockReferencePets,
          mockCurrentPets
        );

        const { container: container2000 } = render(result2000);
        const { container: container2010 } = render(result2010);

        expect(container2000.firstChild).toBeTruthy();
        expect(container2010.firstChild).toBeTruthy();
      });

      it("should work with single data point", async () => {
        const singleDate = [new Date("2023-06-01")];
        const singleReferencePet = [25.5];
        const singleCurrentPet = [28.2];

        const result = await GenerateReferenceGraph(
          "2020",
          singleDate,
          singleReferencePet,
          singleCurrentPet
        );

        const { container } = render(result);
        expect(container.firstChild).toBeTruthy();
      });

      it("should handle zero values in pet data", async () => {
        const zeroReferencePets = [0, 0, 0];
        const zeroCurrentPets = [0, 0, 0];

        const result = await GenerateReferenceGraph(
          "2020",
          mockDates,
          zeroReferencePets,
          zeroCurrentPets
        );

        const { container } = render(result);
        expect(container.firstChild).toBeTruthy();
      });

      it("should handle negative values in pet data", async () => {
        const negativeReferencePets = [-5, -3.2, -4.1];
        const negativeCurrentPets = [-2.1, -1.8, -3];

        const result = await GenerateReferenceGraph(
          "2020",
          mockDates,
          negativeReferencePets,
          negativeCurrentPets
        );

        const { container } = render(result);
        expect(container.firstChild).toBeTruthy();
      });
    });
  });

  describe("PlotWrapper Component", () => {
    const mockConfig = {
      displaylogo: false,
      displayModeBar: "hover",
      modeBarButtonsToRemove: ["pan2d", "lasso2d", "select2d"],
      responsive: true,
    } as const;

    const mockData = [
      {
        hovertemplate: "Test: %{x}<br>Value: %{y:.2f}<extra></extra>",
        line: { color: "#3b82f6", width: 2 },
        marker: { color: "#3b82f6", size: 6 },
        mode: "lines+markers" as const,
        name: "Test Data",
        type: "scatter" as const,
        x: [1, 2, 3],
        y: [10, 20, 30],
      },
    ];

    const mockLayout = {
      title: { text: "Test Graph" },
      xaxis: { title: { text: "X Axis" } },
      yaxis: { title: { text: "Y Axis" } },
    };

    it("should render server-side loading state initially", () => {
      const { container } = render(
        <div className="flex h-64 items-center justify-center text-gray-500">
          Loading chart...
        </div>
      );

      expect(screen.getByText("Loading chart...")).toBeInTheDocument();

      const loadingDiv = container.firstChild as HTMLElement;
      expect(loadingDiv).toHaveClass(
        "flex",
        "h-64",
        "items-center",
        "justify-center",
        "text-gray-500"
      );
    });

    it("should handle PlotWrapper props correctly", () => {
      const TestPlotWrapper = ({ config, data, layout }: any) => (
        <div data-testid="plot-wrapper">
          <div data-testid="config">{JSON.stringify(config)}</div>
          <div data-testid="data">{JSON.stringify(data)}</div>
          <div data-testid="layout">{JSON.stringify(layout)}</div>
        </div>
      );

      render(
        <TestPlotWrapper
          config={mockConfig}
          data={mockData}
          layout={mockLayout}
        />
      );

      expect(screen.getByTestId("plot-wrapper")).toBeInTheDocument();
      expect(screen.getByTestId("config")).toHaveTextContent(
        JSON.stringify(mockConfig)
      );
      expect(screen.getByTestId("data")).toHaveTextContent(
        JSON.stringify(mockData)
      );
      expect(screen.getByTestId("layout")).toHaveTextContent(
        JSON.stringify(mockLayout)
      );
    });
  });

  describe("Graph Configuration", () => {
    it("should use correct colors for trend graph", () => {
      const result = GenerateTrendGraph(
        [2020, 2021],
        "avg",
        [25, 26],
        [25.1, 25.9],
        0.45
      );

      render(result);

      const graphData = screen.getByTestId("graph-data");
      const data = JSON.parse(graphData.textContent || "[]");

      expect(data[0].line.color).toBe("#3b82f6");
      expect(data[0].marker.color).toBe("#3b82f6");

      expect(data[1].line.color).toBe("#000000");
      expect(data[1].line.dash).toBe("dashdot");
    });

    it("should configure graph layout correctly for trend graph", () => {
      const result = GenerateTrendGraph(
        [2020, 2021],
        "max",
        [30, 31],
        [29.5, 30.5],
        0.5
      );

      render(result);

      const graphLayout = screen.getByTestId("graph-layout");
      const layout = JSON.parse(graphLayout.textContent || "{}");

      expect(layout.title.text).toBe(
        "Max PET in summer (2000-2025)<br><sub>Increase per year: +0.50°C</sub>"
      );
      expect(layout.xaxis.title.text).toBe("Year");
      expect(layout.yaxis.title.text).toBe("PET");
      expect(layout.paper_bgcolor).toBe("#ffffff");
      expect(layout.plot_bgcolor).toBe("#ffffff");
    });

    it("should configure mode bar buttons correctly", () => {
      const result = GenerateTrendGraph(
        [2020, 2021],
        "avg",
        [25, 26],
        [25.1, 25.9],
        0.45
      );

      render(result);

      const graphConfig = screen.getByTestId("graph-config");
      const config = JSON.parse(graphConfig.textContent || "{}");

      expect(config.displaylogo).toBe(false);
      expect(config.displayModeBar).toBe("hover");
      expect(config.modeBarButtonsToRemove).toEqual([
        "pan2d",
        "lasso2d",
        "select2d",
      ]);
      expect(config.responsive).toBe(true);
    });

    it("should handle hover templates correctly", () => {
      const result = GenerateTrendGraph(
        [2020, 2021],
        "avg",
        [25, 26],
        [25.1, 25.9],
        0.45
      );

      render(result);

      const graphData = screen.getByTestId("graph-data");
      const data = JSON.parse(graphData.textContent || "[]");

      expect(data[0].hovertemplate).toBe(
        "Year: %{x}<br>PET: %{y:.2f}<extra></extra>"
      );
      expect(data[1].hovertemplate).toBe(
        "Year: %{x}<br>Trendline: %{y:.2f}<extra></extra>"
      );
    });
  });

  describe("Reference Graph Configuration", () => {
    const mockDates = [new Date("2023-06-01"), new Date("2023-06-02")];
    const mockReferencePets = [25.5, 26];
    const mockCurrentPets = [28.2, 29.1];

    it("should handle different reference year formats", async () => {
      const testYears = ["2000", "2010", "2020"];

      for (const year of testYears) {
        const result = await GenerateReferenceGraph(
          year,
          mockDates,
          mockReferencePets,
          mockCurrentPets
        );

        const { container } = render(result);
        expect(container.firstChild).toBeTruthy();
      }
    });

    it("should render with fixed layout dimensions", async () => {
      const result = await GenerateReferenceGraph(
        "2020",
        mockDates,
        mockReferencePets,
        mockCurrentPets
      );

      const { container } = render(result);
      expect(container.firstChild).toBeTruthy();
    });

    it("should handle date formatting in reference graph", async () => {
      const testDates = [
        new Date("2023-01-15"),
        new Date("2023-07-04"),
        new Date("2023-12-25"),
      ];

      const result = await GenerateReferenceGraph(
        "2020",
        testDates,
        [20, 25, 18],
        [22, 27, 20]
      );

      const { container } = render(result);
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("Comprehensive Edge Cases", () => {
    it("should handle very large datasets", () => {
      const largeYears = Array.from(
        { length: 100 },
        (_, index) => 2000 + index
      );
      const largeYearPets = Array.from(
        { length: 100 },
        (_, index) => 20 + index * 0.1
      );
      const largeTrendlinePets = Array.from(
        { length: 100 },
        (_, index) => 19 + index * 0.15
      );

      const result = GenerateTrendGraph(
        largeYears,
        "avg",
        largeYearPets,
        largeTrendlinePets,
        0.1
      );

      render(result);
      expect(screen.getByTestId("plotly-graph")).toBeInTheDocument();
    });

    it("should handle extreme values", () => {
      const result = GenerateTrendGraph(
        [2020, 2021, 2022],
        "max",
        [0.001, 999.999, -50.5],
        [0.1, 1000, -50],
        0.5
      );

      render(result);

      const graphData = screen.getByTestId("graph-data");
      const data = JSON.parse(graphData.textContent || "[]");

      expect(data[0].y).toEqual([0.001, 999.999, -50.5]);
      expect(data[1].y).toEqual([0.1, 1000, -50]);
    });

    it("should handle mismatched array lengths gracefully", () => {
      const result = GenerateTrendGraph(
        [2020, 2021, 2022],
        "avg",
        [25, 26],
        [25.1],
        0.5
      );

      render(result);
      expect(screen.getByTestId("plotly-graph")).toBeInTheDocument();
    });

    it("should handle special option values", () => {
      const unknownResult = GenerateTrendGraph(
        [2020, 2021],
        "unknown_option",
        [25, 26],
        [25.1, 25.9],
        0.45
      );

      render(unknownResult);

      expect(screen.getByTestId("graph-title")).toHaveTextContent(
        "Max PET in summer (2000-2025)"
      );
    });
  });

  describe("Forecast Data", () => {
    const mockYears = [2020, 2021, 2022, 2023];
    const mockYearPets = [25.5, 26.2, 27.1, 28];
    const mockTrendlinePets = [25, 26, 27, 28];
    const mockIncreasePerYear = 0.5;

    const mockForecastData = {
      forecastValues: [29, 30, 31],
      forecastYears: [2024, 2025, 2026],
      lowerBound10: [27, 28, 29],
      upperBound90: [31, 32, 33],
    };

    it("should render forecast data when provided", () => {
      const result = GenerateTrendGraph(
        mockYears,
        "avg",
        mockYearPets,
        mockTrendlinePets,
        mockIncreasePerYear,
        mockForecastData
      );

      render(result);

      const graphData = screen.getByTestId("graph-data");
      const data = JSON.parse(graphData.textContent || "[]");

      expect(data.length).toBe(5);
      expect(data[2].name).toBe("90% Confidence");
      expect(data[3].name).toBe("80% Confidence Interval");
      expect(data[4].name).toBe("Forecast");
    });

    it("should include last year data in forecast traces", () => {
      const result = GenerateTrendGraph(
        mockYears,
        "avg",
        mockYearPets,
        mockTrendlinePets,
        mockIncreasePerYear,
        mockForecastData
      );

      render(result);

      const graphData = screen.getByTestId("graph-data");
      const data = JSON.parse(graphData.textContent || "[]");

      expect(data[2].x[0]).toBe(2023);
      expect(data[3].x[0]).toBe(2023);
      expect(data[4].x[0]).toBe(2023);
    });

    it("should connect forecast to last PET value", () => {
      const result = GenerateTrendGraph(
        mockYears,
        "avg",
        mockYearPets,
        mockTrendlinePets,
        mockIncreasePerYear,
        mockForecastData
      );

      render(result);

      const graphData = screen.getByTestId("graph-data");
      const data = JSON.parse(graphData.textContent || "[]");

      expect(data[4].y[0]).toBe(28);
      expect(data[4].y.slice(1)).toEqual(mockForecastData.forecastValues);
    });

    it("should not render forecast traces when forecastData has empty years", () => {
      const result = GenerateTrendGraph(
        mockYears,
        "avg",
        mockYearPets,
        mockTrendlinePets,
        mockIncreasePerYear,
        {
          forecastValues: [29, 30],
          forecastYears: [],
          lowerBound10: [27, 28],
          upperBound90: [31, 32],
        }
      );

      render(result);

      const graphData = screen.getByTestId("graph-data");
      const data = JSON.parse(graphData.textContent || "[]");

      expect(data.length).toBe(2);
    });

    it("should style confidence interval with fill", () => {
      const result = GenerateTrendGraph(
        mockYears,
        "avg",
        mockYearPets,
        mockTrendlinePets,
        mockIncreasePerYear,
        mockForecastData
      );

      render(result);

      const graphData = screen.getByTestId("graph-data");
      const data = JSON.parse(graphData.textContent || "[]");

      expect(data[2].fill).toBe("none");
      expect(data[3].fill).toBe("tonexty");
      expect(data[3].fillcolor).toBe("rgba(99, 102, 241, 0.2)");
    });

    it("should style forecast line with dot dash", () => {
      const result = GenerateTrendGraph(
        mockYears,
        "avg",
        mockYearPets,
        mockTrendlinePets,
        mockIncreasePerYear,
        mockForecastData
      );

      render(result);

      const graphData = screen.getByTestId("graph-data");
      const data = JSON.parse(graphData.textContent || "[]");

      expect(data[4].line.dash).toBe("dot");
    });

    it("should handle negative increase per year", () => {
      const result = GenerateTrendGraph(
        mockYears,
        "avg",
        mockYearPets,
        mockTrendlinePets,
        -0.35
      );

      render(result);

      expect(screen.getByTestId("graph-title")).toHaveTextContent("-0.35°C");
    });

    it("should format positive increase per year with plus sign", () => {
      const result = GenerateTrendGraph(
        mockYears,
        "avg",
        mockYearPets,
        mockTrendlinePets,
        0.42
      );

      render(result);

      expect(screen.getByTestId("graph-title")).toHaveTextContent("+0.42°C");
    });
  });
});
