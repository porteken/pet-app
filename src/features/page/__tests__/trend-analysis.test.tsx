// eslint-disable-next-line import/no-unassigned-import
import "@testing-library/jest-dom";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

class MockForecastControls extends React.PureComponent<{
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onYearsChange: (years: number) => void;
  yearsAhead: number;
}> {
  private readonly handleToggle = () => {
    this.props.onToggle(!this.props.enabled);
  };

  private readonly handleYearsChange = (
    event_: React.ChangeEvent<HTMLInputElement>,
  ) => {
    this.props.onYearsChange(Number(event_.target.value));
  };

  public render(): React.ReactNode {
    const { enabled, yearsAhead } = this.props;

    return (
      <div data-testid="forecast-controls">
        <button
          data-testid="forecast-toggle"
          onClick={this.handleToggle}
          type="button"
        >
          {enabled ? "Disable" : "Enable"} Forecast
        </button>
        <input
          data-testid="forecast-years"
          onChange={this.handleYearsChange}
          type="number"
          value={yearsAhead}
        />
      </div>
    );
  }
}

vi.mock("@/features/graph", () => ({
  GenerateTrendGraph: mockFn().mockReturnValue(
    <div data-testid="mock-trend-graph">Trend Graph</div>,
  ),
}));

vi.mock("@/lib/api/fetch-client", () => ({
  FetchForecastData: mockFn().mockResolvedValue({
    forecastValues: [28, 30, 32],
    forecastYears: [2025, 2026, 2027],
    lowerBound10: [26, 28, 30],
    upperBound90: [30, 32, 34],
  }),
  FetchTrendGraphData: mockFn().mockResolvedValue({
    increase_per_year: 0.5,
    trendline_pets: [20, 22, 24, 26],
    year_pets: [20, 22, 24, 26],
    years: [2020, 2021, 2022, 2023],
  }),
}));

vi.mock("@/lib/utils/thermal-stress", () => ({
  getForecastHeatStressDescription: mockFn(
    (value: number, year: number, lower: number, upper: number) => ({
      colorClass: "text-red-500",
      confidenceRange: `(range: ${lower}-${upper})`,
      prefix: "Forecast:",
      value: "High",
    }),
  ),
  getHeatStressDescription: mockFn(
    (value: number, option: string, year: number) => ({
      colorClass: "text-orange-500",
      prefix: `${year} Thermal Stress:`,
      value: "Moderate",
    }),
  ),
}));

vi.mock("@/components/app/forecast-controls", () => ({
  ForecastControls: mockFn(
    (props: React.ComponentProps<typeof MockForecastControls>) => (
      <MockForecastControls {...props} />
    ),
  ),
}));

vi.mock("@/lib/actions/actions", () => ({
  setForecastPreferences: mockFn().mockResolvedValue({}),
}));

import { GenerateTrendGraph } from "@/features/graph";
import { setForecastPreferences } from "@/lib/actions/actions";
import { FetchForecastData, FetchTrendGraphData } from "@/lib/api/fetch-client";
import {
  getForecastHeatStressDescription,
  getHeatStressDescription,
} from "@/lib/utils/thermal-stress";

import { TrendAnalysis } from "../components/trend-analysis";

const defaultProps: React.ComponentProps<typeof TrendAnalysis> = {
  graphSeason: "Annual",
  id: 1,
  initialForecastEnabled: false,
  initialForecastYearsAhead: 10,
  initialGraphMeasure: "avg",
  onMeasureChange: mockFn().mockResolvedValue(Promise.resolve()),
  onSeasonChange: mockFn().mockResolvedValue(Promise.resolve()),
  referenceYear: "2000",
};

const waitForInitialTrendAnalysisRender = async () => {
  await waitFor(() => {
    expect(GenerateTrendGraph).toHaveBeenCalled();
  });
};

describe("trendAnalysis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(globalThis, "matchMedia", {
      value: mockFn().mockReturnValue({
        addEventListener: mockFn(),
        addListener: mockFn(),
        dispatchEvent: mockFn(),
        matches: false,
        media: "(max-width: 639px)",
        onchange: undefined,
        removeEventListener: mockFn(),
        removeListener: mockFn(),
      }),
      writable: true,
    });
  });

  describe("basic Rendering", () => {
    it("should render trend analysis heading", async () => {
      render(<TrendAnalysis {...defaultProps} />);
      await waitForInitialTrendAnalysisRender();

      expect(screen.getByText("Trend Analysis")).toBeInTheDocument();
    });

    it("should render graph measure select", async () => {
      render(<TrendAnalysis {...defaultProps} />);
      await waitForInitialTrendAnalysisRender();

      expect(screen.getByLabelText("Graph Measure")).toBeInTheDocument();
    });

    it("should render forecast controls when measure is avg", async () => {
      render(<TrendAnalysis {...defaultProps} />);
      await waitForInitialTrendAnalysisRender();

      expect(screen.getByTestId("forecast-controls")).toBeInTheDocument();
    });

    it("should render forecast controls for seasonal averages", async () => {
      render(<TrendAnalysis {...defaultProps} graphSeason="Winter" />);
      await waitForInitialTrendAnalysisRender();

      expect(screen.getByTestId("forecast-controls")).toBeInTheDocument();
    });

    it("should not render forecast controls when measure is max", async () => {
      render(<TrendAnalysis {...defaultProps} initialGraphMeasure="max" />);

      await waitFor(() => {
        expect(
          screen.queryByTestId("forecast-controls"),
        ).not.toBeInTheDocument();
      });
    });

    it("should render trend graph", async () => {
      const { container } = render(<TrendAnalysis {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-trend-graph")).toBeInTheDocument();
      });

      expect(container.querySelector("#trend-analysis-graph")).toHaveClass(
        "flex-1",
      );
      expect(container.querySelector("#trend-analysis-graph")).not.toHaveClass(
        "mt-auto",
      );
    });

    it("should call FetchTrendGraphData on mount", async () => {
      render(<TrendAnalysis {...defaultProps} />);

      await waitFor(() => {
        expect(FetchTrendGraphData).toHaveBeenCalledWith("avg", 1, "Annual");
      });
    });

    it("should call GenerateTrendGraph with fetched data", async () => {
      render(<TrendAnalysis {...defaultProps} />);

      await waitFor(() => {
        expect(GenerateTrendGraph).toHaveBeenCalledWith(
          expect.objectContaining({
            forecastData: undefined,
            increasePerYear: 0.5,
            isMobileViewport: false,
            option: "avg",
            showLegend: true,
            trendlinePets: [20, 22, 24, 26],
            yearPets: [20, 22, 24, 26],
            years: [2020, 2021, 2022, 2023],
          }),
          undefined,
        );
      });
    });

    it("should refresh trend graph data when reference year changes", async () => {
      const { rerender } = render(<TrendAnalysis {...defaultProps} />);

      await waitForInitialTrendAnalysisRender();

      rerender(<TrendAnalysis {...defaultProps} referenceYear="2022" />);

      await waitFor(() => {
        expect(GenerateTrendGraph).toHaveBeenLastCalledWith(
          expect.objectContaining({
            trendlinePets: [20, 22, 24, 26],
            yearPets: [20, 22, 24, 26],
            years: [2020, 2021, 2022, 2023],
          }),
          undefined,
        );
      });

      expect(FetchTrendGraphData).toHaveBeenCalledTimes(2);
    });

    it("should keep mobile graph legend collapsed by default and toggle open", async () => {
      Object.defineProperty(globalThis, "matchMedia", {
        value: mockFn().mockReturnValue({
          addEventListener: mockFn(),
          addListener: mockFn(),
          dispatchEvent: mockFn(),
          matches: true,
          media: "(max-width: 639px)",
          onchange: undefined,
          removeEventListener: mockFn(),
          removeListener: mockFn(),
        }),
        writable: true,
      });

      render(<TrendAnalysis {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-trend-graph")).toBeInTheDocument();
      });

      const toggle = screen.getByRole("button", {
        name: "Show Graph Legend",
      });
      expect(toggle).toHaveAttribute("aria-expanded", "false");

      await waitFor(() => {
        expect(GenerateTrendGraph).toHaveBeenLastCalledWith(
          expect.objectContaining({
            isMobileViewport: true,
            showLegend: false,
          }),
          undefined,
        );
      });

      fireEvent.click(toggle);

      await waitFor(() => {
        expect(GenerateTrendGraph).toHaveBeenLastCalledWith(
          expect.objectContaining({
            isMobileViewport: true,
            showLegend: true,
          }),
          undefined,
        );
      });
    });
  });

  describe("thermal Stress Display", () => {
    it("should display current thermal stress description", async () => {
      render(<TrendAnalysis {...defaultProps} />);

      await waitFor(() => {
        expect(getHeatStressDescription).toHaveBeenCalledWith(
          26,
          "avg",
          2023,
          "Annual",
        );
      });

      await waitFor(() => {
        expect(screen.getByText("2023 Thermal Stress:")).toBeInTheDocument();
        expect(screen.getByText("Moderate")).toBeInTheDocument();
      });
    });

    it("should not display thermal stress when years array is empty", async () => {
      vi.mocked(FetchTrendGraphData).mockResolvedValueOnce({
        increase_per_year: 0,
        trendline_pets: [],
        year_pets: [],
        years: [],
      });

      render(<TrendAnalysis {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText("Thermal Stress:")).not.toBeInTheDocument();
      });
    });

    it("should display forecast thermal stress when forecast is enabled", async () => {
      render(<TrendAnalysis {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId("forecast-controls")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("forecast-toggle"));

      await waitFor(() => {
        expect(FetchForecastData).toHaveBeenCalledWith(1, 10, "Annual");
      });

      await waitFor(() => {
        expect(getForecastHeatStressDescription).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText("Forecast:")).toBeInTheDocument();
      });
    });

    it("should display forecast confidence range when available", async () => {
      render(<TrendAnalysis {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId("forecast-controls")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("forecast-toggle"));

      await waitFor(() => {
        expect(screen.getByText(/range:/)).toBeInTheDocument();
      });
    });
  });

  describe("graph Measure Change", () => {
    it("should change measure when select value changes", async () => {
      const onMeasureChange = mockFn().mockResolvedValue(Promise.resolve());
      render(
        <TrendAnalysis {...defaultProps} onMeasureChange={onMeasureChange} />,
      );

      const select = screen.getByLabelText("Graph Measure");
      fireEvent.change(select, { target: { value: "max" } });

      await waitFor(() => {
        expect(onMeasureChange).toHaveBeenCalledWith("max");
      });
    });

    it("should refetch graph data with new measure", async () => {
      render(<TrendAnalysis {...defaultProps} />);

      await waitFor(() => {
        expect(FetchTrendGraphData).toHaveBeenCalledWith("avg", 1, "Annual");
      });

      const select = screen.getByLabelText("Graph Measure");
      fireEvent.change(select, { target: { value: "max" } });

      await waitFor(() => {
        expect(FetchTrendGraphData).toHaveBeenCalledWith("max", 1, "Annual");
      });
    });

    it("should ignore onMeasureChange persistence errors", async () => {
      const onMeasureChange = mockFn().mockRejectedValue(
        new Error("Server error"),
      );

      render(
        <TrendAnalysis {...defaultProps} onMeasureChange={onMeasureChange} />,
      );

      const select = screen.getByLabelText("Graph Measure");
      fireEvent.change(select, { target: { value: "max" } });

      await waitFor(() => {
        expect(onMeasureChange).toHaveBeenCalledWith("max");
      });

      expect(select).toHaveValue("max");
    });

    it("should hide forecast controls when changing to max measure", async () => {
      render(<TrendAnalysis {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId("forecast-controls")).toBeInTheDocument();
      });

      const select = screen.getByLabelText("Graph Measure");
      fireEvent.change(select, { target: { value: "max" } });

      await waitFor(() => {
        expect(
          screen.queryByTestId("forecast-controls"),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("forecast Controls", () => {
    it("should enable forecast when toggle is clicked", async () => {
      render(<TrendAnalysis {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId("forecast-toggle")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("forecast-toggle"));

      await waitFor(() => {
        expect(FetchForecastData).toHaveBeenCalledWith(1, 10, "Annual");
      });

      expect(setForecastPreferences).toHaveBeenCalledWith(true, 10);
    });

    it("should update years ahead when input changes", async () => {
      render(<TrendAnalysis {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId("forecast-years")).toBeInTheDocument();
      });

      const input = screen.getByTestId("forecast-years");
      fireEvent.change(input, { target: { value: "15" } });

      fireEvent.click(screen.getByTestId("forecast-toggle"));

      await waitFor(() => {
        expect(FetchForecastData).toHaveBeenCalledWith(1, 15, "Annual");
      });

      expect(setForecastPreferences).toHaveBeenCalledWith(false, 15);
    });

    it("should initialize forecast controls from cookie-backed props", async () => {
      render(
        <TrendAnalysis
          {...defaultProps}
          initialForecastEnabled={true}
          initialForecastYearsAhead={20}
        />,
      );

      await waitFor(() => {
        expect(FetchForecastData).toHaveBeenCalledWith(1, 20, "Annual");
      });
    });

    it("should fetch seasonal forecast data when enabled", async () => {
      render(<TrendAnalysis {...defaultProps} graphSeason="Winter" />);

      await waitFor(() => {
        expect(screen.getByTestId("forecast-toggle")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("forecast-toggle"));

      await waitFor(() => {
        expect(FetchForecastData).toHaveBeenCalledWith(1, 10, "Winter");
      });
    });

    it("should ignore forecast preference persistence errors", async () => {
      vi.mocked(setForecastPreferences).mockRejectedValueOnce(
        new Error("Cookie write failed"),
      );

      render(<TrendAnalysis {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId("forecast-toggle")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("forecast-toggle"));

      await waitFor(() => {
        expect(setForecastPreferences).toHaveBeenCalledWith(true, 10);
      });
    });

    it("should call GenerateTrendGraph with forecast data when enabled", async () => {
      render(<TrendAnalysis {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId("forecast-controls")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("forecast-toggle"));

      await waitFor(() => {
        expect(GenerateTrendGraph).toHaveBeenCalledWith(
          expect.objectContaining({
            forecastData: expect.objectContaining({
              forecastValues: expect.any(Array),
            }),
            increasePerYear: expect.any(Number),
            isMobileViewport: false,
            option: "avg",
            showLegend: true,
            trendlinePets: expect.any(Array),
            yearPets: expect.any(Array),
            years: expect.any(Array),
          }),
          undefined,
        );
      });
    });

    it("should disable forecast when toggle is clicked again", async () => {
      render(<TrendAnalysis {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId("forecast-toggle")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("forecast-toggle"));

      await waitFor(() => {
        expect(FetchForecastData).toHaveBeenCalled();
      });

      vi.clearAllMocks();

      fireEvent.click(screen.getByTestId("forecast-toggle"));

      await waitFor(() => {
        expect(FetchForecastData).not.toHaveBeenCalled();
      });
    });

    it("should not fetch forecast data when forecast is disabled", async () => {
      render(<TrendAnalysis {...defaultProps} />);

      await waitFor(() => {
        expect(FetchTrendGraphData).toHaveBeenCalled();
      });

      expect(FetchForecastData).not.toHaveBeenCalled();
    });
  });

  describe("error Handling", () => {
    it("should handle API error gracefully", async () => {
      vi.mocked(FetchTrendGraphData).mockRejectedValueOnce(
        new Error("API Error"),
      );

      render(<TrendAnalysis {...defaultProps} />);

      await waitFor(() => {
        expect(GenerateTrendGraph).toHaveBeenCalledWith(
          expect.objectContaining({
            forecastData: undefined,
            increasePerYear: 0,
            isMobileViewport: false,
            option: "avg",
            showLegend: true,
            trendlinePets: [],
            yearPets: [],
            years: [],
          }),
          undefined,
        );
      });
    });

    it("should clear thermal stress on error", async () => {
      vi.mocked(FetchTrendGraphData).mockRejectedValueOnce(
        new Error("API Error"),
      );

      render(<TrendAnalysis {...defaultProps} />);

      await waitFor(() => {
        expect(GenerateTrendGraph).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.queryByText("Thermal Stress:")).not.toBeInTheDocument();
      });
    });

    it("should clear forecast thermal stress on error", async () => {
      vi.mocked(FetchTrendGraphData).mockRejectedValueOnce(
        new Error("API Error"),
      );

      render(<TrendAnalysis {...defaultProps} />);

      await waitFor(() => {
        expect(GenerateTrendGraph).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.queryByText("Forecast:")).not.toBeInTheDocument();
      });
    });
  });

  describe("edge Cases", () => {
    it("should handle empty forecast values", async () => {
      vi.mocked(FetchForecastData).mockResolvedValueOnce({
        forecastValues: [],
        forecastYears: [],
        lowerBound10: [],
        upperBound90: [],
      });

      render(<TrendAnalysis {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId("forecast-controls")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("forecast-toggle"));

      await waitFor(() => {
        expect(FetchForecastData).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.queryByText("Forecast:")).not.toBeInTheDocument();
      });
    });

    it("should handle single year of data", async () => {
      vi.mocked(FetchTrendGraphData).mockResolvedValueOnce({
        increase_per_year: 0,
        trendline_pets: [25],
        year_pets: [25],
        years: [2023],
      });

      render(<TrendAnalysis {...defaultProps} />);

      await waitFor(() => {
        expect(getHeatStressDescription).toHaveBeenCalledWith(
          25,
          "avg",
          2023,
          "Annual",
        );
      });
    });

    it("should not fetch forecast when measure is not avg even if enabled", async () => {
      render(<TrendAnalysis {...defaultProps} initialGraphMeasure="max" />);

      await waitFor(() => {
        expect(FetchTrendGraphData).toHaveBeenCalledWith("max", 1, "Annual");
      });

      expect(FetchForecastData).not.toHaveBeenCalled();
    });

    it("should have correct select options", async () => {
      render(<TrendAnalysis {...defaultProps} />);
      await waitForInitialTrendAnalysisRender();

      const select = screen.getByLabelText("Graph Measure");
      const options = select.querySelectorAll("option");

      expect(options).toHaveLength(2);
      expect(options[0]).toHaveValue("avg");
      expect(options[1]).toHaveValue("max");
    });

    it("should have default measure selected", async () => {
      render(<TrendAnalysis {...defaultProps} initialGraphMeasure="avg" />);
      await waitForInitialTrendAnalysisRender();

      const select = screen.getByLabelText("Graph Measure");
      expect(select).toHaveValue("avg");
    });
  });
});
