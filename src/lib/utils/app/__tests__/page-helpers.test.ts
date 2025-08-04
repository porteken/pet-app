import { beforeEach, describe, expect, it, vi } from "vitest";

import { getGraphMeasureFromCookies, getLocationData } from "../page-helpers";

// Mock Next.js cookies
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

// Mock fetch server
vi.mock("@/lib/api/fetch-server", () => ({
  FetchLocations: vi.fn(),
}));

// Helper function to get the mocked function
async function getMockFetchLocations() {
  const fetchServer = await import("@/lib/api/fetch-server");
  return vi.mocked(fetchServer.FetchLocations);
}

// Mock constants
vi.mock("@/lib/constants/constants", () => ({
  DEFAULT_GRAPH_MEASURE: "temperature",
  ERROR_MESSAGES: {
    NO_DATA: "No location data available",
  },
  GRAPH_MEASURE_COOKIE_NAME: "graph-measure",
}));

describe("page-helpers", () => {
  let mockCookies: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { cookies } = await import("next/headers");
    mockCookies = vi.mocked(cookies);
  });

  describe("getGraphMeasureFromCookies", () => {
    it("returns value from cookie when present", async () => {
      const mockCookieStore = {
        get: vi.fn().mockReturnValue({ value: "humidity" }),
      };
      mockCookies.mockResolvedValue(mockCookieStore);

      const result = await getGraphMeasureFromCookies();

      expect(result).toBe("humidity");
      expect(mockCookies).toHaveBeenCalled();
      expect(mockCookieStore.get).toHaveBeenCalledWith("graph-measure");
    });

    it("returns default value when cookie value is null", async () => {
      const mockCookieStore = {
        get: vi.fn().mockReturnValue({ value: undefined }),
      };
      mockCookies.mockResolvedValue(mockCookieStore);

      const result = await getGraphMeasureFromCookies();

      expect(result).toBe("temperature");
      expect(mockCookies).toHaveBeenCalled();
      expect(mockCookieStore.get).toHaveBeenCalledWith("graph-measure");
    });

    it("returns default value when cookie value is empty string", async () => {
      const mockCookieStore = {
        get: vi.fn().mockReturnValue({ value: "" }),
      };
      mockCookies.mockResolvedValue(mockCookieStore);

      const result = await getGraphMeasureFromCookies();

      expect(result).toBe("temperature");
      expect(mockCookies).toHaveBeenCalled();
      expect(mockCookieStore.get).toHaveBeenCalledWith("graph-measure");
    });

    it("handles different cookie values correctly", async () => {
      const testCases = [
        { cookieValue: "pressure", expected: "pressure" },
        { cookieValue: "wind_speed", expected: "wind_speed" },
        { cookieValue: "visibility", expected: "visibility" },
      ];

      for (const { cookieValue, expected } of testCases) {
        const mockCookieStore = {
          get: vi.fn().mockReturnValue({ value: cookieValue }),
        };
        mockCookies.mockResolvedValue(mockCookieStore);

        const result = await getGraphMeasureFromCookies();

        expect(result).toBe(expected);
      }
    });

    it("handles cookies function rejection", async () => {
      const error = new Error("Cookies unavailable");
      mockCookies.mockRejectedValue(error);

      await expect(getGraphMeasureFromCookies()).rejects.toThrow(
        "Cookies unavailable"
      );
      expect(mockCookies).toHaveBeenCalled();
    });

    it("handles cookie store get method throwing error", async () => {
      const mockCookieStore = {
        get: vi.fn().mockImplementation(() => {
          throw new Error("Cookie access error");
        }),
      };
      mockCookies.mockResolvedValue(mockCookieStore);

      await expect(getGraphMeasureFromCookies()).rejects.toThrow(
        "Cookie access error"
      );
      expect(mockCookies).toHaveBeenCalled();
      expect(mockCookieStore.get).toHaveBeenCalledWith("graph-measure");
    });
  });

  describe("getLocationData", () => {
    it("returns location data when available", async () => {
      const mockLocationData = {
        LocationOptions: [
          {
            items: [
              { key: 1, title: "Location 1" },
              { key: 2, title: "Location 2" },
            ],
            title: "Location Group 1",
          },
        ],
        locations: [
          {
            city: "Location 1",
            lat: 40.7128,
            lng: -74.006,
            location_id: 1,
            state: "NY",
          },
          {
            city: "Location 2",
            lat: 34.0522,
            lng: -118.2437,
            location_id: 2,
            state: "CA",
          },
        ],
      };

      const mockFetchLocations = await getMockFetchLocations();
      mockFetchLocations.mockResolvedValue(mockLocationData);

      const result = await getLocationData();

      expect(result).toEqual(mockLocationData);
      expect(mockFetchLocations).toHaveBeenCalled();
    });

    it("throws error when locations array is empty", async () => {
      const mockLocationData = {
        LocationOptions: [],
        locations: [],
      };

      const mockFetchLocations = await getMockFetchLocations();
      mockFetchLocations.mockResolvedValue(mockLocationData);

      await expect(getLocationData()).rejects.toThrow(
        "No location data available"
      );
      expect(mockFetchLocations).toHaveBeenCalled();
    });

    it("throws error when locations is null", async () => {
      const mockLocationData = {
        LocationOptions: [
          {
            items: [{ key: 1, title: "Location 1" }],
            title: "Location Group 1",
          },
        ],
        locations: [],
      } as any;

      const mockFetchLocations = await getMockFetchLocations();
      mockFetchLocations.mockResolvedValue(mockLocationData);

      await expect(getLocationData()).rejects.toThrow(
        "No location data available"
      );
      expect(mockFetchLocations).toHaveBeenCalled();
    });

    it("throws error when locations is undefined", async () => {
      const mockLocationData = {
        LocationOptions: [
          {
            items: [{ key: 1, title: "Location 1" }],
            title: "Location Group 1",
          },
        ],
        locations: [],
      } as any;

      const mockFetchLocations = await getMockFetchLocations();
      mockFetchLocations.mockResolvedValue(mockLocationData);

      await expect(getLocationData()).rejects.toThrow(
        "No location data available"
      );
      expect(mockFetchLocations).toHaveBeenCalled();
    });

    it("propagates fetch error when FetchLocations fails", async () => {
      const fetchError = new Error("Network error");
      const mockFetchLocations = await getMockFetchLocations();
      mockFetchLocations.mockRejectedValue(fetchError);

      await expect(getLocationData()).rejects.toThrow("Network error");
      expect(mockFetchLocations).toHaveBeenCalled();
    });

    it("handles various valid location data structures", async () => {
      const testCases = [
        {
          data: {
            LocationOptions: [
              {
                items: [{ key: 1, title: "Single Location" }],
                title: "Single Group",
              },
            ],
            locations: [
              {
                city: "Single Location",
                lat: 0,
                lng: 0,
                location_id: 1,
                state: "ST",
              },
            ],
          },
          name: "single location",
        },
        {
          data: {
            LocationOptions: [
              {
                items: [
                  { key: 1, title: "Location 1" },
                  { key: 2, title: "Location 2" },
                  { key: 3, title: "Location 3" },
                ],
                title: "Multiple Group",
              },
            ],
            locations: [
              {
                city: "Location 1",
                lat: 1,
                lng: 1,
                location_id: 1,
                state: "S1",
              },
              {
                city: "Location 2",
                lat: 2,
                lng: 2,
                location_id: 2,
                state: "S2",
              },
              {
                city: "Location 3",
                lat: 3,
                lng: 3,
                location_id: 3,
                state: "S3",
              },
            ],
          },
          name: "multiple locations",
        },
      ];

      const mockFetchLocations = await getMockFetchLocations();

      for (const { data } of testCases) {
        mockFetchLocations.mockClear();
        mockFetchLocations.mockResolvedValue(data);

        const result = await getLocationData();

        expect(result).toEqual(data);
        expect(mockFetchLocations).toHaveBeenCalled();
      }
    });

    it("validates locations length correctly", async () => {
      // Test edge case with exactly one location
      const mockLocationData = {
        LocationOptions: [
          {
            items: [{ key: 1, title: "Single Location" }],
            title: "Single Group",
          },
        ],
        locations: [
          {
            city: "Single Location",
            lat: 0,
            lng: 0,
            location_id: 1,
            state: "ST",
          },
        ],
      };

      const mockFetchLocations = await getMockFetchLocations();
      mockFetchLocations.mockResolvedValue(mockLocationData);

      const result = await getLocationData();

      expect(result).toEqual(mockLocationData);
      expect(mockFetchLocations).toHaveBeenCalled();
    });

    it("handles malformed response structure", async () => {
      // Test when FetchLocations returns unexpected structure
      const malformedData = {
        LocationOptions: [
          {
            items: [{ key: 1, title: "Location 1" }],
            title: "Location Group 1",
          },
        ],
        // Missing locations property
      } as any;

      const mockFetchLocations = await getMockFetchLocations();
      mockFetchLocations.mockResolvedValue(malformedData);

      await expect(getLocationData()).rejects.toThrow(
        "No location data available"
      );
      expect(mockFetchLocations).toHaveBeenCalled();
    });

    it("handles non-array locations", async () => {
      const mockLocationData = {
        LocationOptions: [
          {
            items: [{ key: 1, title: "Location 1" }],
            title: "Location Group 1",
          },
        ],
        locations: "not an array",
      } as any;

      const mockFetchLocations = await getMockFetchLocations();
      mockFetchLocations.mockResolvedValue(mockLocationData);

      const result = await getLocationData();
      expect(result).toEqual(mockLocationData);
      expect(mockFetchLocations).toHaveBeenCalled();
    });
  });

  describe("Integration scenarios", () => {
    it("both functions can be called independently", async () => {
      // Setup for getGraphMeasureFromCookies
      const mockCookieStore = {
        get: vi.fn().mockReturnValue({ value: "pressure" }),
      };
      mockCookies.mockResolvedValue(mockCookieStore);

      // Setup for getLocationData
      const mockLocationData = {
        LocationOptions: [
          {
            items: [{ key: 1, title: "Location 1" }],
            title: "Location Group 1",
          },
        ],
        locations: [
          { city: "Location 1", lat: 0, lng: 0, location_id: 1, state: "ST" },
        ],
      };
      const mockFetchLocations = await getMockFetchLocations();
      mockFetchLocations.mockResolvedValue(mockLocationData);

      // Call both functions
      const [graphMeasure, locationData] = await Promise.all([
        getGraphMeasureFromCookies(),
        getLocationData(),
      ]);

      expect(graphMeasure).toBe("pressure");
      expect(locationData).toEqual(mockLocationData);
      expect(mockCookies).toHaveBeenCalled();
      expect(mockFetchLocations).toHaveBeenCalled();
    });

    it("handles concurrent failures gracefully", async () => {
      // Both functions fail
      const mockFetchLocations = await getMockFetchLocations();
      mockCookies.mockRejectedValue(new Error("Cookie error"));
      mockFetchLocations.mockRejectedValue(new Error("Fetch error"));

      const [cookieResult, locationResult] = await Promise.allSettled([
        getGraphMeasureFromCookies(),
        getLocationData(),
      ]);

      expect(cookieResult.status).toBe("rejected");
      expect(locationResult.status).toBe("rejected");

      if (cookieResult.status === "rejected") {
        expect(cookieResult.reason.message).toBe("Cookie error");
      }

      if (locationResult.status === "rejected") {
        expect(locationResult.reason.message).toBe("Fetch error");
      }
    });
  });
});
