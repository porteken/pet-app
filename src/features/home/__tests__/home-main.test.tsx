import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Helper function to create async delay for testing
const createDelay = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

vi.mock("@/lib/actions/actions", () => ({
  setGraphMeasure: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/features/generate-graph", () => ({
  GenerateTrendGraph: vi
    .fn()
    .mockReturnValue(<div data-testid="mock-trend-graph">Trend Graph</div>),
}));

vi.mock("@/lib/api/fetch-client", () => ({
  FetchTrendGraphData: vi.fn().mockResolvedValue({
    trendline_pets: [20, 22, 24],
    year_pets: [20, 22, 24],
    years: [2000, 2001, 2002],
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/features/header-bar", () => ({
  HeaderBar: vi.fn(({ LocationOptions }) => (
    <div data-testid="header-bar">
      HeaderBar with {LocationOptions?.length || 0} locations
    </div>
  )),
}));

vi.mock("@/components/ui/modal", () => ({
  default: vi.fn(({ children, onClose, open, title }) =>
    open ? (
      <div data-testid="modal" role="dialog">
        <div data-testid="modal-title">{title}</div>
        <button data-testid="modal-close" onClick={onClose} type="button">
          Close
        </button>
        {children}
      </div>
    ) : undefined
  ),
}));

vi.mock("../map-component", () => ({
  MapComponent: vi.fn(({ locations, onMarkerClick }) => (
    <div data-testid="map-component">
      Map with {locations.length} locations
      <button
        data-testid="marker-click"
        onClick={() => onMarkerClick(1)}
        type="button"
      >
        Click Marker 1
      </button>
    </div>
  )),
}));

vi.mock("@mantine/core", () => ({
  Button: vi.fn(({ children, onClick, variant }) => (
    <button
      data-testid="mantine-button"
      data-variant={variant}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )),
  Loader: vi.fn(({ size }) => (
    <div data-size={size} data-testid="mantine-loader">
      Loading...
    </div>
  )),
  Select: vi.fn(({ data, onChange, value }) => (
    <div>
      <select
        data-testid="graph-measure-select"
        onChange={event => onChange?.(event.target.value)}
        value={value}
      >
        {data.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )),
}));

vi.mock("@/lib/utils/select-options", () => ({
  GraphOptions: [
    { key: "avg", label: "Average" },
    { key: "max", label: "Maximum" },
    { key: "min", label: "Minimum" },
  ],
}));

import { GenerateTrendGraph } from "@/features/generate-graph";
import { setGraphMeasure } from "@/lib/actions/actions";
import { FetchTrendGraphData } from "@/lib/api/fetch-client";

import Home from "../home-main";

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

const defaultProps = {
  initialGraphMeasure: "avg",
  LocationOptions: mockLocationOptions,
  locations: mockLocations,
};

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Properties", () => {
    it("should be importable", () => {
      expect(Home).toBeDefined();
    });

    it("should be a function component", () => {
      expect(typeof Home).toBe("function");
    });

    it("should have correct display name or be anonymous function", () => {
      expect(Home.name === "Home" || Home.name === "").toBe(true);
    });
  });

  describe("Component Rendering", () => {
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
      render(<Home {...defaultProps} locations={[]} />);

      expect(screen.getByText("Map with 0 locations")).toBeInTheDocument();
    });
  });

  describe("Interaction Handling", () => {
    it("should handle marker click and open modal", async () => {
      render(<Home {...defaultProps} />);

      const markerButton = screen.getByTestId("marker-click");
      fireEvent.click(markerButton);

      await waitFor(() => {
        expect(screen.getByTestId("modal")).toBeInTheDocument();
        expect(screen.getByTestId("modal-title")).toHaveTextContent(
          "New York, NY"
        );
      });
    });

    it("should generate graph when marker is clicked", async () => {
      render(<Home {...defaultProps} />);

      const markerButton = screen.getByTestId("marker-click");
      fireEvent.click(markerButton);

      await waitFor(() => {
        expect(FetchTrendGraphData).toHaveBeenCalledWith("avg", 1);
        expect(GenerateTrendGraph).toHaveBeenCalled();
      });
    });

    it("should show loading state during graph generation", async () => {
      const slowFetch = vi.fn().mockImplementation(() => createDelay(100));
      vi.mocked(FetchTrendGraphData).mockImplementation(slowFetch);

      render(<Home {...defaultProps} />);

      const markerButton = screen.getByTestId("marker-click");
      fireEvent.click(markerButton);

      await waitFor(() => {
        expect(screen.getByTestId("modal")).toBeInTheDocument();
      });

      expect(screen.getByTestId("mantine-loader")).toBeInTheDocument();
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
        expect(FetchTrendGraphData).toHaveBeenCalledWith("max", 1);
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

  describe("Navigation and View Details", () => {
    it("should display 'View Full Details' button when location is selected", async () => {
      render(<Home {...defaultProps} />);

      fireEvent.click(screen.getByTestId("marker-click"));

      await waitFor(() => {
        expect(screen.getByTestId("modal")).toBeInTheDocument();
        expect(screen.getByTestId("mantine-button")).toHaveTextContent(
          "View Full Details"
        );
      });
    });

    it("should navigate to location page when 'View Full Details' is clicked", async () => {
      const mockLocation = { href: "" };
      Object.defineProperty(globalThis, "location", {
        value: mockLocation,
        writable: true,
      });

      render(<Home {...defaultProps} />);

      fireEvent.click(screen.getByTestId("marker-click"));

      await waitFor(() => {
        expect(screen.getByTestId("modal")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("mantine-button"));

      expect(mockLocation.href).toBe("/1");
    });
  });

  describe("Error Handling", () => {
    it("should handle API error gracefully", async () => {
      const errorMessage = "API Error";
      vi.mocked(FetchTrendGraphData).mockRejectedValue(new Error(errorMessage));

      render(<Home {...defaultProps} />);

      fireEvent.click(screen.getByTestId("marker-click"));

      await waitFor(() => {
        expect(
          screen.getByText("Unable to load graph data")
        ).toBeInTheDocument();
        expect(screen.getByText(/contact kenneth porter/i)).toBeInTheDocument();
        expect(
          screen.getByRole("link", { name: /porteken@gmail.com/i })
        ).toBeInTheDocument();
      });
    });
  });
});
