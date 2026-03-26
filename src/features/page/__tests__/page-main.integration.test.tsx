import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { setGraphMeasure } from "@/lib/actions/actions";
import { database, resetDatabase } from "@/testing/mocks";

import { PageMain } from "../components/page-main";
import type { PageProperties } from "../model/types";

vi.mock("@/features/graph", () => ({
  GenerateReferenceGraph: vi
    .fn()
    .mockImplementation(() => (
      <div data-testid="reference-graph">Reference Graph</div>
    )),
  GenerateTrendGraph: vi
    .fn()
    .mockImplementation(() => <div data-testid="trend-graph">Trend Graph</div>),
}));

vi.mock("@/features/header-bar", () => ({
  HeaderBar: vi.fn(({ id, LocationOptions }) => (
    <header
      data-id={id}
      data-options={JSON.stringify(LocationOptions)}
      data-testid="header-bar"
    >
      HeaderBar
    </header>
  )),
}));

vi.mock("@/features/page/components/trend-analysis", () => ({
  TrendAnalysis: vi.fn(({ initialGraphMeasure, onMeasureChange }) => (
    <div data-testid="trend-analysis">
      <h2>Trend Analysis</h2>
      <label htmlFor="graph-measure">Graph Measure</label>
      <select
        defaultValue={initialGraphMeasure}
        id="graph-measure"
        onChange={(event) => {
          onMeasureChange(event.currentTarget.value);
        }}
      >
        <option value="avg">Average</option>
        <option value="max">Maximum</option>
      </select>
      <div data-testid="trend-graph">Trend Graph</div>
    </div>
  )),
}));

vi.mock("@/features/page/components/reference-data", () => ({
  ReferenceData: vi.fn(() => (
    <div data-testid="reference-data">
      <h2>Reference Data</h2>
      <label htmlFor="reference-year">Reference Year</label>
      <select defaultValue="2000" id="reference-year">
        {Array.from({ length: 23 }, (_, index) => 2000 + index).map((year) => (
          <option key={year} value={year.toString()}>
            {year}
          </option>
        ))}
      </select>
      <div data-testid="reference-graph">Reference Graph</div>
    </div>
  )),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
    toString: vi.fn().mockReturnValue(""),
  }),
}));

vi.mock("@/lib/actions/actions", () => ({
  setGraphMeasure: vi.fn().mockResolvedValue("max"),
}));

describe("PageMain Integration Tests", () => {
  let defaultProps: PageProperties;

  beforeEach(() => {
    vi.clearAllMocks();
    resetDatabase();

    const location = database.location.create({
      city: "San Francisco",
      location_id: 433,
      state: "California",
    });

    defaultProps = {
      CurrentDates: [new Date("2023-01-01"), new Date("2023-02-01")],
      CurrentPets: [15, 25],
      id: location.location_id,
      initialForecastEnabled: false,
      initialForecastYearsAhead: 10,
      initialGraphMeasure: "avg",
      location,
      LocationOptions: [
        {
          items: [{ key: location.location_id, title: location.city }],
          title: location.state,
        },
      ],
      ReferencePets: [10, 20],
      TrendlinePets: [5, 10, 15],
      YearPets: [7, 12, 17],
      Years: [2020, 2021, 2022],
    };
  });

  describe("Component Integration", () => {
    it("should render with all main sections", async () => {
      render(<PageMain {...defaultProps} />);

      expect(screen.getByTestId("header-bar")).toBeInTheDocument();
      expect(screen.getByText("San Francisco, California")).toBeInTheDocument();
      expect(screen.getByText("Trend Analysis")).toBeInTheDocument();
      expect(screen.getByText("Reference Data")).toBeInTheDocument();
    });

    it("should integrate properly with header bar component", async () => {
      render(<PageMain {...defaultProps} />);

      const headerBar = screen.getByTestId("header-bar");
      expect(headerBar).toHaveAttribute("data-id");

      const dataId = headerBar.dataset.id;
      expect(Number(dataId)).toBeGreaterThan(0);

      const locationOptions = JSON.parse(headerBar.dataset.options || "[]");
      expect(locationOptions).toEqual(defaultProps.LocationOptions);
    });

    it("should handle measure changes through server actions", async () => {
      const user = userEvent.setup();
      render(<PageMain {...defaultProps} />);

      const measureSelect = screen.getByLabelText("Graph Measure");
      expect(measureSelect).toHaveValue("avg");

      await user.selectOptions(measureSelect, "max");
      expect(measureSelect).toHaveValue("max");
    });

    it("should display location information correctly", async () => {
      const customLocation = database.location.create({
        city: "Austin",
        location_id: 20_001,
        state: "Texas",
      });

      const propertiesWithCustomLocation = {
        ...defaultProps,
        id: customLocation.location_id,
        location: customLocation,
      };

      render(<PageMain {...propertiesWithCustomLocation} />);

      expect(screen.getByText("Austin, Texas")).toBeInTheDocument();
    });

    it("should handle reference year selection", async () => {
      const user = userEvent.setup();
      render(<PageMain {...defaultProps} />);

      const yearSelect = screen.getByLabelText("Reference Year");
      expect(yearSelect).toBeInTheDocument();

      expect(screen.getByDisplayValue("2000")).toBeInTheDocument();

      await user.selectOptions(yearSelect, "2021");
      expect(yearSelect).toHaveValue("2021");
    });
  });

  describe("Data Integration", () => {
    it("should pass correct data to trend analysis component", async () => {
      render(<PageMain {...defaultProps} />);

      const trendGraph = screen.getByTestId("trend-graph");
      expect(trendGraph).toBeInTheDocument();
    });

    it("should pass correct data to reference data component", async () => {
      render(<PageMain {...defaultProps} />);

      await waitFor(() => {
        const referenceGraph = screen.getByTestId("reference-graph");
        expect(referenceGraph).toBeInTheDocument();
      });
    });

    it("should handle empty data gracefully", async () => {
      const emptyDataProperties = {
        ...defaultProps,
        CurrentDates: [],
        CurrentPets: [],
        ReferencePets: [],
        TrendlinePets: [],
        YearPets: [],
        Years: [],
      };

      render(<PageMain {...emptyDataProperties} />);

      expect(screen.getByTestId("header-bar")).toBeInTheDocument();
      expect(screen.getByText("San Francisco, California")).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should handle accessibility requirements", async () => {
      render(<PageMain {...defaultProps} />);

      expect(screen.getByLabelText("Graph Measure")).toBeInTheDocument();
      expect(screen.getByLabelText("Reference Year")).toBeInTheDocument();

      expect(screen.getByRole("main")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should handle server action errors gracefully", async () => {
      const user = userEvent.setup();

      vi.mocked(setGraphMeasure).mockRejectedValueOnce(
        new Error("Server error"),
      );

      render(<PageMain {...defaultProps} />);

      const measureSelect = screen.getByLabelText("Graph Measure");

      await user.selectOptions(measureSelect, "max");
      expect(measureSelect).toHaveValue("max");

      await waitFor(() => {
        expect(setGraphMeasure).toHaveBeenCalledWith("max");
      });

      expect(screen.getByTestId("header-bar")).toBeInTheDocument();
      expect(screen.getByTestId("trend-analysis")).toBeInTheDocument();
      expect(screen.getByTestId("reference-data")).toBeInTheDocument();
    });
  });
});
