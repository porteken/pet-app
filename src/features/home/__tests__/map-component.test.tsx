import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MapComponent } from "../map-component";

// --- Mocks ---

// Mock react-leaflet with explicit types and an accessible button for the Marker
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

// Create a robust, type-safe mock for the 'leaflet' module that prevents silent errors.
vi.mock("leaflet", () => {
  // Mock the Icon class constructor `new L.Icon()`
  const MockIcon: any = vi.fn(() => ({}));
  // Mock the static property `L.Icon.Default.mergeOptions`
  MockIcon.Default = {
    mergeOptions: vi.fn(),
  };

  return {
    __esModule: true, // Indicate this is an ES Module
    default: {
      // Handle `L.default`
      Icon: MockIcon,
    },
    Icon: MockIcon, // Handle `L.Icon`
  };
});

// --- Tests ---

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

  // Store the original implementation of querySelector to ensure we don't break anything.
  const originalQuerySelector = document.querySelector;

  beforeEach(() => {
    // This spy bypasses the network-dependent stylesheet loading code.
    vi.spyOn(document, "querySelector").mockImplementation(
      (selector: string) => {
        // If the component is checking for the leaflet CSS...
        if (selector === 'link[href*="leaflet.css"]') {
          // ...trick it by returning a fake element. This makes the `if` check in the
          // component false, skipping the code that hangs the test.
          return document.createElement("link");
        }
        // For ALL OTHER calls, we must use the original implementation to avoid breaking
        // React or Testing Library.
        return originalQuerySelector.call(document, selector);
      }
    );
  });

  afterEach(() => {
    // Restore all mocks to ensure tests are completely isolated.
    vi.restoreAllMocks();
  });

  it("should display a loading message on initial render", () => {
    render(<MapComponent locations={[]} onMarkerClick={() => {}} />);
    expect(screen.getByText("Loading map...")).toBeInTheDocument();
  });

  it('should display "No Map Data Available" when no locations are provided', async () => {
    render(<MapComponent locations={[]} onMarkerClick={() => {}} />);

    // Wait for the final state text to appear. This will now succeed.
    const noDataMessage = await screen.findByText(/no map data available/i);
    expect(noDataMessage).toBeInTheDocument();

    // Assert that the initial loading message is now gone.
    expect(screen.queryByText("Loading map...")).not.toBeInTheDocument();
  });

  it("should render the map and markers when locations are provided", async () => {
    render(<MapComponent locations={mockLocations} onMarkerClick={() => {}} />);

    // Wait for the map container, which appears only after the async load is complete.
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

    // Wait for the markers to be ready before interacting with them.
    const markers = await screen.findAllByRole("button");

    fireEvent.click(markers[0]);

    expect(onMarkerClick).toHaveBeenCalledTimes(1);
    expect(onMarkerClick).toHaveBeenCalledWith(mockLocations[0].location_id);
  });

  it("should dynamically load the Leaflet CSS if it is not present", async () => {
    // --- Setup ---
    // Override the default mock from `beforeEach` for this specific test.
    vi.spyOn(document, "querySelector").mockImplementation(
      (selector: string) => {
        if (selector === 'link[href*="leaflet.css"]') {
          // eslint-disable-next-line unicorn/no-null
          return null; // Simulate that the stylesheet is NOT on the page
        }
        return originalQuerySelector.call(document, selector);
      }
    );

    // Spy on `document.head.append`.
    const appendSpy = vi
      .spyOn(document.head, "append")
      .mockImplementation(node => {
        // FIX: Add a type guard to ensure we only dispatch an event on a Node.
        // This satisfies TypeScript because `.dispatchEvent` does not exist on `string`.
        if (node instanceof Node) {
          // Dispatch the event to resolve the promise inside the component.
          setTimeout(() => {
            node.dispatchEvent(new Event("load"));
          }, 10);
        }
      });

    // --- Act ---
    render(<MapComponent locations={mockLocations} onMarkerClick={() => {}} />);

    // --- Assert ---
    // Wait for the map to finish loading.
    await screen.findByTestId("map-container");

    // Check that `append` was called once.
    expect(appendSpy).toHaveBeenCalledOnce();

    // Check the properties of the appended element.
    const appendedElement = vi.mocked(appendSpy).mock.calls[0][0];

    // Verify it is the correct element with the right properties
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
