import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockDatabaseError,
  mockInvalidLocationError,
  mockLoadLocationPageData,
  mockPage,
} = vi.hoisted(() => ({
  mockDatabaseError: vi.fn(
    ({ message, title }: { message: string; title: string }) => (
      <div data-testid="database-error">
        {title}:{message}
      </div>
    )
  ),
  mockInvalidLocationError: vi.fn(
    ({ message, title }: { message: string; title: string }) => (
      <div data-testid="invalid-location-error">
        {title}:{message}
      </div>
    )
  ),
  mockLoadLocationPageData: vi.fn(),
  mockPage: vi.fn((_properties?: unknown) => (
    <div data-testid="location-page">Location Page</div>
  )),
}));

vi.mock("@/components/app/database-error", () => ({
  DatabaseError: mockDatabaseError,
}));

vi.mock("@/features/page/components/invalid-location-error", () => ({
  InvalidLocationError: mockInvalidLocationError,
}));

vi.mock("@/features/page/server/location-page-data", () => ({
  loadLocationPageData: mockLoadLocationPageData,
}));

vi.mock("@/features/page", () => ({
  default: mockPage,
}));

vi.mock("next/dynamic", () => ({
  default: vi.fn(() => mockPage),
}));

import LocationPage from "../page";

describe("location route page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page feature for successful data loads", async () => {
    const payload = {
      CurrentDates: [new Date("2024-01-01")],
      CurrentPets: [30],
      id: 7,
      initialForecastEnabled: false,
      initialForecastYearsAhead: 10,
      initialGraphMeasure: "avg",
      location: {
        city: "Boston",
        lat: 42.3601,
        lng: -71.0589,
        location_id: 7,
        state: "Massachusetts",
      },
      LocationOptions: [],
      ReferencePets: [25],
      TrendlinePets: [20],
      YearPets: [19],
      Years: [2024],
    };

    mockLoadLocationPageData.mockResolvedValue({
      payload,
      status: "success",
    });

    render(await LocationPage({ params: Promise.resolve({ id: "7" }) }));

    expect(mockLoadLocationPageData).toHaveBeenCalledWith("7");
    expect(screen.getByTestId("location-page")).toBeInTheDocument();
    expect(mockPage).toHaveBeenCalledWith(payload, undefined);
  });

  it("renders the database error branch", async () => {
    mockLoadLocationPageData.mockResolvedValue({
      payload: {
        message: "Unable to connect",
        title: "Database Connection Error",
      },
      status: "database-error",
    });

    render(await LocationPage({ params: Promise.resolve({ id: "7" }) }));

    expect(screen.getByTestId("database-error")).toHaveTextContent(
      "Database Connection Error:Unable to connect"
    );
    expect(mockPage).not.toHaveBeenCalled();
  });

  it("renders the invalid location branch", async () => {
    mockLoadLocationPageData.mockResolvedValue({
      payload: {
        message: "Missing location",
        title: "Location not found",
      },
      status: "invalid-location",
    });

    render(await LocationPage({ params: Promise.resolve({ id: "404" }) }));

    expect(screen.getByTestId("invalid-location-error")).toHaveTextContent(
      "Location not found:Missing location"
    );
    expect(mockPage).not.toHaveBeenCalled();
  });
});
