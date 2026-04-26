import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { MapComponent } from "../components/map-component";

vi.mock("react-leaflet", () => {
  interface MockComponentProperties {
    children?: React.ReactNode;
  }
  interface MockMarkerProperties {
    children?: React.ReactNode;
    eventHandlers: { click: () => void; mouseover?: () => void };
    key: number | string;
    position: [number, number];
  }
  return {
    MapContainer: ({ children }: MockComponentProperties) => (
      <div data-testid="map-container">{children}</div>
    ),
    Marker: ({
      children,
      eventHandlers,
      key,
      position,
    }: MockMarkerProperties) => (
      <button
        data-key={key}
        data-position={position.join(",")}
        data-testid="marker"
        onClick={eventHandlers.click}
        type="button"
      >
        {children}
      </button>
    ),
    TileLayer: () => <div data-testid="tile-layer" />,
  };
});

vi.mock("leaflet", () => {
  const MockIcon: any = vi.fn(() => ({}));
  MockIcon.Default = {
    mergeOptions: vi.fn(),
  };

  return {
    __esModule: true,
    default: {
      Icon: MockIcon,
      icon: vi.fn(() => ({})),
    },
    Icon: MockIcon,
    icon: vi.fn(() => ({})),
  };
});

describe("MapComponent", () => {
  const renderWithQueryClient = (ui: React.ReactElement) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    );
  };

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

  it("should display a loading message on initial render", () => {
    renderWithQueryClient(
      <MapComponent
        locations={[]}
        onMarkerClick={() => {}}
        selectedGraphMeasure="avg"
      />,
    );
    expect(screen.getByText("Loading map...")).toBeInTheDocument();
  });

  it('should display "No Map Data Available" when no locations are provided', async () => {
    renderWithQueryClient(
      <MapComponent
        locations={[]}
        onMarkerClick={() => {}}
        selectedGraphMeasure="avg"
      />,
    );

    const noDataMessage = await screen.findByText(/no map data available/i);
    expect(noDataMessage).toBeInTheDocument();

    expect(screen.queryByText("Loading map...")).not.toBeInTheDocument();
  });

  it("should render the map and markers when locations are provided", async () => {
    renderWithQueryClient(
      <MapComponent
        locations={mockLocations}
        onMarkerClick={() => {}}
        selectedGraphMeasure="avg"
      />,
    );

    await screen.findByTestId("map-container");

    expect(screen.getByTestId("tile-layer")).toBeInTheDocument();
    const markers = screen.getAllByTestId("marker");
    expect(markers).toHaveLength(mockLocations.length);
    expect(screen.queryByText("Loading map...")).not.toBeInTheDocument();
  });

  it("should call onMarkerClick with the correct location_id when a marker is clicked", async () => {
    const onMarkerClick = vi.fn();
    renderWithQueryClient(
      <MapComponent
        locations={mockLocations}
        onMarkerClick={onMarkerClick}
        selectedGraphMeasure="avg"
      />,
    );

    const markers = await screen.findAllByTestId("marker");

    fireEvent.click(markers[0]);

    expect(onMarkerClick).toHaveBeenCalledTimes(1);
    expect(onMarkerClick).toHaveBeenCalledWith(mockLocations[0].location_id);
  });

  it("should keep the thermal stress legend collapsed by default and toggle open", async () => {
    renderWithQueryClient(
      <MapComponent
        locations={mockLocations}
        onMarkerClick={() => {}}
        selectedGraphMeasure="avg"
      />,
    );

    await screen.findByTestId("map-container");

    const desktopLegendToggle = screen.getByRole("button", {
      name: "Show Thermal Stress Index",
    });
    expect(desktopLegendToggle).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("heading", { name: "Thermal Stress Index" }),
    ).not.toBeInTheDocument();

    fireEvent.click(desktopLegendToggle);

    expect(desktopLegendToggle).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getAllByRole("heading", { name: "Thermal Stress Index" }).length,
    ).toBeGreaterThan(0);
  });
});
