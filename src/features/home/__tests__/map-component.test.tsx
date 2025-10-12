import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MapComponent } from "../map-component";

vi.mock("react-leaflet", () => {
  interface MockComponentProperties {
    children?: React.ReactNode;
  }
  interface MockMarkerProperties {
    children?: React.ReactNode;
    eventHandlers: { click: () => void };
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
    Popup: ({ children }: MockComponentProperties) => (
      <div data-testid="popup">{children}</div>
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
    },
    Icon: MockIcon,
  };
});

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

  const originalQuerySelector = document.querySelector;

  beforeEach(() => {
    vi.spyOn(document, "querySelector").mockImplementation(
      (selector: string) => {
        if (selector === 'link[href*="leaflet.css"]') {
          return document.createElement("link");
        }
        return originalQuerySelector.call(document, selector);
      }
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should display a loading message on initial render", () => {
    render(<MapComponent locations={[]} onMarkerClick={() => {}} />);
    expect(screen.getByText("Loading map...")).toBeInTheDocument();
  });

  it('should display "No Map Data Available" when no locations are provided', async () => {
    render(<MapComponent locations={[]} onMarkerClick={() => {}} />);

    const noDataMessage = await screen.findByText(/no map data available/i);
    expect(noDataMessage).toBeInTheDocument();

    expect(screen.queryByText("Loading map...")).not.toBeInTheDocument();
  });

  it("should render the map and markers when locations are provided", async () => {
    render(<MapComponent locations={mockLocations} onMarkerClick={() => {}} />);

    await screen.findByTestId("map-container");

    expect(screen.getByTestId("tile-layer")).toBeInTheDocument();
    const markers = screen.getAllByRole("button");
    expect(markers).toHaveLength(mockLocations.length);
    expect(screen.queryByText("Loading map...")).not.toBeInTheDocument();
  });

  it("should call onMarkerClick with the correct location_id when a marker is clicked", async () => {
    const onMarkerClick = vi.fn();
    render(
      <MapComponent locations={mockLocations} onMarkerClick={onMarkerClick} />
    );

    const markers = await screen.findAllByRole("button");

    fireEvent.click(markers[0]);

    expect(onMarkerClick).toHaveBeenCalledTimes(1);
    expect(onMarkerClick).toHaveBeenCalledWith(mockLocations[0].location_id);
  });

  it("should dynamically load the Leaflet CSS if it is not present", async () => {
    vi.spyOn(document, "querySelector").mockImplementation(
      (selector: string) => {
        if (selector === 'link[href*="leaflet.css"]') {
          // eslint-disable-next-line unicorn/no-null
          return null;
        }
        return originalQuerySelector.call(document, selector);
      }
    );

    const appendSpy = vi
      .spyOn(document.head, "append")
      .mockImplementation(node => {
        if (node instanceof Node) {
          setTimeout(() => {
            node.dispatchEvent(new Event("load"));
          }, 10);
        }
      });

    render(<MapComponent locations={mockLocations} onMarkerClick={() => {}} />);

    await screen.findByTestId("map-container");

    expect(appendSpy).toHaveBeenCalledOnce();

    const appendedElement = vi.mocked(appendSpy).mock.calls[0][0];

    expect(appendedElement).toBeInstanceOf(HTMLLinkElement);
    if (appendedElement instanceof HTMLLinkElement) {
      expect(appendedElement.rel).toBe("stylesheet");
      expect(appendedElement.href).toBe(
        "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      );
      expect(appendedElement.integrity).toBe(
        "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      );
      expect(appendedElement.crossOrigin).toBe("");
    }
  });
});
