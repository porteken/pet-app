import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/graph", () => ({
  GenerateReferenceGraph: mockFn().mockReturnValue(
    <div data-testid="reference-graph" />,
  ),
  GenerateTrendGraph: mockFn().mockReturnValue(
    <div data-testid="trend-graph" />,
  ),
}));

vi.mock("@/features/header-bar", () => ({
  HeaderBar: mockFn(
    ({ id, LocationOptions }: { id?: number; LocationOptions?: unknown[] }) => (
      <header
        data-id={id}
        data-options={JSON.stringify(LocationOptions)}
        data-testid="header-bar"
      />
    ),
  ),
}));

vi.mock("@/config/supabase/client", () => ({
  default: {},
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: mockFn(),
    push: mockFn(),
    replace: mockFn(),
  }),
  useSearchParams: () => ({
    get: mockFn(),
    toString: mockFn().mockReturnValue(""),
  }),
}));

vi.mock("@/lib/actions/actions", () => ({
  setForecastPreferences: mockFn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/api/fetch-client", () => ({
  FetchForecastData: mockFn().mockResolvedValue(undefined),
  FetchReferenceGraphData: mockFn().mockResolvedValue({
    dates: [new Date("2023-01-01"), new Date("2023-02-01")],
    pets: [10, 20],
  }),
  FetchTrendGraphData: mockFn().mockResolvedValue({
    increase_per_year: 0.5,
    trendline_pets: [5, 10, 15],
    year_pets: [7, 12, 17],
    years: [2020, 2021, 2022],
  }),
}));

import { GenerateReferenceGraph, GenerateTrendGraph } from "@/features/graph";
import {
  FetchReferenceGraphData,
  FetchTrendGraphData,
} from "@/lib/api/fetch-client";

import { PageMain } from "../components/page-main";

let fetchMock: ReturnType<typeof vi.fn>;

describe("pageMain", () => {
  const defaultProps: React.ComponentProps<typeof PageMain> = {
    CurrentDates: [new Date("2023-01-01"), new Date("2023-02-01")],
    CurrentPets: [15, 25],
    IncreasePerYear: 0.5,
    id: 1,
    initialForecastEnabled: false,
    initialForecastYearsAhead: 10,
    initialGraphMeasure: "avg",
    initialGraphSeason: "Annual",
    initialReferenceYear: "2000",
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
    fetchMock = mockFn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
  });

  describe("component Rendering", () => {
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

    it("should render collapsible thermal stress legend popup", async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<PageMain {...defaultProps} />);
      });

      const toggle = screen.getByRole("button", {
        name: "Show Thermal Stress Index",
      });
      expect(toggle).toHaveAttribute("aria-expanded", "false");
      expect(
        screen.queryByRole("heading", { name: "Thermal Stress Index" }),
      ).not.toBeInTheDocument();

      await user.click(toggle);

      expect(toggle).toHaveAttribute("aria-expanded", "true");
      expect(
        screen.getByRole("heading", { name: "Thermal Stress Index" }),
      ).toBeInTheDocument();
    });
  });

  describe("graph Generation", () => {
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
        undefined,
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

  describe("user Interactions", () => {
    it("should change graph measure and persist it through the preferences endpoint", async () => {
      const user = userEvent.setup();
      await act(async () => {
        render(<PageMain {...defaultProps} />);
      });

      const selectElement = screen.getByLabelText("Graph Measure");
      await user.selectOptions(selectElement, "max");

      await waitFor(() => {
        expect(GenerateTrendGraph).toHaveBeenCalled();
      });

      expect(fetchMock).toHaveBeenCalledWith(
        "/api/preferences/graph",
        expect.objectContaining({
          body: JSON.stringify({ graphMeasure: "max" }),
          method: "POST",
        }),
      );
    });

    it("should change reference year and trigger API call when selected", async () => {
      const user = userEvent.setup();
      await act(async () => {
        render(<PageMain {...defaultProps} />);
      });

      const selectElement = screen.getByLabelText("Reference Year");
      await user.selectOptions(selectElement, "2001");

      await waitFor(() => {
        expect(FetchReferenceGraphData).toHaveBeenCalledWith(
          "2001",
          1,
          "Annual",
        );
        expect(GenerateReferenceGraph).toHaveBeenCalled();
      });

      expect(fetchMock).toHaveBeenCalledWith(
        "/api/preferences/graph",
        expect.objectContaining({
          body: JSON.stringify({ referenceYear: "2001" }),
          method: "POST",
        }),
      );
    });

    it("should not refetch the trend graph when reference year changes", async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<PageMain {...defaultProps} />);
      });

      await waitFor(() => {
        expect(GenerateTrendGraph).toHaveBeenCalled();
      });

      expect(FetchTrendGraphData).not.toHaveBeenCalled();

      const selectElement = screen.getByLabelText("Reference Year");
      await user.selectOptions(selectElement, "2021");

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          "/api/preferences/graph",
          expect.objectContaining({
            body: JSON.stringify({ referenceYear: "2021" }),
            method: "POST",
          }),
        );
      });

      expect(FetchTrendGraphData).not.toHaveBeenCalled();
    });

    it("should not refetch reference graph data when graph season changes", async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<PageMain {...defaultProps} />);
      });

      vi.mocked(FetchReferenceGraphData).mockClear();

      const seasonSelect = screen.getByLabelText("Season");
      await user.selectOptions(seasonSelect, "Winter");

      expect(FetchReferenceGraphData).not.toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/preferences/graph",
        expect.objectContaining({
          body: JSON.stringify({ graphSeason: "Winter" }),
          method: "POST",
        }),
      );
    });
  });
});
