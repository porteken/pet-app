import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCookies,
  mockFetchLocations,
  mockFetchReferenceGraphData,
  mockFetchTrendGraphData,
} = vi.hoisted(() => ({
  mockCookies: vi.fn(),
  mockFetchLocations: vi.fn(),
  mockFetchReferenceGraphData: vi.fn(),
  mockFetchTrendGraphData: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: mockCookies,
}));

vi.mock("@/lib/api/fetch-server", () => ({
  FetchLocations: mockFetchLocations,
  FetchReferenceGraphData: mockFetchReferenceGraphData,
  FetchTrendGraphData: mockFetchTrendGraphData,
}));

import {
  DEFAULT_FORECAST_ENABLED,
  DEFAULT_FORECAST_YEARS_AHEAD,
  DEFAULT_GRAPH_MEASURE,
  FORECAST_ENABLED_COOKIE_NAME,
  FORECAST_YEARS_AHEAD_COOKIE_NAME,
  GRAPH_MEASURE_COOKIE_NAME,
} from "@/lib/constants";

import { loadLocationPageData } from "../location-page-data";

const createCookieStore = (values: Partial<Record<string, string>>) => ({
  get: (name: string) => {
    const value = values[name];
    return value ? { value } : undefined;
  },
});

describe("loadLocationPageData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookies.mockResolvedValue(createCookieStore({}));
  });

  it("returns an invalid-location result for a non-numeric id", async () => {
    await expect(loadLocationPageData("abc")).resolves.toEqual({
      payload: {
        message: "The provided location ID is not valid.",
        title: "Invalid location ID",
      },
      status: "invalid-location",
    });

    expect(mockCookies).not.toHaveBeenCalled();
    expect(mockFetchLocations).not.toHaveBeenCalled();
  });

  it("returns a database error when locations cannot be loaded", async () => {
    mockFetchLocations.mockRejectedValue(new Error("offline"));

    await expect(loadLocationPageData("7")).resolves.toEqual({
      payload: {
        message: "Unable to connect to the database. Please try again later.",
        title: "Database Connection Error",
      },
      status: "database-error",
    });
  });

  it("returns a no-data database error when the location list is empty", async () => {
    mockFetchLocations.mockResolvedValue({
      LocationOptions: [],
      locations: [],
    });

    await expect(loadLocationPageData("7")).resolves.toEqual({
      payload: {
        message:
          "Location data could not be loaded. The database may be temporarily unavailable.",
        title: "No Data Available",
      },
      status: "database-error",
    });
  });

  it("returns an invalid-location error when the id is not present", async () => {
    mockFetchLocations.mockResolvedValue({
      LocationOptions: [],
      locations: [
        {
          city: "Boston",
          lat: 42.3601,
          lng: -71.0589,
          location_id: 3,
          state: "Massachusetts",
        },
      ],
    });

    await expect(loadLocationPageData("7")).resolves.toEqual({
      payload: {
        message: "The requested location could not be found.",
        title: "Location not found",
      },
      status: "invalid-location",
    });
  });

  it("returns a database error when graph data fetching fails", async () => {
    mockFetchLocations.mockResolvedValue({
      LocationOptions: [],
      locations: [
        {
          city: "Boston",
          lat: 42.3601,
          lng: -71.0589,
          location_id: 7,
          state: "Massachusetts",
        },
      ],
    });
    mockFetchTrendGraphData.mockRejectedValue(new Error("graph failed"));

    await expect(loadLocationPageData("7")).resolves.toEqual({
      payload: {
        message: "Unable to connect to the database. Please try again later.",
        title: "Database Connection Error",
      },
      status: "database-error",
    });
  });

  it("returns the assembled page data using cookie preferences", async () => {
    const currentDates = [new Date("2024-01-01"), new Date("2024-02-01")];
    const locationOptions = [
      {
        items: [{ key: 7, title: "Boston" }],
        title: "Massachusetts",
      },
    ];
    const location = {
      city: "Boston",
      lat: 42.3601,
      lng: -71.0589,
      location_id: 7,
      state: "Massachusetts",
    };

    mockCookies.mockResolvedValue(
      createCookieStore({
        [FORECAST_ENABLED_COOKIE_NAME]: "true",
        [FORECAST_YEARS_AHEAD_COOKIE_NAME]: "25",
        [GRAPH_MEASURE_COOKIE_NAME]: "max",
      })
    );
    mockFetchLocations.mockResolvedValue({
      LocationOptions: locationOptions,
      locations: [location],
    });
    mockFetchTrendGraphData.mockResolvedValue({
      trendline_pets: [28, 29],
      year_pets: [27, 28],
      years: [2023, 2024],
    });
    mockFetchReferenceGraphData
      .mockResolvedValueOnce({
        dates: currentDates,
        pets: [31, 32],
      })
      .mockResolvedValueOnce({
        dates: currentDates,
        pets: [25, 26],
      });

    await expect(loadLocationPageData("7")).resolves.toEqual({
      payload: {
        CurrentDates: currentDates,
        CurrentPets: [31, 32],
        id: 7,
        initialForecastEnabled: true,
        initialForecastYearsAhead: 25,
        initialGraphMeasure: "max",
        location,
        LocationOptions: locationOptions,
        ReferencePets: [25, 26],
        TrendlinePets: [28, 29],
        YearPets: [27, 28],
        Years: [2023, 2024],
      },
      status: "success",
    });

    expect(mockFetchTrendGraphData).toHaveBeenCalledWith("avg", 7);
    expect(mockFetchReferenceGraphData).toHaveBeenNthCalledWith(1, "2024", 7);
    expect(mockFetchReferenceGraphData).toHaveBeenNthCalledWith(2, "2000", 7);
  });

  it("falls back to default preferences and reference year when cookies are invalid", async () => {
    mockCookies.mockResolvedValue(
      createCookieStore({
        [FORECAST_ENABLED_COOKIE_NAME]: "not-true",
        [FORECAST_YEARS_AHEAD_COOKIE_NAME]: "200",
      })
    );
    mockFetchLocations.mockResolvedValue({
      LocationOptions: [],
      locations: [
        {
          city: "Boston",
          lat: 42.3601,
          lng: -71.0589,
          location_id: 7,
          state: "Massachusetts",
        },
      ],
    });
    mockFetchTrendGraphData.mockResolvedValue({
      trendline_pets: [],
      year_pets: [],
      years: [],
    });
    mockFetchReferenceGraphData
      .mockResolvedValueOnce({
        dates: [],
        pets: [],
      })
      .mockResolvedValueOnce({
        dates: [],
        pets: [],
      });

    const result = await loadLocationPageData("7");

    expect(result).toEqual({
      payload: expect.objectContaining({
        initialForecastEnabled: DEFAULT_FORECAST_ENABLED,
        initialForecastYearsAhead: DEFAULT_FORECAST_YEARS_AHEAD,
        initialGraphMeasure: DEFAULT_GRAPH_MEASURE,
      }),
      status: "success",
    });
    expect(mockFetchReferenceGraphData).toHaveBeenNthCalledWith(1, "2024", 7);
  });
});
