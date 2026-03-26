import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetForecastPreferencesFromCookies,
  mockGetGraphMeasureFromCookies,
  mockGetLocationData,
  mockHome,
  mockLocationErrorHandler,
} = vi.hoisted(() => ({
  mockGetForecastPreferencesFromCookies: vi.fn(),
  mockGetGraphMeasureFromCookies: vi.fn(),
  mockGetLocationData: vi.fn(),
  mockHome: vi.fn((_properties?: unknown) => (
    <div data-testid="home-component">Home Component</div>
  )),
  mockLocationErrorHandler: vi.fn(({ error }: { error: Error }) => (
    <div data-testid="error-handler">{error.message}</div>
  )),
}));

vi.mock("@/features/home", () => ({
  default: mockHome,
}));

vi.mock("@/components/app/error-handlers", () => ({
  LocationErrorHandler: mockLocationErrorHandler,
}));

vi.mock("@/components/app/page-loader", () => ({
  PageLoader: () => <div data-testid="page-loader">Loading...</div>,
}));

vi.mock("@/lib/utils/app/page-helpers", () => ({
  getForecastPreferencesFromCookies: mockGetForecastPreferencesFromCookies,
  getGraphMeasureFromCookies: mockGetGraphMeasureFromCookies,
  getLocationData: mockGetLocationData,
}));

vi.mock("next/dynamic", () => ({
  default: vi.fn(() => mockHome),
}));

import Page from "../page";

describe("map page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the home feature with resolved page data", async () => {
    const locationData = {
      LocationOptions: [
        {
          items: [{ key: 1, title: "Boston" }],
          title: "Massachusetts",
        },
      ],
      locations: [
        {
          city: "Boston",
          lat: 42.3601,
          lng: -71.0589,
          location_id: 1,
          state: "Massachusetts",
        },
      ],
    };

    mockGetGraphMeasureFromCookies.mockResolvedValue("max");
    mockGetForecastPreferencesFromCookies.mockResolvedValue({
      enabled: true,
      yearsAhead: 25,
    });
    mockGetLocationData.mockResolvedValue(locationData);

    render(await Page());

    expect(screen.getByTestId("home-component")).toBeInTheDocument();
    expect(mockHome).toHaveBeenCalledWith(
      {
        initialForecastEnabled: true,
        initialForecastYearsAhead: 25,
        initialGraphMeasure: "max",
        LocationOptions: locationData.LocationOptions,
        locations: locationData.locations,
      },
      undefined
    );
  });

  it("renders the location error handler when page loading fails", async () => {
    const error = new Error("cookie lookup failed");

    mockGetGraphMeasureFromCookies.mockRejectedValue(error);

    render(await Page());

    expect(screen.getByTestId("error-handler")).toHaveTextContent("cookie lookup failed");
    expect(mockLocationErrorHandler).toHaveBeenCalledWith({ error }, undefined);
    expect(mockHome).not.toHaveBeenCalled();
  });
});
