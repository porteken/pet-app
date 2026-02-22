import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/generate-graph", () => ({
  GenerateTrendGraph: vi
    .fn()
    .mockReturnValue(<div data-testid="mock-trend-graph">Trend Graph</div>),
}));

vi.mock("@/lib/api/fetch-client", () => ({
  FetchForecastData: vi.fn().mockResolvedValue({
    forecastValues: [28, 30, 32],
    forecastYears: [2025, 2026, 2027],
    lowerBound10: [26, 28, 30],
    upperBound90: [30, 32, 34],
  }),
  FetchTrendGraphData: vi.fn().mockResolvedValue({
    increase_per_year: 0.5,
    trendline_pets: [20, 22, 24, 26],
    year_pets: [20, 22, 24, 26],
    years: [2020, 2021, 2022, 2023],
  }),
}));

vi.mock("@/lib/utils/heat-stress", () => ({
  getForecastHeatStressDescription: vi.fn((value, year, lower, upper) => ({
    colorClass: "text-red-500",
    confidenceRange: `(range: ${lower}-${upper})`,
    prefix: "Forecast:",
    value: "High",
  })),
  getHeatStressDescription: vi.fn((value, option, year) => ({
    colorClass: "text-orange-500",
    prefix: `${year} Heat Stress:`,
    value: "Moderate",
  })),
}));

vi.mock("@/components/forecast/forecast-controls", () => ({
  ForecastControls: vi.fn(
    ({ enabled, onToggle, onYearsChange, yearsAhead }) => (
      <div data-testid="forecast-controls">
        <button
          data-testid="forecast-toggle"
          onClick={() => onToggle(!enabled)}
          type="button"
        >
          {enabled ? "Disable" : "Enable"} Forecast
        </button>
        <input
          data-testid="forecast-years"
          onChange={event_ => onYearsChange(Number(event_.target.value))}
          type="number"
          value={yearsAhead}
        />
      </div>
    )
  ),
}));

vi.mock("@/lib/actions/actions", () => ({
  setForecastPreferences: vi.fn().mockResolvedValue({}),
}));

import { GenerateTrendGraph } from "@/features/generate-graph";
import { setForecastPreferences } from "@/lib/actions/actions";
import { FetchForecastData, FetchTrendGraphData } from "@/lib/api/fetch-client";
import {
  getForecastHeatStressDescription,
  getHeatStressDescription,
} from "@/lib/utils/heat-stress";

import { TrendAnalysis } from "../trend-analysis";

const defaultProps = {
  id: 1,
  initialForecastEnabled: false,
  initialForecastYearsAhead: 10,
  initialGraphMeasure: "avg",
  onMeasureChange: vi.fn().mockResolvedValue(Promise.resolve()),
};

describe("TrendAnalysis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render trend analysis heading", () => {
      render(<TrendAnalysis {...defaultProps} />);

      expect(screen.getByText("Trend Analysis")).toBeInTheDocument();
    });

    it("should render graph measure select", () => {
      render(<TrendAnalysis {...defaultProps} />);

      expect(screen.getByLabelText("Graph Measure")).toBeInTheDocument();
    });

    it("should render forecast controls when measure is avg", () => {
      render(<TrendAnalysis {...defaultProps} />);

      expect(screen.getByTestId("forecast-controls")).toBeInTheDocument();
    });

    it("should not render forecast controls when measure is max", async () => {
      render(<TrendAnalysis {...defaultProps} initialGraphMeasure="max" />);

      await waitFor(() => {
        expect(
          screen.queryByTestId("forecast-controls")
        ).not.toBeInTheDocument();
      });
    });

    it("should render trend graph", async () => {
      render(<TrendAnalysis {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-trend-graph")).toBeInTheDocument();
      });
    });

    it("should call FetchTrendGraphData on mount", async () => {
      render(<TrendAnalysis {...defaultProps} />);

      await waitFor(() => {
        expect(FetchTrendGraphData).toHaveBeenCalledWith("avg", 1);
      });
    });

    it("should call GenerateTrendGraph with fetched data", async () => {
      render(<TrendAnalysis {...defaultProps} />);

      await waitFor(() => {
        expect(GenerateTrendGraph).toHaveBeenCalledWith(
          [2020, 2021, 2022, 2023],
          "avg",
          [20, 22, 24, 26],
          [20, 22, 24, 26],
          0.5,
          undefined
        );
      });
    });
  });

  describe("Heat Stress Display", () => {
    it("should display current heat stress description", async () => {
      render(<TrendAnalysis {...defaultProps} />);

      await waitFor(() => {
        expect(getHeatStressDescription).toHaveBeenCalledWith(26, "avg", 2023);
      });

      await waitFor(() => {
        expect(screen.getByText("2023 Heat Stress:")).toBeInTheDocument();
        expect(screen.getByText("Moderate")).toBeInTheDocument();
      });
    });

    it("should not display heat stress when years array is empty", async () => {
      vi.mocked(FetchTrendGraphData).mockResolvedValueOnce({
        increase_per_year: 0,
        trendline_pets: [],
        year_pets: [],
        years: [],
      });

      render(<TrendAnalysis {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText("Heat Stress:")).not.toBeInTheDocument();
      });
    });

    it("should display forecast heat stress when forecast is enabled", async () => {
      render(<TrendAnalysis {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId("forecast-controls")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("forecast-toggle"));

      await waitFor(() => {
        expect(FetchForecastData).toHaveBeenCalledWith(1, 10);
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

  describe("Graph Measure Change", () => {
    it("should change measure when select value changes", async () => {
      const onMeasureChange = vi.fn().mockResolvedValue(Promise.resolve());
      render(
        <TrendAnalysis {...defaultProps} onMeasureChange={onMeasureChange} />
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
        expect(FetchTrendGraphData).toHaveBeenCalledWith("avg", 1);
      });

      const select = screen.getByLabelText("Graph Measure");
      fireEvent.change(select, { target: { value: "max" } });

      await waitFor(() => {
        expect(FetchTrendGraphData).toHaveBeenCalledWith("max", 1);
      });
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
          screen.queryByTestId("forecast-controls")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Forecast Controls", () => {
    it("should enable forecast when toggle is clicked", async () => {
      render(<TrendAnalysis {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId("forecast-toggle")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("forecast-toggle"));

      await waitFor(() => {
        expect(FetchForecastData).toHaveBeenCalledWith(1, 10);
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
        expect(FetchForecastData).toHaveBeenCalledWith(1, 15);
      });

      expect(setForecastPreferences).toHaveBeenCalledWith(false, 15);
    });

    it("should initialize forecast controls from cookie-backed props", async () => {
      render(
        <TrendAnalysis
          {...defaultProps}
          initialForecastEnabled={true}
          initialForecastYearsAhead={20}
        />
      );

      await waitFor(() => {
        expect(FetchForecastData).toHaveBeenCalledWith(1, 20);
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
          expect.any(Array),
          "avg",
          expect.any(Array),
          expect.any(Array),
          expect.any(Number),
          expect.objectContaining({
            forecastValues: expect.any(Array),
          })
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

  describe("Error Handling", () => {
    it("should handle API error gracefully", async () => {
      vi.mocked(FetchTrendGraphData).mockRejectedValueOnce(
        new Error("API Error")
      );

      render(<TrendAnalysis {...defaultProps} />);

      await waitFor(() => {
        expect(GenerateTrendGraph).toHaveBeenCalledWith([], "avg", [], [], 0);
      });
    });

    it("should clear heat stress on error", async () => {
      vi.mocked(FetchTrendGraphData).mockRejectedValueOnce(
        new Error("API Error")
      );

      render(<TrendAnalysis {...defaultProps} />);

      await waitFor(() => {
        expect(GenerateTrendGraph).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.queryByText("Heat Stress:")).not.toBeInTheDocument();
      });
    });

    it("should clear forecast heat stress on error", async () => {
      vi.mocked(FetchTrendGraphData).mockRejectedValueOnce(
        new Error("API Error")
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

  describe("Edge Cases", () => {
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
        expect(getHeatStressDescription).toHaveBeenCalledWith(25, "avg", 2023);
      });
    });

    it("should not fetch forecast when measure is not avg even if enabled", async () => {
      render(<TrendAnalysis {...defaultProps} initialGraphMeasure="max" />);

      await waitFor(() => {
        expect(FetchTrendGraphData).toHaveBeenCalledWith("max", 1);
      });

      expect(FetchForecastData).not.toHaveBeenCalled();
    });

    it("should have correct select options", () => {
      render(<TrendAnalysis {...defaultProps} />);

      const select = screen.getByLabelText("Graph Measure");
      const options = select.querySelectorAll("option");

      expect(options).toHaveLength(2);
      expect(options[0]).toHaveValue("avg");
      expect(options[1]).toHaveValue("max");
    });

    it("should have default measure selected", () => {
      render(<TrendAnalysis {...defaultProps} initialGraphMeasure="avg" />);

      const select = screen.getByLabelText("Graph Measure");
      expect(select).toHaveValue("avg");
    });
  });
});
