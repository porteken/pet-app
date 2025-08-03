import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Page from "../page";

const mockHome = vi.fn(() => (
  <div data-testid="home-component">Home Component</div>
));
vi.mock("@/features/home/home-main", () => ({
  default: mockHome,
}));

const mockGetGraphMeasureFromCookies = vi.fn();
const mockGetLocationData = vi.fn();
vi.mock("@/lib/utils/app/page-helpers", () => ({
  getGraphMeasureFromCookies: mockGetGraphMeasureFromCookies,
  getLocationData: mockGetLocationData,
}));

const mockLocationErrorHandler = vi.fn(() => (
  <div data-testid="error-handler">Error Handler</div>
));
vi.mock("@/components/app/error-handlers", () => ({
  LocationErrorHandler: mockLocationErrorHandler,
}));

const mockPageLoader = vi.fn(() => (
  <div data-testid="page-loader">Loading...</div>
));
vi.mock("@/components/app/page-loader", () => ({
  PageLoader: mockPageLoader,
}));

vi.mock("next/dynamic", () => ({
  default: vi.fn((_importFunction, options) => {
    const DynamicComponent = (_properties: any) => {
      if (options?.loading) {
        return mockHome();
      }
      return mockHome();
    };
    DynamicComponent.displayName = "DynamicHome";
    return DynamicComponent;
  }),
}));

describe("Page Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Home component with correct props when data is available", async () => {
    const mockLocationData = {
      LocationOptions: [
        { label: "Location 1", value: "1" },
        { label: "Location 2", value: "2" },
      ],
      locations: [
        { id: 1, lat: 40.7128, lng: -74.006, name: "Location 1" },
        { id: 2, lat: 34.0522, lng: -118.2437, name: "Location 2" },
      ],
    };

    mockGetGraphMeasureFromCookies.mockResolvedValue("temperature");
    mockGetLocationData.mockResolvedValue(mockLocationData);

    render(await Page());

    expect(screen.getByTestId("home-component")).toBeInTheDocument();
    expect(mockHome).toHaveBeenCalledWith({
      initialGraphMeasure: "temperature",
      LocationOptions: mockLocationData.LocationOptions,
      locations: mockLocationData.locations,
    });
  });

  it("renders error handler when getLocationData throws error", async () => {
    const error = new Error("Failed to fetch locations");

    mockGetGraphMeasureFromCookies.mockResolvedValue("humidity");
    mockGetLocationData.mockRejectedValue(error);

    render(await Page());

    expect(screen.getByTestId("error-handler")).toBeInTheDocument();
    expect(mockLocationErrorHandler).toHaveBeenCalledWith({ error });
    expect(mockHome).not.toHaveBeenCalled();
  });

  it("renders error handler when getGraphMeasureFromCookies throws error", async () => {
    const error = new Error("Cookie access failed");

    mockGetGraphMeasureFromCookies.mockRejectedValue(error);
    mockGetLocationData.mockResolvedValue({
      LocationOptions: [],
      locations: [],
    });

    render(await Page());

    expect(screen.getByTestId("error-handler")).toBeInTheDocument();
    expect(mockLocationErrorHandler).toHaveBeenCalledWith({ error });
    expect(mockHome).not.toHaveBeenCalled();
  });

  it("calls page helper functions in correct order", async () => {
    const mockLocationData = {
      LocationOptions: [{ label: "Location 1", value: "1" }],
      locations: [{ id: 1, lat: 0, lng: 0, name: "Location 1" }],
    };

    mockGetGraphMeasureFromCookies.mockResolvedValue("pressure");
    mockGetLocationData.mockResolvedValue(mockLocationData);

    render(await Page());

    expect(mockGetGraphMeasureFromCookies).toHaveBeenCalledBefore(
      mockGetLocationData as any
    );
    expect(mockGetGraphMeasureFromCookies).toHaveBeenCalledTimes(1);
    expect(mockGetLocationData).toHaveBeenCalledTimes(1);
  });

  it("handles different graph measure values", async () => {
    const testCases = ["temperature", "humidity", "pressure", "wind_speed"];
    const mockLocationData = {
      LocationOptions: [{ label: "Location 1", value: "1" }],
      locations: [{ id: 1, lat: 0, lng: 0, name: "Location 1" }],
    };

    for (const graphMeasure of testCases) {
      vi.clearAllMocks();
      mockGetGraphMeasureFromCookies.mockResolvedValue(graphMeasure);
      mockGetLocationData.mockResolvedValue(mockLocationData);

      render(await Page());

      expect(mockHome).toHaveBeenCalledWith({
        initialGraphMeasure: graphMeasure,
        LocationOptions: mockLocationData.LocationOptions,
        locations: mockLocationData.locations,
      });
    }
  });

  it("handles empty location data appropriately", async () => {
    const emptyLocationData = {
      LocationOptions: [],
      locations: [],
    };

    mockGetGraphMeasureFromCookies.mockResolvedValue("temperature");
    mockGetLocationData.mockResolvedValue(emptyLocationData);

    render(await Page());

    expect(screen.getByTestId("home-component")).toBeInTheDocument();
    expect(mockHome).toHaveBeenCalledWith({
      initialGraphMeasure: "temperature",
      LocationOptions: [],
      locations: [],
    });
  });

  it("handles various error types correctly", async () => {
    const errorTypes = [
      new Error("Network error"),
      new TypeError("Type error"),
      new ReferenceError("Reference error"),
      { message: "Custom error object" },
    ];

    for (const error of errorTypes) {
      vi.clearAllMocks();
      mockGetGraphMeasureFromCookies.mockResolvedValue("temperature");
      mockGetLocationData.mockRejectedValue(error);

      render(await Page());

      expect(screen.getByTestId("error-handler")).toBeInTheDocument();
      expect(mockLocationErrorHandler).toHaveBeenCalledWith({ error });
      expect(mockHome).not.toHaveBeenCalled();
    }
  });

  it("preserves error object type when passing to error handler", async () => {
    const customError = new Error("Custom error");
    customError.name = "CustomError";

    mockGetGraphMeasureFromCookies.mockResolvedValue("temperature");
    mockGetLocationData.mockRejectedValue(customError);

    render(await Page());

    expect(mockLocationErrorHandler).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: "Custom error",
        name: "CustomError",
      }),
    });
  });

  it("handles concurrent execution of helper functions", async () => {
    let resolveGraphMeasure: (value: string) => void;
    let resolveLocationData: (value: any) => void;

    const graphMeasurePromise = new Promise<string>(resolve => {
      resolveGraphMeasure = resolve;
    });
    const locationDataPromise = new Promise(resolve => {
      resolveLocationData = resolve;
    });

    mockGetGraphMeasureFromCookies.mockReturnValue(graphMeasurePromise);
    mockGetLocationData.mockReturnValue(locationDataPromise);

    const pagePromise = Page();

    resolveLocationData!({
      LocationOptions: [{ label: "Location 1", value: "1" }],
      locations: [{ id: 1, lat: 0, lng: 0, name: "Location 1" }],
    });
    resolveGraphMeasure!("humidity");

    render(await pagePromise);

    expect(screen.getByTestId("home-component")).toBeInTheDocument();
    expect(mockHome).toHaveBeenCalledWith({
      initialGraphMeasure: "humidity",
      LocationOptions: [{ label: "Location 1", value: "1" }],
      locations: [{ id: 1, lat: 0, lng: 0, name: "Location 1" }],
    });
  });

  it("renders with large datasets", async () => {
    const manyLocations = Array.from({ length: 100 }, (_, index) => ({
      id: index + 1,
      lat: Math.random() * 180 - 90,
      lng: Math.random() * 360 - 180,
      name: `Location ${index + 1}`,
    }));

    const manyLocationOptions = manyLocations.map(loc => ({
      label: loc.name,
      value: loc.id.toString(),
    }));

    const largeLocationData = {
      LocationOptions: manyLocationOptions,
      locations: manyLocations,
    };

    mockGetGraphMeasureFromCookies.mockResolvedValue("temperature");
    mockGetLocationData.mockResolvedValue(largeLocationData);

    render(await Page());

    expect(screen.getByTestId("home-component")).toBeInTheDocument();
    expect(mockHome).toHaveBeenCalledWith({
      initialGraphMeasure: "temperature",
      LocationOptions: manyLocationOptions,
      locations: manyLocations,
    });
  });

  it("maintains component structure with dynamic import", async () => {
    const mockLocationData = {
      LocationOptions: [{ label: "Location 1", value: "1" }],
      locations: [{ id: 1, lat: 0, lng: 0, name: "Location 1" }],
    };

    mockGetGraphMeasureFromCookies.mockResolvedValue("temperature");
    mockGetLocationData.mockResolvedValue(mockLocationData);

    const result = await Page();
    render(result);

    expect(screen.getByTestId("home-component")).toBeInTheDocument();

    expect(mockHome).toHaveBeenCalledTimes(1);
  });
});

describe("Page Component TypeScript Types", () => {
  it("has correct return type", async () => {
    const mockLocationData = {
      LocationOptions: [{ label: "Location 1", value: "1" }],
      locations: [{ id: 1, lat: 0, lng: 0, name: "Location 1" }],
    };

    mockGetGraphMeasureFromCookies.mockResolvedValue("temperature");
    mockGetLocationData.mockResolvedValue(mockLocationData);

    const result = await Page();

    expect(result).toBeDefined();
    expect(typeof result).toBe("object");
  });

  it("handles async function correctly", async () => {
    const mockLocationData = {
      LocationOptions: [{ label: "Location 1", value: "1" }],
      locations: [{ id: 1, lat: 0, lng: 0, name: "Location 1" }],
    };

    mockGetGraphMeasureFromCookies.mockResolvedValue("temperature");
    mockGetLocationData.mockResolvedValue(mockLocationData);

    const pagePromise = Page();
    expect(pagePromise).toBeInstanceOf(Promise);

    const result = await pagePromise;
    expect(result).toBeDefined();
  });
});
