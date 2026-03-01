import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetForecastPreferencesFromCookies,
  mockGetGraphMeasureFromCookies,
  mockGetLocationData,
  mockHome,
  mockLocationErrorHandler,
  mockPageLoader,
} = vi.hoisted(() => ({
  mockGetForecastPreferencesFromCookies: vi.fn(),
  mockGetGraphMeasureFromCookies: vi.fn(),
  mockGetLocationData: vi.fn(),
  mockHome: vi.fn((_properties?: any) => (
    <div data-testid="home-component">Home Component</div>
  )),
  mockLocationErrorHandler: vi.fn((_properties?: any) => (
    <div data-testid="error-handler">Error Handler</div>
  )),
  mockPageLoader: vi.fn(() => <div data-testid="page-loader">Loading...</div>),
}));

vi.mock("@/features/home", () => ({
  default: mockHome,
}));

vi.mock("@/lib/utils/app/page-helpers", () => ({
  getForecastPreferencesFromCookies: mockGetForecastPreferencesFromCookies,
  getGraphMeasureFromCookies: mockGetGraphMeasureFromCookies,
  getLocationData: mockGetLocationData,
}));

vi.mock("@/components/app/error-handlers", () => ({
  LocationErrorHandler: mockLocationErrorHandler,
}));

vi.mock("@/components/app/page-loader", () => ({
  PageLoader: mockPageLoader,
}));

vi.mock("next/dynamic", () => ({
  default: vi.fn((_importFunction, options) => {
    const DynamicComponent = (properties: any) => {
      if (options?.loading) {
        return mockHome(properties);
      }
      return mockHome(properties);
    };
    DynamicComponent.displayName = "DynamicHome";
    return DynamicComponent;
  }),
}));

import Page from "../page";

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
    mockGetForecastPreferencesFromCookies.mockResolvedValue({
      enabled: false,
      yearsAhead: 10,
    });
    mockGetLocationData.mockResolvedValue(mockLocationData);

    render(await Page());

    expect(screen.getByTestId("home-component")).toBeInTheDocument();
    expect(mockHome.mock.calls.at(-1)?.[0]).toEqual({
      initialForecastEnabled: false,
      initialForecastYearsAhead: 10,
      initialGraphMeasure: "temperature",
      LocationOptions: mockLocationData.LocationOptions,
      locations: mockLocationData.locations,
    });
  });

  it("renders error handler when getLocationData throws error", async () => {
    const error = new Error("Failed to fetch locations");

    mockGetGraphMeasureFromCookies.mockResolvedValue("humidity");
    mockGetForecastPreferencesFromCookies.mockResolvedValue({
      enabled: false,
      yearsAhead: 10,
    });
    mockGetLocationData.mockRejectedValue(error);

    render(await Page());

    expect(screen.getByTestId("error-handler")).toBeInTheDocument();
    expect(mockLocationErrorHandler.mock.calls.at(-1)?.[0]).toEqual({ error });
    expect(mockHome).not.toHaveBeenCalled();
  });

  it("renders error handler when getGraphMeasureFromCookies throws error", async () => {
    const error = new Error("Cookie access failed");

    mockGetGraphMeasureFromCookies.mockRejectedValue(error);
    mockGetForecastPreferencesFromCookies.mockResolvedValue({
      enabled: false,
      yearsAhead: 10,
    });
    mockGetLocationData.mockResolvedValue({
      LocationOptions: [],
      locations: [],
    });

    render(await Page());

    expect(screen.getByTestId("error-handler")).toBeInTheDocument();
    expect(mockLocationErrorHandler.mock.calls.at(-1)?.[0]).toEqual({ error });
    expect(mockHome).not.toHaveBeenCalled();
  });

  it("calls page helper functions in correct order", async () => {
    const mockLocationData = {
      LocationOptions: [{ label: "Location 1", value: "1" }],
      locations: [{ id: 1, lat: 0, lng: 0, name: "Location 1" }],
    };

    mockGetGraphMeasureFromCookies.mockResolvedValue("pressure");
    mockGetForecastPreferencesFromCookies.mockResolvedValue({
      enabled: false,
      yearsAhead: 10,
    });
    mockGetLocationData.mockResolvedValue(mockLocationData);

    render(await Page());

    expect(mockGetGraphMeasureFromCookies).toHaveBeenCalledBefore(
      mockGetLocationData as any
    );
    expect(mockGetGraphMeasureFromCookies).toHaveBeenCalledTimes(1);
    expect(mockGetForecastPreferencesFromCookies).toHaveBeenCalledTimes(1);
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
      mockGetForecastPreferencesFromCookies.mockResolvedValue({
        enabled: false,
        yearsAhead: 10,
      });
      mockGetLocationData.mockResolvedValue(mockLocationData);

      render(await Page());

      expect(mockHome.mock.calls.at(-1)?.[0]).toEqual({
        initialForecastEnabled: false,
        initialForecastYearsAhead: 10,
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
    mockGetForecastPreferencesFromCookies.mockResolvedValue({
      enabled: false,
      yearsAhead: 10,
    });
    mockGetLocationData.mockResolvedValue(emptyLocationData);

    render(await Page());

    expect(screen.getByTestId("home-component")).toBeInTheDocument();
    expect(mockHome.mock.calls.at(-1)?.[0]).toEqual({
      initialForecastEnabled: false,
      initialForecastYearsAhead: 10,
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
      mockGetForecastPreferencesFromCookies.mockResolvedValue({
        enabled: false,
        yearsAhead: 10,
      });
      mockGetLocationData.mockRejectedValue(error);

      render(await Page());

      expect(screen.getAllByTestId("error-handler").length).toBeGreaterThan(0);
      expect(mockLocationErrorHandler.mock.calls.at(-1)?.[0]).toEqual({
        error,
      });
      expect(mockHome).not.toHaveBeenCalled();
    }
  });

  it("preserves error object type when passing to error handler", async () => {
    const customError = new Error("Custom error");
    customError.name = "CustomError";

    mockGetGraphMeasureFromCookies.mockResolvedValue("temperature");
    mockGetForecastPreferencesFromCookies.mockResolvedValue({
      enabled: false,
      yearsAhead: 10,
    });
    mockGetLocationData.mockRejectedValue(customError);

    render(await Page());

    expect(mockLocationErrorHandler.mock.calls.at(-1)?.[0]).toEqual({
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
    mockGetForecastPreferencesFromCookies.mockResolvedValue({
      enabled: true,
      yearsAhead: 25,
    });
    mockGetLocationData.mockReturnValue(locationDataPromise);

    const pagePromise = Page();

    resolveLocationData!({
      LocationOptions: [{ label: "Location 1", value: "1" }],
      locations: [{ id: 1, lat: 0, lng: 0, name: "Location 1" }],
    });
    resolveGraphMeasure!("humidity");

    render(await pagePromise);

    expect(screen.getByTestId("home-component")).toBeInTheDocument();
    expect(mockHome.mock.calls.at(-1)?.[0]).toEqual({
      initialForecastEnabled: true,
      initialForecastYearsAhead: 25,
      initialGraphMeasure: "humidity",
      LocationOptions: [{ label: "Location 1", value: "1" }],
      locations: [{ id: 1, lat: 0, lng: 0, name: "Location 1" }],
    });
  });

  it("renders with large datasets", async () => {
    const manyLocations = Array.from({ length: 100 }, (_, index) => ({
      id: index + 1,
      lat: ((index * 37) % 180) - 90 + 0.5,
      lng: ((index * 53) % 360) - 180 + 0.5,
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
    mockGetForecastPreferencesFromCookies.mockResolvedValue({
      enabled: false,
      yearsAhead: 10,
    });
    mockGetLocationData.mockResolvedValue(largeLocationData);

    render(await Page());

    expect(screen.getByTestId("home-component")).toBeInTheDocument();
    expect(mockHome.mock.calls.at(-1)?.[0]).toEqual({
      initialForecastEnabled: false,
      initialForecastYearsAhead: 10,
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
    mockGetForecastPreferencesFromCookies.mockResolvedValue({
      enabled: false,
      yearsAhead: 10,
    });
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
    mockGetForecastPreferencesFromCookies.mockResolvedValue({
      enabled: false,
      yearsAhead: 10,
    });
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
    mockGetForecastPreferencesFromCookies.mockResolvedValue({
      enabled: false,
      yearsAhead: 10,
    });
    mockGetLocationData.mockResolvedValue(mockLocationData);

    const pagePromise = Page();
    expect(pagePromise).toBeInstanceOf(Promise);

    const result = await pagePromise;
    expect(result).toBeDefined();
  });
});
