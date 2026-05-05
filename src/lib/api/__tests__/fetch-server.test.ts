import { DatabaseError } from "@/lib/utils/errors";
import { clearAllMocks, setupApiServerTest } from "@/testing/test-utilities";
import { beforeEach, describe, expect, it } from "vitest";

import {
  FetchCityRankings,
  FetchLocations,
  FetchReferenceGraphData,
  FetchTrendGraphData,
} from "../fetch-server";

import type {
  createMockLinearRegression,
  createMockSupabaseClient,
  createMockValidation,
} from "@/testing/mocks";

type RankingViewRow = {
  avg_pet: number;
  change_per_decade: number | null;
  city: string;
  future_lower: number | null;
  future_upper: number | null;
  location_id: number;
  max_pet: number;
  p10: number;
  p90: number;
  state: string;
  year: number;
};

type MockSupabaseClient = ReturnType<typeof createMockSupabaseClient>;

type QueryResponse<T> = {
  data: T | undefined;
  error: unknown;
};

const createSuccessResponse = <T>(data: T): QueryResponse<T> => ({
  data,
  error: undefined,
});

const createMissingResponse = <T>(): QueryResponse<T> => ({
  data: undefined,
  error: undefined,
});

const createFailedResponse = <T>(error: unknown): QueryResponse<T> => ({
  data: undefined,
  error,
});

const createEqQuery = <T>(
  { data, error }: QueryResponse<T>,
  resolveOnEqCall = 2,
) => {
  const response = Promise.resolve({ data, error });
  let eqCallCount = 0;
  const query = {
    eq: mockFn(function () {
      eqCallCount += 1;
      return eqCallCount < resolveOnEqCall ? query : response;
    }),
    select: mockFn(function () {
      return query;
    }),
  };

  return query;
};

const createViewRow = (
  overrides: Partial<RankingViewRow> = {},
): RankingViewRow => ({
  avg_pet: 35.5,
  change_per_decade: 1.5,
  city: "Phoenix",
  future_lower: 38,
  future_upper: 42,
  location_id: 1,
  max_pet: 40.5,
  p10: 32,
  p90: 38,
  state: "Arizona",
  year: 2024,
  ...overrides,
});

const queueCityRankingsViewResponse = (
  mockSupabaseClient: MockSupabaseClient,
  response: QueryResponse<RankingViewRow[]>,
  resolveOnEqCall = 2,
) => {
  const query = createEqQuery(response, resolveOnEqCall);
  mockSupabaseClient.from.mockReturnValueOnce(query);

  return query;
};

describe("fetch-server", () => {
  let mockSupabaseClient: MockSupabaseClient;
  let mockLinearRegression: ReturnType<typeof createMockLinearRegression>;
  let mockValidation: ReturnType<typeof createMockValidation>;

  beforeEach(async () => {
    clearAllMocks();

    const setup = await setupApiServerTest();
    mockSupabaseClient = setup.mockSupabaseClient;
    mockLinearRegression = setup.mockLinearRegression;
    mockValidation = setup.mockValidation;
  });

  describe("FetchCityRankings", () => {
    it("should fetch and rank city data successfully", async () => {
      const rows = [
        createViewRow({
          avg_pet: 35.5,
          city: "Phoenix",
          location_id: 1,
          state: "Arizona",
        }),
        createViewRow({
          avg_pet: 30.2,
          city: "Austin",
          location_id: 2,
          max_pet: 38.2,
          p10: 28,
          p90: 34,
          change_per_decade: 1.2,
          future_lower: 33,
          future_upper: 37,
          state: "Texas",
        }),
      ];
      const mockQuery = queueCityRankingsViewResponse(
        mockSupabaseClient,
        createSuccessResponse(rows),
      );

      const result = await FetchCityRankings(2024);

      expect(mockQuery.eq).toHaveBeenNthCalledWith(1, "year", 2024);
      expect(mockQuery.eq).toHaveBeenNthCalledWith(2, "season", "Annual");

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        avg_pet: 35.5,
        changePerDecade: 1.5,
        city: "Phoenix",
        FutureValueLower: 38,
        FutureValueUpper: 42,
        location_id: 1,
        max_pet: 40.5,
        p10: 32,
        p90: 38,
        rank: 1,
        state: "Arizona",
      });
      expect(result[1].rank).toBe(2);
    });

    it("should throw error for invalid year", async () => {
      await expect(FetchCityRankings(1999)).rejects.toThrow(
        new DatabaseError("Invalid year: 1999. Must be between 2000 and 2100."),
      );
      await expect(FetchCityRankings(2101)).rejects.toThrow(
        new DatabaseError("Invalid year: 2101. Must be between 2000 and 2100."),
      );
      await expect(FetchCityRankings(Number.NaN)).rejects.toThrow(
        new DatabaseError("Invalid year: NaN. Must be between 2000 and 2100."),
      );
    });

    it("should handle missing data from view", async () => {
      queueCityRankingsViewResponse(
        mockSupabaseClient,
        createMissingResponse(),
      );

      await expect(FetchCityRankings(2024)).rejects.toThrow(
        new DatabaseError("Failed to fetch city rankings from database"),
      );
    });

    it("should handle database error from view", async () => {
      const mockError = new Error("Database connection failed");
      queueCityRankingsViewResponse(
        mockSupabaseClient,
        createFailedResponse(mockError),
      );

      await expect(FetchCityRankings(2024)).rejects.toThrow(
        new DatabaseError(
          "Failed to fetch city rankings from database",
          mockError,
        ),
      );
    });

    it("should handle rows with null forecast values", async () => {
      const rows = [createViewRow({ future_lower: null, future_upper: null })];
      queueCityRankingsViewResponse(
        mockSupabaseClient,
        createSuccessResponse(rows),
      );

      const result = await FetchCityRankings(2024);

      expect(result[0].FutureValueLower).toBeUndefined();
      expect(result[0].FutureValueUpper).toBeUndefined();
    });

    it("should handle rows with null change values", async () => {
      const rows = [createViewRow({ change_per_decade: null })];
      queueCityRankingsViewResponse(
        mockSupabaseClient,
        createSuccessResponse(rows),
      );

      const result = await FetchCityRankings(2024);

      expect(result[0].changePerDecade).toBeUndefined();
    });

    it("should sort by avg_pet descending and assign ranks", async () => {
      const rows = [
        createViewRow({ avg_pet: 20, location_id: 1 }),
        createViewRow({ avg_pet: 40, location_id: 2 }),
        createViewRow({ avg_pet: 30, location_id: 3 }),
      ];
      queueCityRankingsViewResponse(
        mockSupabaseClient,
        createSuccessResponse(rows),
      );

      const result = await FetchCityRankings(2024);

      expect(result[0]).toMatchObject({ location_id: 2, rank: 1, avg_pet: 40 });
      expect(result[1]).toMatchObject({ location_id: 3, rank: 2, avg_pet: 30 });
      expect(result[2]).toMatchObject({ location_id: 1, rank: 3, avg_pet: 20 });
    });

    it("should filter rankings by the requested season", async () => {
      const mockQuery = queueCityRankingsViewResponse(
        mockSupabaseClient,
        createSuccessResponse([createViewRow()]),
      );

      await FetchCityRankings(2024, "Winter");

      expect(mockQuery.eq).toHaveBeenNthCalledWith(1, "year", 2024);
      expect(mockQuery.eq).toHaveBeenNthCalledWith(2, "season", "Winter");
    });

    it("should fall back to legacy rankings data when the season column is unavailable", async () => {
      const seasonColumnError = {
        code: "PGRST204",
        details: null,
        hint: null,
        message:
          "Could not find the 'season' column of 'city_rankings_view' in the schema cache",
      };
      const primaryQuery = queueCityRankingsViewResponse(
        mockSupabaseClient,
        createFailedResponse(seasonColumnError),
      );
      const fallbackQuery = queueCityRankingsViewResponse(
        mockSupabaseClient,
        createSuccessResponse([createViewRow()]),
        1,
      );

      const result = await FetchCityRankings(2024);

      expect(primaryQuery.eq).toHaveBeenNthCalledWith(1, "year", 2024);
      expect(primaryQuery.eq).toHaveBeenNthCalledWith(2, "season", "Annual");
      expect(fallbackQuery.eq).toHaveBeenCalledWith("year", 2024);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ city: "Phoenix", rank: 1 });
    });
  });

  describe("FetchLocations", () => {
    it("should fetch and format location data successfully", async () => {
      const mockLocations = [
        {
          city: "Boston",
          id: 1,
          lat: 42.3601,
          lng: -71.0589,
          state: "Massachusetts",
        },
        {
          city: "Cambridge",
          id: 2,
          lat: 42.3736,
          lng: -71.1097,
          state: "Massachusetts",
        },
        {
          city: "Austin",
          id: 3,
          lat: 30.2672,
          lng: -97.7431,
          state: "Texas",
        },
        {
          city: "Dallas",
          id: 4,
          lat: 32.7767,
          lng: -96.797,
          state: "Texas",
        },
      ];

      const mockQuery = {
        select: mockFn().mockResolvedValue({
          data: mockLocations,
          error: undefined,
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const result = await FetchLocations();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith("locations");
      expect(mockQuery.select).toHaveBeenCalledWith(
        "city, lat, lng, id, state",
      );

      expect(result.locations).toEqual([
        {
          city: "Boston",
          lat: 42.3601,
          lng: -71.0589,
          location_id: 1,
          state: "Massachusetts",
        },
        {
          city: "Cambridge",
          lat: 42.3736,
          lng: -71.1097,
          location_id: 2,
          state: "Massachusetts",
        },
        {
          city: "Austin",
          lat: 30.2672,
          lng: -97.7431,
          location_id: 3,
          state: "Texas",
        },
        {
          city: "Dallas",
          lat: 32.7767,
          lng: -96.797,
          location_id: 4,
          state: "Texas",
        },
      ]);
      expect(result.LocationOptions).toEqual([
        {
          items: [
            { key: 1, title: "Boston" },
            { key: 2, title: "Cambridge" },
          ],
          title: "Massachusetts",
        },
        {
          items: [
            { key: 3, title: "Austin" },
            { key: 4, title: "Dallas" },
          ],
          title: "Texas",
        },
      ]);
    });

    it("should fall back to location_id when id is unavailable", async () => {
      const columnError = {
        code: "42703",
        details: null,
        hint: null,
        message: "column locations.id does not exist",
      };
      const initialQuery = {
        select: mockFn().mockResolvedValue({
          data: undefined,
          error: columnError,
        }),
      };
      const fallbackLocations = [
        {
          city: "Boston",
          lat: 42.3601,
          lng: -71.0589,
          location_id: 1,
          state: "Massachusetts",
        },
      ];
      const fallbackQuery = {
        select: mockFn().mockResolvedValue({
          data: fallbackLocations,
          error: undefined,
        }),
      };

      mockSupabaseClient.from
        .mockReturnValueOnce(initialQuery)
        .mockReturnValueOnce(fallbackQuery);

      const result = await FetchLocations();

      expect(initialQuery.select).toHaveBeenCalledWith(
        "city, lat, lng, id, state",
      );
      expect(fallbackQuery.select).toHaveBeenCalledWith(
        "city, lat, lng, location_id, state",
      );
      expect(result.locations).toEqual(fallbackLocations);
    });

    it("should ignore locations with non-positive ids", async () => {
      const mockLocations = [
        {
          city: "Invalid City",
          id: 0,
          lat: 0,
          lng: 0,
          state: "Nowhere",
        },
        {
          city: "Boston",
          id: 1,
          lat: 42.3601,
          lng: -71.0589,
          state: "Massachusetts",
        },
        {
          city: "Austin",
          id: 3,
          lat: 30.2672,
          lng: -97.7431,
          state: "Texas",
        },
      ];

      const mockQuery = {
        select: mockFn().mockResolvedValue({
          data: mockLocations,
          error: undefined,
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const result = await FetchLocations();

      expect(result.locations).toEqual([
        {
          city: "Boston",
          lat: 42.3601,
          lng: -71.0589,
          location_id: 1,
          state: "Massachusetts",
        },
        {
          city: "Austin",
          lat: 30.2672,
          lng: -97.7431,
          location_id: 3,
          state: "Texas",
        },
      ]);
      expect(result.LocationOptions).toEqual([
        {
          items: [{ key: 1, title: "Boston" }],
          title: "Massachusetts",
        },
        {
          items: [{ key: 3, title: "Austin" }],
          title: "Texas",
        },
      ]);
    });

    it("should handle database errors", async () => {
      const mockError = new Error(
        "Failed to fetch location data from database",
      );
      const mockQuery = {
        select: mockFn().mockResolvedValue({
          data: undefined,
          error: mockError,
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      await expect(FetchLocations()).rejects.toThrow(
        new DatabaseError(
          "Failed to fetch location data from database",
          mockError,
        ),
      );
    });

    it("should handle null data response", async () => {
      const mockQuery = {
        select: mockFn().mockResolvedValue({
          data: undefined,
          error: undefined,
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      await expect(FetchLocations()).rejects.toThrow(
        new DatabaseError("Failed to fetch location data from database"),
      );
    });
  });

  describe("FetchReferenceGraphData", () => {
    it("should throw error for invalid location ID", async () => {
      mockValidation.validateLocationId.mockReturnValue(false);

      await expect(FetchReferenceGraphData("2023", 0)).rejects.toThrow(
        new DatabaseError("Invalid locationId: 0"),
      );

      await expect(FetchReferenceGraphData("2023", -1)).rejects.toThrow(
        new DatabaseError("Invalid locationId: -1"),
      );

      await expect(FetchReferenceGraphData("2023", Number.NaN)).rejects.toThrow(
        new DatabaseError("Invalid locationId: NaN"),
      );
    });

    it("should throw error for invalid year format", async () => {
      mockValidation.validateYear.mockReturnValue(false);

      await expect(FetchReferenceGraphData("abc", 1)).rejects.toThrow(
        new DatabaseError("Invalid year format: abc. Must be a 4-digit year."),
      );

      await expect(FetchReferenceGraphData("23", 1)).rejects.toThrow(
        new DatabaseError("Invalid year format: 23. Must be a 4-digit year."),
      );

      await expect(FetchReferenceGraphData("", 1)).rejects.toThrow(
        new DatabaseError("Invalid year format: . Must be a 4-digit year."),
      );
    });
    it("should fetch trend data successfully", async () => {
      const mockData = [
        { date: "2020-01-01", location_id: 5, pet: 25.5, year: "2023" },
        { date: "2021-01-01", location_id: 5, pet: 26.2, year: "2023" },
      ];

      const mockQuery = {
        eq: mockFn().mockReturnThis(),
        order: mockFn().mockResolvedValue({ data: mockData, error: undefined }),
        select: mockFn().mockReturnThis(),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const result = await FetchReferenceGraphData("2023", 5);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith("pet_year");
      expect(mockQuery.select).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith("location_id", 5);
      expect(mockQuery.order).toHaveBeenCalledWith("date", { ascending: true });

      expect(result.pets).toEqual([25.5, 26.2]);
      expect(result.dates).toEqual([
        new Date("2020-01-01"),
        new Date("2021-01-01"),
      ]);
    });

    it("should handle database errors", async () => {
      const mockError = new Error("Database connection failed");
      const mockQuery = {
        eq: mockFn().mockReturnThis(),
        order: mockFn().mockResolvedValue({
          data: undefined,
          error: mockError,
        }),
        select: mockFn().mockReturnThis(),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      await expect(FetchReferenceGraphData("2023", 1)).rejects.toThrow(
        new DatabaseError(
          "Failed to fetch reference graph data from database",
          mockError,
        ),
      );
    });
  });

  describe("FetchTrendGraphData", () => {
    it("should fetch trend data successfully", async () => {
      const mockData = [
        { location_id: 1, pet: 25.5, year: 2020 },
        { location_id: 1, pet: 26.2, year: 2021 },
      ];

      const mockQuery = {
        eq: mockFn().mockReturnThis(),
        order: mockFn().mockResolvedValue({ data: mockData, error: undefined }),
        select: mockFn().mockReturnThis(),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);
      mockLinearRegression.predict.mockImplementation(
        (year: number) => year * 0.7 + 24,
      );

      const result = await FetchTrendGraphData("avg", 1);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith("pet_year_avg");
      expect(mockQuery.select).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith("location_id", 1);
      expect(mockQuery.eq).toHaveBeenCalledWith("season", "Annual");
      expect(mockQuery.order).toHaveBeenCalledWith("year", { ascending: true });

      expect(result.years).toEqual([2020, 2021]);
      expect(result.year_pets).toEqual([25.5, 26.2]);
      expect(result.trendline_pets[0]).toBeCloseTo(1438, 0);
      expect(result.trendline_pets[1]).toBeCloseTo(1438.7, 0);
    });

    it("should throw error for invalid location ID", async () => {
      mockValidation.validateLocationId.mockReturnValue(false);

      await expect(FetchTrendGraphData("avg", 0)).rejects.toThrow(
        new DatabaseError("Invalid locationId: 0"),
      );
      await expect(FetchTrendGraphData("avg", -1)).rejects.toThrow(
        new DatabaseError("Invalid locationId: -1"),
      );
      await expect(FetchTrendGraphData("avg", Number.NaN)).rejects.toThrow(
        new DatabaseError("Invalid locationId: NaN"),
      );
    });

    it("should throw error for invalid option", async () => {
      mockValidation.validateTrendOption.mockReturnValue(false);

      await expect(FetchTrendGraphData("invalid", 1)).rejects.toThrow(
        new DatabaseError("Invalid option: invalid. Must be 'avg' or 'max'"),
      );

      await expect(FetchTrendGraphData("", 1)).rejects.toThrow(
        new DatabaseError("Invalid option: . Must be 'avg' or 'max'"),
      );
    });

    it("should return empty arrays when no data found", async () => {
      const mockQuery = {
        eq: mockFn().mockReturnThis(),
        order: mockFn().mockResolvedValue({ data: [], error: undefined }),
        select: mockFn().mockReturnThis(),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const result = await FetchTrendGraphData("avg", 1);

      expect(result).toEqual({
        increase_per_year: 0,
        trendline_pets: [],
        year_pets: [],
        years: [],
      });
    });

    it("should handle database errors", async () => {
      const mockError = new Error("Database connection failed");
      const mockQuery = {
        eq: mockFn().mockReturnThis(),
        order: mockFn().mockResolvedValue({
          data: undefined,
          error: mockError,
        }),
        select: mockFn().mockReturnThis(),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      await expect(FetchTrendGraphData("avg", 1)).rejects.toThrow(
        new DatabaseError(
          "Failed to fetch trend graph data from database",
          mockError,
        ),
      );
    });

    it("should handle both avg and max options", async () => {
      const mockData = [{ location_id: 1, pet: 25.5, year: 2020 }];
      const mockQuery = {
        eq: mockFn().mockReturnThis(),
        order: mockFn().mockResolvedValue({ data: mockData, error: undefined }),
        select: mockFn().mockReturnThis(),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);
      mockLinearRegression.predict.mockReturnValue(1438);

      await FetchTrendGraphData("avg", 1);
      expect(mockSupabaseClient.from).toHaveBeenNthCalledWith(
        1,
        "pet_year_avg",
      );

      await FetchTrendGraphData("max", 1);
      expect(mockSupabaseClient.from).toHaveBeenNthCalledWith(
        2,
        "pet_year_max",
      );
    });
  });
});
