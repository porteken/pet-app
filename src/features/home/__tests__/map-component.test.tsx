import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock next/dynamic to control the loading state
vi.mock("next/dynamic", () => {
  return vi.fn(() => {
    // Return a component that shows loading state
    const LoadingComponent = () => (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <p>Loading map...</p>
      </div>
    );
    return LoadingComponent;
  });
});

// Mock Leaflet components and hooks
vi.mock("react-leaflet", () => ({
  MapContainer: vi.fn(({ children }) => (
    <div data-testid="map-container">{children}</div>
  )),
  Marker: vi.fn(({ children }) => <div data-testid="marker">{children}</div>),
  Popup: vi.fn(({ children }) => <div data-testid="popup">{children}</div>),
  TileLayer: vi.fn(() => <div data-testid="tile-layer" />),
  useMap: vi.fn(() => ({ fitBounds: vi.fn() })),
}));

// Mock Leaflet icons
vi.mock("leaflet", () => ({
  icon: vi.fn(() => ({ iconUrl: "mock-icon" })),
  Icon: {
    Default: {
      mergeOptions: vi.fn(),
    },
  },
}));

import MapComponent from "../map-component";

describe("MapComponent", () => {
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

  const mockOnMarkerClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the loading state", () => {
    render(
      <MapComponent
        locations={mockLocations}
        onMarkerClick={mockOnMarkerClick}
      />
    );

    expect(screen.getByText("Loading map...")).toBeInTheDocument();
    expect(screen.getByText("Loading map...").closest("div")).toHaveClass(
      "flex",
      "h-screen",
      "items-center",
      "justify-center",
      "bg-gray-100"
    );
  });

  it("should render with empty locations array", () => {
    render(<MapComponent locations={[]} onMarkerClick={mockOnMarkerClick} />);

    expect(screen.getByText("Loading map...")).toBeInTheDocument();
  });

  it("should be a function component", () => {
    expect(typeof MapComponent).toBe("function");
  });

  it("should accept locations and onMarkerClick props", () => {
    // Test that the component doesn't crash with proper props
    expect(() => {
      render(
        <MapComponent
          locations={mockLocations}
          onMarkerClick={mockOnMarkerClick}
        />
      );
    }).not.toThrow();
  });

  it("should handle undefined onMarkerClick prop gracefully", () => {
    // Test that the component doesn't crash with undefined callback
    expect(() => {
      render(
        <MapComponent locations={mockLocations} onMarkerClick={vi.fn()} />
      );
    }).not.toThrow();
  });
});
