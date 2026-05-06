// oxlint-disable-next-line import/no-unassigned-import
import "@testing-library/jest-dom";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type * as TanstackReactQuery from "@tanstack/react-query";

const createDelay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
const mockPush = mockFn();

class MockMapComponent extends React.PureComponent<{
  locations: unknown[];
  onMarkerClick: (locationId: number) => void;
}> {
  private readonly handleMarkerClick = () => {
    this.props.onMarkerClick(1);
  };

  public render(): React.ReactNode {
    const { locations } = this.props;

    return (
      <div data-testid="map-component">
        Map with {locations.length} locations
        <button
          data-testid="marker-click"
          onClick={this.handleMarkerClick}
          type="button"
        >
          Click Marker 1
        </button>
      </div>
    );
  }
}

class MockSelectControl extends React.PureComponent<{
  data: Array<{ label: string; value: string }>;
  label?: string;
  onChange?: (value: string) => void;
  value?: string;
}> {
  private readonly handleChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    this.props.onChange?.(event.target.value);
  };

  public render(): React.ReactNode {
    const { data, label, value } = this.props;

    return (
      <div>
        <select
          data-testid={
            label === "Season" ? "graph-season-select" : "graph-measure-select"
          }
          onChange={this.handleChange}
          value={value}
        >
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

class MockButton extends React.PureComponent<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: string;
}> {
  public render(): React.ReactNode {
    const { children, onClick, variant } = this.props;

    return (
      <button
        data-testid="shadcn-button"
        data-variant={variant}
        onClick={onClick}
        type="button"
      >
        {children}
      </button>
    );
  }
}

const mockQueryClient = {
  fetchQuery: mockFn(async (options: { queryFn: () => unknown }) =>
    options.queryFn(),
  ),
};

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof TanstackReactQuery>();
  return {
    ...actual,
    useQueryClient: () => mockQueryClient,
  };
});

vi.mock("@/lib/actions/actions", () => ({
  setForecastPreferences: mockFn().mockResolvedValue({}),
  setGraphMeasure: mockFn().mockResolvedValue({}),
  setGraphSeason: mockFn().mockResolvedValue({}),
}));

vi.mock("@/features/graph", () => ({
  GenerateTrendGraph: mockFn().mockReturnValue(
    <div data-testid="mock-trend-graph">Trend Graph</div>,
  ),
}));

vi.mock("@/lib/api/fetch-client", () => ({
  FetchForecastData: mockFn().mockResolvedValue({
    forecastValues: [25, 26],
    forecastYears: [2003, 2004],
    lowerBound10: [24, 25],
    upperBound90: [26, 27],
  }),
  FetchTrendGraphData: mockFn().mockResolvedValue({
    increase_per_year: 0.5,
    trendline_pets: [20, 22, 24],
    year_pets: [20, 22, 24],
    years: [2000, 2001, 2002],
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockFn(),
  }),
  useSearchParams: () => ({
    get: mockFn(),
    toString: () => "",
  }),
}));

vi.mock("@/features/header-bar", () => ({
  HeaderBar: mockFn(({ LocationOptions }: { LocationOptions?: unknown[] }) => (
    <div data-testid="header-bar">
      HeaderBar with {LocationOptions?.length || 0} locations
    </div>
  )),
}));

vi.mock("@/components/ui/modal", () => ({
  default: mockFn(
    ({
      children,
      onClose,
      open,
      title,
    }: {
      children?: React.ReactNode;
      onClose?: () => void;
      open?: boolean;
      title?: string;
    }) =>
      open ? (
        <dialog data-testid="modal" open>
          <div data-testid="modal-title">{title}</div>
          <button data-testid="modal-close" onClick={onClose} type="button">
            Close
          </button>
          {children}
        </dialog>
      ) : undefined,
  ),
}));

vi.mock("../components/map-component", () => ({
  MapComponent: mockFn(
    (props: React.ComponentProps<typeof MockMapComponent>) => (
      <MockMapComponent {...props} />
    ),
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: mockFn((props: React.ComponentProps<typeof MockButton>) => (
    <MockButton {...props} />
  )),
}));

vi.mock("@/components/ui/select", () => ({
  Select: mockFn((props: React.ComponentProps<typeof MockSelectControl>) => (
    <MockSelectControl {...props} />
  )),
}));

vi.mock("@/lib/utils/select-options", () => ({
  GraphOptions: [
    { key: "avg", label: "Average" },
    { key: "max", label: "Maximum" },
    { key: "min", label: "Minimum" },
  ],
  SeasonOptions: [
    { key: "Annual", label: "Annual" },
    { key: "Winter", label: "Winter" },
  ],
}));

vi.mock("@/components/app/forecast-controls", () => ({
  ForecastControls: mockFn(
    (props: React.ComponentProps<typeof MockForecastControls>) => (
      <MockForecastControls {...props} />
    ),
  ),
}));

import { GenerateTrendGraph } from "@/features/graph";
import { setGraphMeasure } from "@/lib/actions/actions";
import { FetchForecastData, FetchTrendGraphData } from "@/lib/api/fetch-client";

import Home from "../components/home-main";

const mockLocationOptions = [
  {
    items: [
      { key: 1, title: "New York, NY" },
      { key: 2, title: "Los Angeles, CA" },
    ],
    title: "Major Cities",
  },
];

const mockLocations = [
  {
    city: "New York",
    lat: 40.7128,
    lng: -74.006,
    location_id: 1,
    state: "NY",
  },
  {
    city: "Los Angeles",
    lat: 34.0522,
    lng: -118.2437,
    location_id: 2,
    state: "CA",
  },
];

const emptyLocations: typeof mockLocations = [];

const defaultProps: React.ComponentProps<typeof Home> = {
  initialForecastEnabled: false,
  initialForecastYearsAhead: 10,
  initialGraphMeasure: "avg",
  initialGraphSeason: "Annual",
  LocationOptions: mockLocationOptions,
  locations: mockLocations,
};

describe("home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockReset();
  });

  describe("basic Properties", () => {
    it("should be importable", () => {
      expect(Home).toBeDefined();
    });

    it("should be a function component", () => {
      expect(typeof Home).toBe("function");
    });

    it("should have correct display name or be anonymous function", () => {
      expect(["Home", ""]).toContain(Home.name);
    });
  });

  describe("component Rendering", () => {
    it("should render all main components", () => {
      render(<Home {...defaultProps} />);

      expect(screen.getByTestId("header-bar")).toBeInTheDocument();
      expect(screen.getByTestId("map-component")).toBeInTheDocument();
      expect(screen.getByText("Map with 2 locations")).toBeInTheDocument();
    });

    it("should initialize with correct graph measure", () => {
      render(<Home {...defaultProps} />);

      expect(screen.getByTestId("header-bar")).toBeInTheDocument();
    });

    it("should render without graph initially", () => {
      render(<Home {...defaultProps} />);

      expect(screen.queryByTestId("mock-trend-graph")).not.toBeInTheDocument();
      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });

    it("should handle empty locations array", () => {
      render(<Home {...defaultProps} locations={emptyLocations} />);

      expect(screen.getByText("Map with 0 locations")).toBeInTheDocument();
    });
  });

  describe("interaction Handling", () => {
    it("should handle marker click and open modal", async () => {
      render(<Home {...defaultProps} />);

      const markerButton = screen.getByTestId("marker-click");
      fireEvent.click(markerButton);

      await waitFor(() => {
        expect(screen.getByTestId("modal")).toBeInTheDocument();
        expect(screen.getByTestId("modal-title")).toHaveTextContent(
          "New York, NY",
        );
      });
    });

    it("should generate graph when marker is clicked", async () => {
      render(<Home {...defaultProps} />);

      const markerButton = screen.getByTestId("marker-click");
      fireEvent.click(markerButton);

      await waitFor(() => {
        expect(FetchTrendGraphData).toHaveBeenCalledWith("avg", 1, "Annual");
        expect(GenerateTrendGraph).toHaveBeenCalled();
      });
    });

    it("should show loading state during graph generation", async () => {
      const slowFetch = mockFn().mockReturnValue(createDelay(100));
      vi.mocked(FetchTrendGraphData).mockImplementation(slowFetch);

      render(<Home {...defaultProps} />);

      const markerButton = screen.getByTestId("marker-click");
      fireEvent.click(markerButton);

      await waitFor(() => {
        expect(screen.getByTestId("modal")).toBeInTheDocument();
      });

      expect(screen.getByTestId("graph-loader")).toBeInTheDocument();
      expect(screen.getByText("Loading graph...")).toBeInTheDocument();
    });

    it("should handle graph measure change when a location is selected", async () => {
      render(<Home {...defaultProps} />);

      fireEvent.click(screen.getByTestId("marker-click"));

      await waitFor(() => {
        expect(screen.getByTestId("modal")).toBeInTheDocument();
      });

      const selectElement = screen.getByTestId("graph-measure-select");
      fireEvent.change(selectElement, { target: { value: "max" } });

      await waitFor(() => {
        expect(setGraphMeasure).toHaveBeenCalledWith("max");
        expect(FetchTrendGraphData).toHaveBeenCalledWith("max", 1, "Annual");
      });
    });

    it("should close modal when close button is clicked", async () => {
      render(<Home {...defaultProps} />);

      fireEvent.click(screen.getByTestId("marker-click"));

      await waitFor(() => {
        expect(screen.getByTestId("modal")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("modal-close"));

      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });
  });

  describe("navigation and View Details", () => {
    it("should display 'View Full Details' button when location is selected", async () => {
      render(<Home {...defaultProps} />);

      fireEvent.click(screen.getByTestId("marker-click"));

      await waitFor(() => {
        expect(screen.getByTestId("modal")).toBeInTheDocument();
        expect(screen.getByTestId("shadcn-button")).toHaveTextContent(
          "View Full Details",
        );
      });
    });

    it("should navigate to location page when 'View Full Details' is clicked", async () => {
      render(<Home {...defaultProps} />);

      fireEvent.click(screen.getByTestId("marker-click"));

      await waitFor(() => {
        expect(screen.getByTestId("modal")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("shadcn-button"));

      expect(mockPush).toHaveBeenCalledWith("/1");
    });
  });

  describe("error Handling", () => {
    it("should handle API error gracefully", async () => {
      const errorMessage = "API Error";
      vi.mocked(FetchTrendGraphData).mockRejectedValue(new Error(errorMessage));

      render(<Home {...defaultProps} />);

      fireEvent.click(screen.getByTestId("marker-click"));

      await waitFor(() => {
        expect(
          screen.getByText("Unable to load graph data"),
        ).toBeInTheDocument();
        expect(screen.getByText(/contact kenneth porter/i)).toBeInTheDocument();
        expect(
          screen.getByRole("link", { name: /porteken@gmail.com/i }),
        ).toBeInTheDocument();
      });
    });
  });

  describe("forecast Heat Stress", () => {
    it("should fetch forecast data when forecast is enabled and marker clicked", async () => {
      vi.mocked(FetchForecastData).mockResolvedValue({
        forecastValues: [28, 30, 32],
        forecastYears: [2025, 2026, 2027],
        lowerBound10: [26, 28, 30],
        upperBound90: [30, 32, 34],
      });

      render(<Home {...defaultProps} initialForecastEnabled={true} />);

      fireEvent.click(screen.getByTestId("marker-click"));

      await waitFor(() => {
        expect(screen.getByTestId("modal")).toBeInTheDocument();
      });

      await waitFor(() =>
        expect(FetchForecastData).toHaveBeenCalledWith(1, 10, "Annual"),
      );
    });

    it("should fetch seasonal forecast data when seasonal forecast is enabled", async () => {
      render(
        <Home
          {...defaultProps}
          initialForecastEnabled={true}
          initialGraphSeason="Winter"
        />,
      );

      fireEvent.click(screen.getByTestId("marker-click"));

      await waitFor(() => {
        expect(screen.getByTestId("modal")).toBeInTheDocument();
      });

      await waitFor(() =>
        expect(FetchForecastData).toHaveBeenCalledWith(1, 10, "Winter"),
      );
    });

    it("should fetch forecast when toggling forecast on", async () => {
      vi.mocked(FetchForecastData).mockResolvedValue({
        forecastValues: [28, 30, 32],
        forecastYears: [2025, 2026, 2027],
        lowerBound10: [26, 28, 30],
        upperBound90: [30, 32, 34],
      });

      render(<Home {...defaultProps} />);

      fireEvent.click(screen.getByTestId("marker-click"));

      await waitFor(() => {
        expect(screen.getByTestId("modal")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("forecast-toggle"));

      await waitFor(() => expect(FetchForecastData).toHaveBeenCalled());
    });

    it("should handle forecast data with NaN bounds", async () => {
      vi.mocked(FetchForecastData).mockResolvedValue({
        forecastValues: [28, 30, 32],
        forecastYears: [2025, 2026, 2027],
        lowerBound10: [Number.NaN, Number.NaN, Number.NaN],
        upperBound90: [Number.NaN, Number.NaN, Number.NaN],
      });

      render(<Home {...defaultProps} initialForecastEnabled={true} />);

      fireEvent.click(screen.getByTestId("marker-click"));

      await waitFor(() => {
        expect(screen.getByTestId("modal")).toBeInTheDocument();
      });

      await waitFor(() => expect(FetchForecastData).toHaveBeenCalled());
    });

    it("should handle forecast data with empty arrays", async () => {
      vi.mocked(FetchForecastData).mockResolvedValue({
        forecastValues: [],
        forecastYears: [],
        lowerBound10: [],
        upperBound90: [],
      });

      render(<Home {...defaultProps} initialForecastEnabled={true} />);

      fireEvent.click(screen.getByTestId("marker-click"));

      await waitFor(() => {
        expect(screen.getByTestId("modal")).toBeInTheDocument();
      });

      await waitFor(() => expect(FetchForecastData).toHaveBeenCalled());
    });

    it("should handle forecast with undefined final values", async () => {
      vi.mocked(FetchForecastData).mockResolvedValue({
        forecastValues: [],
        forecastYears: [2025],
        lowerBound10: [20],
        upperBound90: [30],
      });

      render(<Home {...defaultProps} initialForecastEnabled={true} />);

      fireEvent.click(screen.getByTestId("marker-click"));

      await waitFor(() => {
        expect(screen.getByTestId("modal")).toBeInTheDocument();
      });

      await waitFor(() => expect(FetchForecastData).toHaveBeenCalled());
    });
  });

  describe("initial State Handling", () => {
    it("should initialize with forecast enabled from props", async () => {
      render(<Home {...defaultProps} initialForecastEnabled={true} />);

      fireEvent.click(screen.getByTestId("marker-click"));

      await waitFor(() => {
        expect(FetchForecastData).toHaveBeenCalledWith(1, 10, "Annual");
      });
    });

    it("should initialize with different graph measure", async () => {
      render(<Home {...defaultProps} initialGraphMeasure="max" />);

      fireEvent.click(screen.getByTestId("marker-click"));

      await waitFor(() => {
        expect(FetchTrendGraphData).toHaveBeenCalledWith("max", 1, "Annual");
      });
    });

    it("should initialize with custom forecast years ahead", async () => {
      render(
        <Home
          {...defaultProps}
          initialForecastEnabled={true}
          initialForecastYearsAhead={20}
        />,
      );

      fireEvent.click(screen.getByTestId("marker-click"));

      await waitFor(() => {
        expect(FetchForecastData).toHaveBeenCalledWith(1, 20, "Annual");
      });
    });
  });

  describe("empty Data Handling", () => {
    it("should handle empty trend data years array", async () => {
      vi.mocked(FetchTrendGraphData).mockResolvedValue({
        increase_per_year: 0,
        trendline_pets: [],
        year_pets: [],
        years: [],
      });

      render(<Home {...defaultProps} />);

      fireEvent.click(screen.getByTestId("marker-click"));

      await waitFor(() => {
        expect(GenerateTrendGraph).toHaveBeenCalledWith(
          expect.objectContaining({
            trendlinePets: [],
            yearPets: [],
            years: [],
          }),
          undefined,
        );
      });
    });

    it("should handle empty year_pets array", async () => {
      vi.mocked(FetchTrendGraphData).mockResolvedValue({
        increase_per_year: 0,
        trendline_pets: [],
        year_pets: [],
        years: [2000],
      });

      render(<Home {...defaultProps} />);

      fireEvent.click(screen.getByTestId("marker-click"));

      await waitFor(() => {
        expect(GenerateTrendGraph).toHaveBeenCalledWith(
          expect.objectContaining({
            trendlinePets: [],
            yearPets: [],
            years: [2000],
          }),
          undefined,
        );
      });
    });
  });
});
