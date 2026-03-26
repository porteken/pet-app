import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/graph", () => ({
  GenerateReferenceGraph: vi
    .fn()
    .mockImplementation(() => <div data-testid="reference-graph" />),
  GenerateTrendGraph: vi
    .fn()
    .mockImplementation(() => <div data-testid="trend-graph" />),
}));

vi.mock("@/features/header-bar", () => ({
  HeaderBar: vi.fn(({ id, LocationOptions }) => (
    <header
      data-id={id}
      data-options={JSON.stringify(LocationOptions)}
      data-testid="header-bar"
    />
  )),
}));

vi.mock("@/config/supabase/client", () => ({
  default: {},
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
  setGraphMeasure: vi.fn().mockResolvedValue("avg"),
}));

vi.mock("@/lib/api/fetch-client", () => ({
  FetchReferenceGraphData: vi.fn().mockResolvedValue({
    dates: [new Date("2023-01-01"), new Date("2023-02-01")],
    pets: [10, 20],
  }),
  FetchTrendGraphData: vi.fn().mockResolvedValue({
    increase_per_year: 0.5,
    trendline_pets: [5, 10, 15],
    year_pets: [7, 12, 17],
    years: [2020, 2021, 2022],
  }),
}));

import { GenerateReferenceGraph, GenerateTrendGraph } from "@/features/graph";
import { setGraphMeasure } from "@/lib/actions/actions";
import { FetchReferenceGraphData } from "@/lib/api/fetch-client";

import { PageMain } from "../components/page-main";

describe("PageMain", () => {
  const defaultProps = {
    CurrentDates: [new Date("2023-01-01"), new Date("2023-02-01")],
    CurrentPets: [15, 25],
    id: 1,
    initialForecastEnabled: false,
    initialForecastYearsAhead: 10,
    initialGraphMeasure: "avg",
    location: {
      city: "Test City",
      lat: 40.7128,
      lng: -74.006,
      location_id: 1,
      state: "Test State",
    },
    LocationOptions: [
      {
        items: [{ key: 1, title: "Test City" }],
        title: "Test State",
      },
    ],
    ReferencePets: [10, 20],
    TrendlinePets: [5, 10, 15],
    YearPets: [7, 12, 17],
    Years: [2020, 2021, 2022],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("should render the page with title and location information", async () => {
      await act(async () => {
        render(<PageMain {...defaultProps} />);
      });

      expect(screen.getByText("Test City, Test State")).toBeInTheDocument();
      expect(screen.getByText("Trend Analysis")).toBeInTheDocument();
      expect(screen.getByText("Reference Data")).toBeInTheDocument();
    });

    it("should render HeaderBar with correct props", async () => {
      await act(async () => {
        render(<PageMain {...defaultProps} />);
      });

      const headerBar = screen.getByTestId("header-bar");
      expect(headerBar).toBeInTheDocument();
      expect(headerBar).toHaveAttribute("data-id", "1");
    });

    it("should render graph measure select with correct options", async () => {
      await act(async () => {
        render(<PageMain {...defaultProps} />);
      });

      const selectElement = screen.getByLabelText("Graph Measure");
      expect(selectElement).toHaveValue("avg");
      expect(screen.getByText("Average")).toBeInTheDocument();
      expect(screen.getByText("Maximum")).toBeInTheDocument();
    });

    it("should render reference year select with correct options", async () => {
      await act(async () => {
        render(<PageMain {...defaultProps} />);
      });

      const selectElement = screen.getByLabelText("Reference Year");
      expect(selectElement).toHaveValue("2000");
      expect(screen.getByText("2000")).toBeInTheDocument();
      expect(screen.getByText("2022")).toBeInTheDocument();
    });
  });

  describe("Graph Generation", () => {
    it("should generate trend graph on initial render", async () => {
      await act(async () => {
        render(<PageMain {...defaultProps} />);
      });

      await waitFor(() => {
        expect(GenerateTrendGraph).toHaveBeenCalled();
      });
      expect(GenerateTrendGraph).toHaveBeenCalledWith(
        expect.objectContaining({
          forecastData: undefined,
          increasePerYear: 0.5,
          isMobileViewport: false,
          option: "avg",
          showLegend: true,
          trendlinePets: [5, 10, 15],
          yearPets: [7, 12, 17],
          years: [2020, 2021, 2022],
        }),
      );
    });

    it("should generate reference graph on initial render", async () => {
      await act(async () => {
        render(<PageMain {...defaultProps} />);
      });

      await waitFor(() => {
        expect(GenerateReferenceGraph).toHaveBeenCalled();
      });
    });
  });

  describe("User Interactions", () => {
    it("should change graph measure and trigger API call when selected", async () => {
      const user = userEvent.setup();
      await act(async () => {
        render(<PageMain {...defaultProps} />);
      });

      const selectElement = screen.getByLabelText("Graph Measure");
      await user.selectOptions(selectElement, "max");

      await waitFor(() => {
        expect(setGraphMeasure).toHaveBeenCalledWith("max");
        expect(GenerateTrendGraph).toHaveBeenCalled();
      });
    });

    it("should change reference year and trigger API call when selected", async () => {
      const user = userEvent.setup();
      await act(async () => {
        render(<PageMain {...defaultProps} />);
      });

      const selectElement = screen.getByLabelText("Reference Year");
      await user.selectOptions(selectElement, "2001");

      await waitFor(() => {
        expect(FetchReferenceGraphData).toHaveBeenCalledWith("2001", 1);
        expect(GenerateReferenceGraph).toHaveBeenCalled();
      });
    });
  });
});
