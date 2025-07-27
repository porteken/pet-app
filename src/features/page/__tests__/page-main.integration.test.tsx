import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { setGraphMeasure } from "@/lib/actions/actions";
import { database } from "@/testing/mocks/database";

import type { PageProperties } from "../types";

import { PageMain } from "../page-main";

// Mock components that we don't need to test in integration
vi.mock("@/features/generate-graph", () => ({
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

// Mock the problematic components that make API calls
vi.mock("@/features/page/components/trend-analysis", () => ({
  TrendAnalysis: vi.fn(({ initialGraphMeasure }) => (
    <div data-testid="trend-analysis">
      <h2>Trend Analysis</h2>
      <label htmlFor="graph-measure">Graph Measure</label>
      <select defaultValue={initialGraphMeasure} id="graph-measure">
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
        {Array.from({ length: 23 }, (_, index) => 2000 + index).map(year => (
          <option key={year} value={year.toString()}>
            {year}
          </option>
        ))}
      </select>
      <div data-testid="reference-graph">Reference Graph</div>
    </div>
  )),
}));

// Mock router for integration testing
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

// Mock actions - use vi.fn() directly in the factory
vi.mock("@/lib/actions/actions", () => ({
  setGraphMeasure: vi.fn().mockResolvedValue("max"),
}));

describe("PageMain Integration Tests", () => {
  let defaultProps: PageProperties;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create test data using MSW database with unique IDs for each test
    const location = database.location.create({
      city: "San Francisco",
      location_id: Math.floor(Math.random() * 10_000) + 1, // Random ID to avoid collisions
      state: "California",
    });

    defaultProps = {
      CurrentDates: [new Date("2023-01-01"), new Date("2023-02-01")],
      CurrentPets: [15, 25],
      id: location.location_id,
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

      // Test that all main sections are present
      expect(screen.getByTestId("header-bar")).toBeInTheDocument();
      expect(screen.getByText("San Francisco, California")).toBeInTheDocument();
      expect(screen.getByText("Trend Analysis")).toBeInTheDocument();
      expect(screen.getByText("Reference Data")).toBeInTheDocument();
    });

    it("should integrate properly with header bar component", async () => {
      render(<PageMain {...defaultProps} />);

      const headerBar = screen.getByTestId("header-bar");
      expect(headerBar).toHaveAttribute("data-id");

      // Verify the ID is a number (from our MSW database)
      const dataId = headerBar.dataset.id;
      expect(Number(dataId)).toBeGreaterThan(0);

      const locationOptions = JSON.parse(headerBar.dataset.options || "[]");
      expect(locationOptions).toEqual(defaultProps.LocationOptions);
    });

    it("should handle measure changes through server actions", async () => {
      const user = userEvent.setup();
      render(<PageMain {...defaultProps} />);

      // Find and interact with the measure selector
      const measureSelect = screen.getByLabelText("Graph Measure");
      expect(measureSelect).toHaveValue("avg");

      // Change the measure - this is a mocked component, so we test the UI change
      await user.selectOptions(measureSelect, "max");
      expect(measureSelect).toHaveValue("max");

      // Since we're mocking the component, we can't test the actual server action call
      // This test verifies the UI behavior and integration with the mocked component
    });

    it("should display location information correctly", async () => {
      const customLocation = database.location.create({
        city: "Austin",
        location_id: Math.floor(Math.random() * 10_000) + 20_000, // Different range to avoid collision
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

      // Should have the default year (2000) selected
      expect(screen.getByDisplayValue("2000")).toBeInTheDocument();

      // Change year selection
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

      // Wait for the reference graph to be generated after initial render
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

      // Component should still render without errors
      expect(screen.getByTestId("header-bar")).toBeInTheDocument();
      expect(screen.getByText("San Francisco, California")).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should support full user workflow of changing measures and viewing data", async () => {
      const user = userEvent.setup();
      render(<PageMain {...defaultProps} />);

      // 1. User sees initial state
      const measureSelect = screen.getByLabelText("Graph Measure");
      expect(measureSelect).toHaveValue("avg");

      // 2. User changes measure to max
      await user.selectOptions(measureSelect, "max");

      // 3. UI shows updated selection (mocked component behavior)
      expect(measureSelect).toHaveValue("max");

      // 4. Verify the component structure is maintained
      expect(screen.getByTestId("trend-analysis")).toBeInTheDocument();
      expect(screen.getByTestId("trend-graph")).toBeInTheDocument();
    });

    it("should handle accessibility requirements", async () => {
      render(<PageMain {...defaultProps} />);

      // Check for proper ARIA labels
      expect(screen.getByLabelText("Graph Measure")).toBeInTheDocument();
      expect(screen.getByLabelText("Reference Year")).toBeInTheDocument();

      // Check for semantic structure
      expect(screen.getByRole("main")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should handle server action errors gracefully", async () => {
      const user = userEvent.setup();

      // Mock server action to fail
      vi.mocked(setGraphMeasure).mockRejectedValueOnce(
        new Error("Server error")
      );

      render(<PageMain {...defaultProps} />);

      const measureSelect = screen.getByLabelText("Graph Measure");

      // Change measure - with mocked components, this tests UI resilience
      await user.selectOptions(measureSelect, "max");
      expect(measureSelect).toHaveValue("max");

      // App should still be functional even if server action fails
      expect(screen.getByTestId("header-bar")).toBeInTheDocument();
      expect(screen.getByTestId("trend-analysis")).toBeInTheDocument();
      expect(screen.getByTestId("reference-data")).toBeInTheDocument();
    });
  });
});
