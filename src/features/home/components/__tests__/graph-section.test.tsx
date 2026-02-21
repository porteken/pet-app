import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("@/components/ui/button", () => ({
  Button: vi.fn(({ children, disabled, onClick }) => (
    <button
      data-testid="view-details-button"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )),
}));

vi.mock("@/components/ui/select", () => ({
  Select: vi.fn(
    ({
      data,
      label,
      onChange,
      value,
    }: {
      data: Array<{ label: string; value: string }>;
      label?: string;
      onChange?: (value: string) => void;
      value?: string;
    }) => (
      <div>
        {label && <label>{label}</label>}
        <select
          data-testid="measure-select"
          onChange={event => onChange?.(event.target.value)}
          value={value}
        >
          {data.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    )
  ),
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

import { GraphSection } from "../graph-section";

const defaultProps = {
  forecastEnabled: false,
  forecastHeatStress: undefined,
  forecastYearsAhead: 10,
  graphLoading: false,
  heatStressDescription: undefined,
  onForecastToggle: vi.fn(),
  onForecastYearsChange: vi.fn(),
  onSelectChange: vi.fn(),
  petGraph: <div data-testid="pet-graph">Mock Graph</div>,
  selectedGraphMeasure: "avg",
  selectedLocation: { city: "New York", location_id: 1, state: "NY" },
  selectOptions: [
    { label: "Average", value: "avg" },
    { label: "Maximum", value: "max" },
  ],
};

describe("GraphSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockReset();
  });

  describe("Basic Rendering", () => {
    it("should render measure select", () => {
      render(<GraphSection {...defaultProps} />);

      expect(screen.getByTestId("measure-select")).toBeInTheDocument();
      expect(screen.getByText("Measure")).toBeInTheDocument();
    });

    it("should render view details button", () => {
      render(<GraphSection {...defaultProps} />);

      expect(screen.getByTestId("view-details-button")).toBeInTheDocument();
      expect(screen.getByText("View Full Details")).toBeInTheDocument();
    });

    it("should render pet graph when provided", () => {
      render(<GraphSection {...defaultProps} />);

      expect(screen.getByTestId("pet-graph")).toBeInTheDocument();
    });

    it("should render forecast controls when measure is avg", () => {
      render(<GraphSection {...defaultProps} selectedGraphMeasure="avg" />);

      expect(screen.getByTestId("forecast-controls")).toBeInTheDocument();
    });

    it("should not render forecast controls when measure is not avg", () => {
      render(<GraphSection {...defaultProps} selectedGraphMeasure="max" />);

      expect(screen.queryByTestId("forecast-controls")).not.toBeInTheDocument();
    });
  });

  describe("Heat Stress Display", () => {
    it("should display heat stress description when provided", () => {
      const heatStressDescription = {
        colorClass: "text-red-500",
        prefix: "Current heat stress:",
        value: "High",
      };

      render(
        <GraphSection
          {...defaultProps}
          heatStressDescription={heatStressDescription}
        />
      );

      expect(screen.getByText("Current heat stress:")).toBeInTheDocument();
      expect(screen.getByText("High")).toBeInTheDocument();
      expect(screen.getByText("High")).toHaveClass("text-red-500");
    });

    it("should not display heat stress section when not provided", () => {
      render(
        <GraphSection {...defaultProps} heatStressDescription={undefined} />
      );

      expect(
        screen.queryByText("Current heat stress:")
      ).not.toBeInTheDocument();
    });

    it("should display forecast heat stress when enabled and provided", () => {
      const heatStressDescription = {
        colorClass: "text-orange-500",
        prefix: "Current:",
        value: "Moderate",
      };
      const forecastHeatStress = {
        colorClass: "text-red-600",
        confidenceRange: "(range: 20-30)",
        prefix: "Forecast:",
        value: "Extreme",
      };

      render(
        <GraphSection
          {...defaultProps}
          forecastEnabled={true}
          forecastHeatStress={forecastHeatStress}
          heatStressDescription={heatStressDescription}
        />
      );

      expect(screen.getByText("Forecast:")).toBeInTheDocument();
      expect(screen.getByText("Extreme")).toBeInTheDocument();
      expect(screen.getByText("(range: 20-30)")).toBeInTheDocument();
    });

    it("should not display forecast heat stress when forecast is disabled", () => {
      const heatStressDescription = {
        colorClass: "text-orange-500",
        prefix: "Current:",
        value: "Moderate",
      };
      const forecastHeatStress = {
        colorClass: "text-red-600",
        confidenceRange: "(range: 20-30)",
        prefix: "Forecast:",
        value: "Extreme",
      };

      render(
        <GraphSection
          {...defaultProps}
          forecastEnabled={false}
          forecastHeatStress={forecastHeatStress}
          heatStressDescription={heatStressDescription}
        />
      );

      expect(screen.queryByText("Forecast:")).not.toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should display loader when graphLoading is true", () => {
      render(<GraphSection {...defaultProps} graphLoading={true} />);

      expect(screen.getByTestId("graph-loader")).toBeInTheDocument();
      expect(screen.getByText("Loading graph...")).toBeInTheDocument();
    });

    it("should not display loader when graphLoading is false", () => {
      render(<GraphSection {...defaultProps} graphLoading={false} />);

      expect(screen.queryByTestId("graph-loader")).not.toBeInTheDocument();
      expect(screen.getByTestId("pet-graph")).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call onSelectChange when measure is changed", () => {
      const onSelectChange = vi.fn();
      render(
        <GraphSection {...defaultProps} onSelectChange={onSelectChange} />
      );

      const select = screen.getByTestId("measure-select");
      fireEvent.change(select, { target: { value: "max" } });

      expect(onSelectChange).toHaveBeenCalledWith("max");
    });

    it("should not call onSelectChange when value is empty", () => {
      const onSelectChange = vi.fn();
      render(
        <GraphSection {...defaultProps} onSelectChange={onSelectChange} />
      );

      const select = screen.getByTestId("measure-select");
      fireEvent.change(select, { target: { value: "" } });

      expect(onSelectChange).not.toHaveBeenCalled();
    });

    it("should call onForecastToggle when forecast toggle is clicked", () => {
      const onForecastToggle = vi.fn();
      render(
        <GraphSection
          {...defaultProps}
          forecastEnabled={false}
          onForecastToggle={onForecastToggle}
          selectedGraphMeasure="avg"
        />
      );

      fireEvent.click(screen.getByTestId("forecast-toggle"));

      expect(onForecastToggle).toHaveBeenCalledWith(true);
    });

    it("should call onForecastYearsChange when years input changes", () => {
      const onForecastYearsChange = vi.fn();
      render(
        <GraphSection
          {...defaultProps}
          onForecastYearsChange={onForecastYearsChange}
          selectedGraphMeasure="avg"
        />
      );

      const input = screen.getByTestId("forecast-years");
      fireEvent.change(input, { target: { value: "15" } });

      expect(onForecastYearsChange).toHaveBeenCalledWith(15);
    });

    it("should navigate to location page when view details is clicked", () => {
      render(<GraphSection {...defaultProps} />);

      fireEvent.click(screen.getByTestId("view-details-button"));

      expect(mockPush).toHaveBeenCalledWith("/1");
    });

    it("should disable view details button when no location selected", () => {
      render(<GraphSection {...defaultProps} selectedLocation={undefined} />);

      expect(screen.getByTestId("view-details-button")).toBeDisabled();
    });

    it("should not navigate when button is disabled", () => {
      render(<GraphSection {...defaultProps} selectedLocation={undefined} />);

      fireEvent.click(screen.getByTestId("view-details-button"));

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should render without pet graph", () => {
      render(<GraphSection {...defaultProps} petGraph={undefined} />);

      expect(screen.getByTestId("view-details-button")).toBeInTheDocument();
    });

    it("should handle missing confidence range in forecast heat stress", () => {
      const heatStressDescription = {
        colorClass: "text-orange-500",
        prefix: "Current:",
        value: "Moderate",
      };
      const forecastHeatStress = {
        colorClass: "text-red-600",
        confidenceRange: undefined,
        prefix: "Forecast:",
        value: "Extreme",
      };

      render(
        <GraphSection
          {...defaultProps}
          forecastEnabled={true}
          forecastHeatStress={forecastHeatStress}
          heatStressDescription={heatStressDescription}
        />
      );

      expect(screen.getByText("Forecast:")).toBeInTheDocument();
      expect(screen.queryByText("(range:")).not.toBeInTheDocument();
    });

    it("should display correct select options", () => {
      render(<GraphSection {...defaultProps} />);

      const select = screen.getByTestId("measure-select");
      const options = select.querySelectorAll("option");

      expect(options).toHaveLength(2);
      expect(options[0]).toHaveValue("avg");
      expect(options[1]).toHaveValue("max");
    });

    it("should have correct default measure selected", () => {
      render(<GraphSection {...defaultProps} selectedGraphMeasure="avg" />);

      const select = screen.getByTestId("measure-select");
      expect(select).toHaveValue("avg");
    });
  });
});
