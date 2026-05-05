/* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
// eslint-disable-next-line import/no-unassigned-import
import "@testing-library/jest-dom";

import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPush = mockFn();

class MockSelectControl extends React.PureComponent<{
  data: Array<{ label: string; value: string }>;
  disabled?: boolean;
  label?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  value?: string;
}> {
  private readonly handleChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    this.props.onChange?.(event.target.value);
  };

  public render(): React.ReactNode {
    const { data, disabled, label, placeholder, value } = this.props;
    const testId = `${label?.toLowerCase().replaceAll(/\s/g, "-") ?? "select"}-select`;

    return (
      <div>
        {label && <label htmlFor={testId}>{label}</label>}
        <select
          data-testid={testId}
          disabled={disabled}
          id={testId}
          onChange={this.handleChange}
          value={value}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {data.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
}

class MockPaginationControl extends React.PureComponent<{
  onChange: (value: number) => void;
  total: number;
  value: number;
}> {
  private readonly handleNext = () => {
    this.props.onChange(Math.min(this.props.total, this.props.value + 1));
  };

  private readonly handlePrevious = () => {
    this.props.onChange(Math.max(1, this.props.value - 1));
  };

  public render(): React.ReactNode {
    const { total, value } = this.props;

    return (
      <div data-testid="pagination">
        <button
          data-testid="prev-page"
          disabled={value <= 1}
          onClick={this.handlePrevious}
          type="button"
        >
          Previous
        </button>
        <span data-testid="current-page">{value}</span>
        <span data-testid="total-pages">{total}</span>
        <button
          data-testid="next-page"
          disabled={value >= total}
          onClick={this.handleNext}
          type="button"
        >
          Next
        </button>
      </div>
    );
  }
}

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: mockFn(),
    toString: () => "",
  }),
}));

vi.mock("@/lib/actions/actions", () => ({
  setRankingsHeatStress: mockFn(),
  setRankingsSeason: mockFn(),
  setRankingsState: mockFn(),
  setRankingsYear: mockFn(),
}));

vi.mock("@/features/header-bar", () => ({
  HeaderBar: mockFn(({ LocationOptions }: { LocationOptions?: unknown[] }) => (
    <div data-testid="header-bar">
      HeaderBar with {LocationOptions?.length || 0} locations
    </div>
  )),
}));

vi.mock("@/components/ui/select", () => ({
  Select: mockFn((props: React.ComponentProps<typeof MockSelectControl>) => (
    <MockSelectControl {...props} />
  )),
}));

vi.mock("@/components/ui/pagination", () => ({
  Pagination: mockFn(
    (props: React.ComponentProps<typeof MockPaginationControl>) => (
      <MockPaginationControl {...props} />
    ),
  ),
}));

import { setRankingsSeason, setRankingsYear } from "@/lib/actions/actions";

import { RankingsMain } from "../components/rankings-main";

const mockLocationOptions = [
  {
    items: [
      { key: 1, title: "New York, NY" },
      { key: 2, title: "Los Angeles, CA" },
    ],
    title: "Major Cities",
  },
];

const createMockRankingItem = (overrides = {}) => ({
  avg_pet: 30.5,
  changeFrom2000: 0.5,
  city: "Test City",
  FutureValueLower: 32,
  FutureValueUpper: 38,
  location_id: 1,
  max_pet: 40.2,
  p10: 25,
  p90: 35,
  rank: 1,
  state: "TX",
  ...overrides,
});

const mockRankings = [
  createMockRankingItem({
    avg_pet: 28,
    city: "Austin",
    location_id: 1,
    max_pet: 38,
    rank: 1,
    state: "TX",
  }),
  createMockRankingItem({
    avg_pet: 30,
    city: "Dallas",
    location_id: 2,
    max_pet: 39,
    rank: 2,
    state: "TX",
  }),
  createMockRankingItem({
    avg_pet: 32,
    city: "Houston",
    location_id: 3,
    max_pet: 40,
    rank: 3,
    state: "TX",
  }),
  createMockRankingItem({
    avg_pet: 35,
    city: "Phoenix",
    location_id: 4,
    max_pet: 42,
    rank: 4,
    state: "AZ",
  }),
  createMockRankingItem({
    avg_pet: 36,
    city: "Tucson",
    location_id: 5,
    max_pet: 43,
    rank: 5,
    state: "AZ",
  }),
  createMockRankingItem({
    avg_pet: 38,
    city: "Miami",
    location_id: 6,
    max_pet: 44,
    rank: 6,
    state: "FL",
  }),
  createMockRankingItem({
    avg_pet: 37,
    city: "Orlando",
    location_id: 7,
    max_pet: 43.5,
    rank: 7,
    state: "FL",
  }),
  createMockRankingItem({
    avg_pet: 25,
    city: "Denver",
    location_id: 8,
    max_pet: 35,
    rank: 8,
    state: "CO",
  }),
  createMockRankingItem({
    avg_pet: 24,
    city: "Boulder",
    location_id: 9,
    max_pet: 34,
    rank: 9,
    state: "CO",
  }),
  createMockRankingItem({
    avg_pet: 28,
    city: "Chicago",
    location_id: 10,
    max_pet: 38,
    rank: 10,
    state: "IL",
  }),
  createMockRankingItem({
    avg_pet: 27,
    city: "Springfield",
    location_id: 11,
    max_pet: 37,
    rank: 11,
    state: "IL",
  }),
  createMockRankingItem({
    avg_pet: 22,
    city: "Seattle",
    location_id: 12,
    max_pet: 32,
    rank: 12,
    state: "WA",
  }),
  createMockRankingItem({
    avg_pet: 23,
    city: "Spokane",
    location_id: 13,
    max_pet: 33,
    rank: 13,
    state: "WA",
  }),
  createMockRankingItem({
    avg_pet: 22.5,
    city: "Portland",
    location_id: 14,
    max_pet: 32.5,
    rank: 14,
    state: "OR",
  }),
  createMockRankingItem({
    avg_pet: 21.5,
    city: "Eugene",
    location_id: 15,
    max_pet: 31.5,
    rank: 15,
    state: "OR",
  }),
  createMockRankingItem({
    avg_pet: 26,
    city: "Boston",
    location_id: 16,
    max_pet: 36,
    rank: 16,
    state: "MA",
  }),
  createMockRankingItem({
    avg_pet: 26.5,
    city: "Cambridge",
    location_id: 17,
    max_pet: 36.5,
    rank: 17,
    state: "MA",
  }),
  createMockRankingItem({
    avg_pet: 29,
    city: "New York",
    location_id: 18,
    max_pet: 39,
    rank: 18,
    state: "NY",
  }),
  createMockRankingItem({
    avg_pet: 27.5,
    city: "Buffalo",
    location_id: 19,
    max_pet: 37.5,
    rank: 19,
    state: "NY",
  }),
  createMockRankingItem({
    avg_pet: 31,
    city: "Los Angeles",
    location_id: 20,
    max_pet: 41,
    rank: 20,
    state: "CA",
  }),
  createMockRankingItem({
    avg_pet: 28.5,
    city: "San Francisco",
    location_id: 21,
    max_pet: 38.5,
    rank: 21,
    state: "CA",
  }),
  createMockRankingItem({
    avg_pet: 30.5,
    city: "San Diego",
    location_id: 22,
    max_pet: 40.5,
    rank: 22,
    state: "CA",
  }),
];

const hotCityRankings = [
  createMockRankingItem({ changeFrom2000: 1.5, city: "Hot City" }),
];

const coolCityRankings = [
  createMockRankingItem({ changeFrom2000: -0.5, city: "Cool City" }),
];

const noDataCityRankings = [
  createMockRankingItem({ changeFrom2000: undefined, city: "No Data City" }),
];

const rangeCityRankings = [
  createMockRankingItem({ city: "Range City", p10: 20.5, p90: 30.5 }),
];

const futureCityRankings = [
  createMockRankingItem({
    city: "Future City",
    FutureValueLower: 35,
    FutureValueUpper: 42,
  }),
];

const noFutureCityRankings = [
  createMockRankingItem({
    city: "No Future City",
    FutureValueLower: undefined,
    FutureValueUpper: undefined,
  }),
];

const stableCityRankings = [
  createMockRankingItem({ changeFrom2000: 0, city: "Stable City" }),
];

const emptyRankings: Array<ReturnType<typeof createMockRankingItem>> = [];
const topFiveRankings = mockRankings.slice(0, 5);

const defaultProps = {
  initialHeatStress: "",
  initialSeason: "Annual" as const,
  initialState: "",
  initialYear: 2020,
  LocationOptions: mockLocationOptions,
  rankings: mockRankings,
  shouldPersistInitialSeason: false,
};

const requireElement = <T extends Element>(element: null | T): T => {
  expect(element).not.toBeNull();
  return element as T;
};

describe("RankingsMain", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockReset();
  });

  describe("Basic Rendering", () => {
    it("should render the component", () => {
      render(<RankingsMain {...defaultProps} />);

      expect(screen.getByTestId("header-bar")).toBeInTheDocument();
      expect(
        screen.getByText("Cities ranked by Average PET"),
      ).toBeInTheDocument();
    });

    it("should render the year select", () => {
      render(<RankingsMain {...defaultProps} />);

      expect(screen.getByTestId("year-select")).toBeInTheDocument();
    });

    it("should render state and thermal stress filters", () => {
      render(<RankingsMain {...defaultProps} />);

      expect(screen.getByTestId("season-select")).toBeInTheDocument();
      expect(screen.getByTestId("state-select")).toBeInTheDocument();
      expect(
        screen.getByTestId("avg-thermal-stress-level-select"),
      ).toBeInTheDocument();
    });

    it("should render the thermal stress legend", () => {
      render(<RankingsMain {...defaultProps} />);

      expect(screen.getByText("Thermal Stress Index")).toBeInTheDocument();
      const legendSection = requireElement(
        screen.getByText("Thermal Stress Index").closest("div"),
      );
      expect(
        within(legendSection).getByText("Extreme Cold Stress"),
      ).toBeInTheDocument();
      expect(
        within(legendSection).getByText("Strong Cold Stress"),
      ).toBeInTheDocument();
      expect(
        within(legendSection).getByText("Moderate Cold Stress"),
      ).toBeInTheDocument();
      expect(
        within(legendSection).getByText("Slight Cold Stress"),
      ).toBeInTheDocument();
      expect(
        within(legendSection).getByText("No Thermal Stress"),
      ).toBeInTheDocument();
      expect(
        within(legendSection).getByText("Slight Heat Stress"),
      ).toBeInTheDocument();
      expect(
        within(legendSection).getByText("Moderate Heat Stress"),
      ).toBeInTheDocument();
      expect(
        within(legendSection).getByText("Strong Heat Stress"),
      ).toBeInTheDocument();
      expect(
        within(legendSection).getByText("Extreme Heat Stress"),
      ).toBeInTheDocument();
    });

    it("should render table headers", () => {
      render(<RankingsMain {...defaultProps} />);

      const table = screen.getByRole("table");
      expect(within(table).getByText("Rank")).toBeInTheDocument();
      expect(within(table).getByText("City")).toBeInTheDocument();
      expect(within(table).getByText("Avg PET")).toBeInTheDocument();
      expect(within(table).getByText("Max PET")).toBeInTheDocument();
      expect(
        within(table).getByText("PET Range (10th-90th percentile)"),
      ).toBeInTheDocument();
      expect(within(table).getByText("Change from 2000")).toBeInTheDocument();
      expect(
        within(table).getByText("2100 Forecast Range"),
      ).toBeInTheDocument();
    });

    it("should render ranking items", () => {
      render(<RankingsMain {...defaultProps} />);

      expect(screen.getByText("Austin")).toBeInTheDocument();
      expect(screen.getByText("Dallas")).toBeInTheDocument();
    });
  });

  describe("Year Selection", () => {
    it("should initialize with the initial year", () => {
      render(<RankingsMain {...defaultProps} />);

      const yearSelect = screen.getByTestId("year-select");
      expect(yearSelect).toHaveValue("2020");
    });

    it("should call setRankingsYear when year changes", async () => {
      render(<RankingsMain {...defaultProps} />);

      const yearSelect = screen.getByTestId("year-select");
      fireEvent.change(yearSelect, { target: { value: "2025" } });

      await waitFor(() => {
        expect(setRankingsYear).toHaveBeenCalledWith(2025);
      });
    });

    it("should call setRankingsSeason when season changes", async () => {
      render(<RankingsMain {...defaultProps} />);

      const seasonSelect = screen.getByTestId("season-select");
      fireEvent.change(seasonSelect, { target: { value: "Winter" } });

      await waitFor(() => {
        expect(setRankingsSeason).toHaveBeenCalledWith("Winter");
      });
    });

    it("should persist the default annual season when requested", async () => {
      render(
        <RankingsMain
          {...defaultProps}
          initialSeason="Annual"
          shouldPersistInitialSeason
        />,
      );

      await waitFor(() => {
        expect(setRankingsSeason).toHaveBeenCalledWith("Annual");
      });
    });
  });

  describe("State Filtering", () => {
    it("should show all states in the filter dropdown", () => {
      render(<RankingsMain {...defaultProps} />);

      expect(screen.getByRole("option", { name: "All states" })).toBeVisible();
    });

    it("should filter rankings by state", () => {
      render(<RankingsMain {...defaultProps} />);

      expect(screen.getByText("Austin")).toBeInTheDocument();
      expect(screen.getByText("Phoenix")).toBeInTheDocument();

      const stateSelect = screen.getByTestId("state-select");
      fireEvent.change(stateSelect, { target: { value: "TX" } });

      expect(screen.getByText("Austin")).toBeInTheDocument();
    });
  });

  describe("Thermal Stress Filtering", () => {
    it("should filter rankings by thermal stress level", () => {
      render(<RankingsMain {...defaultProps} />);

      const heatStressSelect = screen.getByTestId(
        "avg-thermal-stress-level-select",
      );
      fireEvent.change(heatStressSelect, {
        target: { value: "No Thermal Stress" },
      });

      expect(screen.getByText("Seattle")).toBeInTheDocument();
    });
  });

  describe("Sorting", () => {
    it("should sort by rank by default", () => {
      render(<RankingsMain {...defaultProps} />);

      const rows = screen.getAllByRole("row");
      expect(rows[1]).toHaveTextContent("Austin");
    });

    it("should sort by city when city header is clicked", () => {
      render(<RankingsMain {...defaultProps} />);

      const table = screen.getByRole("table");
      const cityHeader = requireElement(
        within(table).getByText("City").closest("th"),
      );
      fireEvent.click(cityHeader);

      const rows = screen.getAllByRole("row");
      expect(rows[1]).toHaveTextContent("Austin");
    });

    it("should show sort indicator when column is clicked", () => {
      render(<RankingsMain {...defaultProps} />);

      const table = screen.getByRole("table");
      const cityHeader = requireElement(
        within(table).getByText("City").closest("th"),
      );
      fireEvent.click(cityHeader);

      expect(within(cityHeader).getByText("↑")).toBeInTheDocument();
    });

    it("should sort by avg_pet when Avg PET header is clicked", () => {
      render(<RankingsMain {...defaultProps} />);

      const table = screen.getByRole("table");
      const avgPetHeader = requireElement(
        within(table).getByText("Avg PET").closest("th"),
      );
      fireEvent.click(avgPetHeader);

      const rows = screen.getAllByRole("row");
      expect(rows[1]).toHaveTextContent("Eugene");
    });

    it("should sort by state when State header is clicked", () => {
      render(<RankingsMain {...defaultProps} />);

      const table = screen.getByRole("table");
      const stateHeader = requireElement(
        within(table).getByText("State").closest("th"),
      );
      fireEvent.click(stateHeader);

      const rows = screen.getAllByRole("row");
      expect(rows[1]).toHaveTextContent("AZ");
    });

    it("should sort by change when Change from 2000 header is clicked", () => {
      render(<RankingsMain {...defaultProps} />);

      const table = screen.getByRole("table");
      const changeHeader = requireElement(
        within(table).getByText("Change from 2000").closest("th"),
      );
      fireEvent.click(changeHeader);

      expect(changeHeader).toBeInTheDocument();
    });
  });

  describe("Pagination", () => {
    it("should display pagination when there are multiple pages", () => {
      render(<RankingsMain {...defaultProps} rankings={mockRankings} />);

      expect(screen.getByTestId("pagination")).toBeInTheDocument();
    });

    it("should not display pagination when there is only one page", () => {
      render(
        <RankingsMain {...defaultProps} rankings={mockRankings.slice(0, 10)} />,
      );

      expect(screen.queryByTestId("pagination")).not.toBeInTheDocument();
    });

    it("should change page when pagination is used", () => {
      render(<RankingsMain {...defaultProps} rankings={mockRankings} />);

      fireEvent.click(screen.getByTestId("next-page"));

      expect(screen.getByTestId("current-page")).toHaveTextContent("2");
    });

    it("should display showing text with correct counts", () => {
      render(<RankingsMain {...defaultProps} rankings={mockRankings} />);

      expect(screen.getByText(/Showing/)).toBeInTheDocument();
      expect(screen.getByText(/of 22 cities/)).toBeInTheDocument();
    });

    it("should reset to page 1 when filters change", () => {
      render(<RankingsMain {...defaultProps} rankings={mockRankings} />);

      fireEvent.click(screen.getByTestId("next-page"));
      expect(screen.getByTestId("current-page")).toHaveTextContent("2");

      const heatStressSelect = screen.getByTestId(
        "avg-thermal-stress-level-select",
      );
      fireEvent.change(heatStressSelect, {
        target: { value: "Extreme Heat Stress" },
      });

      expect(screen.getByText(/Showing/)).toBeInTheDocument();
    });
  });

  describe("Row Click Navigation", () => {
    it("should navigate to location page when row is clicked", () => {
      render(<RankingsMain {...defaultProps} />);

      const row = requireElement(screen.getByText("Austin").closest("tr"));
      fireEvent.click(row);

      expect(mockPush).toHaveBeenCalledWith("/1");
    });
  });

  describe("Data Display", () => {
    it("should display change from 2000 with positive indicator", () => {
      render(<RankingsMain {...defaultProps} rankings={hotCityRankings} />);

      expect(screen.getByText("+1.5°C")).toBeInTheDocument();
    });

    it("should display change from 2000 with negative indicator", () => {
      render(<RankingsMain {...defaultProps} rankings={coolCityRankings} />);

      expect(screen.getByText("-0.5°C")).toBeInTheDocument();
    });

    it("should display N/A for undefined change from 2000", () => {
      render(<RankingsMain {...defaultProps} rankings={noDataCityRankings} />);

      const naElements = screen.getAllByText("N/A");
      expect(naElements.length).toBeGreaterThan(0);
    });

    it("should display PET range correctly", () => {
      render(<RankingsMain {...defaultProps} rankings={rangeCityRankings} />);

      expect(screen.getByText("20.5-30.5°C")).toBeInTheDocument();
    });

    it("should display 2100 forecast range when available", () => {
      render(<RankingsMain {...defaultProps} rankings={futureCityRankings} />);

      expect(screen.getByText("35.0")).toBeInTheDocument();
      expect(screen.getByText("42.0°C")).toBeInTheDocument();
    });

    it("should display N/A for undefined 2100 forecast", () => {
      render(
        <RankingsMain {...defaultProps} rankings={noFutureCityRankings} />,
      );

      const naElements = screen.getAllByText("N/A");
      expect(naElements.length).toBeGreaterThan(0);
    });
  });

  describe("Empty State", () => {
    it("should handle empty rankings array", () => {
      render(<RankingsMain {...defaultProps} rankings={emptyRankings} />);

      expect(
        screen.getByText("Cities ranked by Average PET"),
      ).toBeInTheDocument();
      expect(screen.getByText(/Showing 0/)).toBeInTheDocument();
    });

    it("should show no results message when filter excludes all", () => {
      render(<RankingsMain {...defaultProps} rankings={topFiveRankings} />);

      expect(screen.getByText(/Showing 1-5 of 5 cities/)).toBeInTheDocument();
    });
  });

  describe("Helper Functions", () => {
    it("should apply correct color for positive change values", () => {
      render(<RankingsMain {...defaultProps} rankings={hotCityRankings} />);

      const changeCell = screen.getByText("+1.5°C");
      expect(changeCell).toHaveClass("text-red-600");
    });

    it("should apply correct color for negative change values", () => {
      render(<RankingsMain {...defaultProps} rankings={coolCityRankings} />);

      const changeCell = screen.getByText("-0.5°C");
      expect(changeCell).toHaveClass("text-blue-600");
    });

    it("should apply correct color for zero change values", () => {
      render(<RankingsMain {...defaultProps} rankings={stableCityRankings} />);

      const changeCell = screen.getByText("0.0°C");
      expect(changeCell).toHaveClass("text-gray-600");
    });
  });

  describe("Filter Combination", () => {
    it("should apply state filter correctly", () => {
      render(<RankingsMain {...defaultProps} />);

      const stateSelect = screen.getByTestId("state-select");
      fireEvent.change(stateSelect, { target: { value: "AZ" } });

      expect(screen.getByText("Phoenix")).toBeInTheDocument();
      expect(screen.queryByText("Austin")).not.toBeInTheDocument();
    });
  });

  describe("Filter Reset", () => {
    it("should reset page to 1 when sort column changes", () => {
      render(<RankingsMain {...defaultProps} rankings={mockRankings} />);

      fireEvent.click(screen.getByTestId("next-page"));
      expect(screen.getByTestId("current-page")).toHaveTextContent("2");

      const table = screen.getByRole("table");
      const cityHeader = requireElement(
        within(table).getByText("City").closest("th"),
      );
      fireEvent.click(cityHeader);

      expect(screen.getByTestId("current-page")).toHaveTextContent("1");
    });
  });
});
