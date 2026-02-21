import { beforeEach, describe, expect, it, vi } from "vitest";

import { DatabaseError } from "@/lib/utils/errors";
import {
  clearAllMocks,
  mockNextHeaders,
  mockSimpleLinearRegression,
  mockSupabaseServer,
  setupApiServerTest,
} from "@/testing";

import {
  FetchCityRankings,
  FetchLocations,
  FetchReferenceGraphData,
  FetchTrendGraphData,
} from "../fetch-server";

mockNextHeaders();
mockSupabaseServer();
mockSimpleLinearRegression();

describe("fetch-server", () => {
  let mockSupabaseClient: ReturnType<
    (typeof import("@/testing"))["createMockSupabaseClient"]
  >;
  let mockLinearRegression: ReturnType<
    (typeof import("@/testing"))["createMockLinearRegression"]
  >;

  beforeEach(async () => {
    clearAllMocks();

    const setup = await setupApiServerTest();
    mockSupabaseClient = setup.mockSupabaseClient;
    mockLinearRegression = setup.mockLinearRegression;
  });

  describe("FetchCityRankings", () => {
    it("should fetch and rank city data successfully", async () => {
      const mockPetAvg = [
        { location_id: 1, pet: 35.5 },
        { location_id: 2, pet: 30.2 },
      ];
      const mockPetMax = [
        { location_id: 1, pet: 40.5 },
        { location_id: 2, pet: 38.2 },
      ];
      const mockLocations = [
        { city: "Phoenix", location_id: 1, state: "Arizona" },
        { city: "Austin", location_id: 2, state: "Texas" },
      ];
      const mockPercentiles = [
        { location_id: 1, p10: 32, p90: 38, year: 2024 },
        { location_id: 2, p10: 28, p90: 34, year: 2024 },
      ];
      const mockForecast = [
        { location_id: 1, lower: 38, upper: 42 },
        { location_id: 2, lower: 33, upper: 37 },
      ];
      const mockChange = [
        { change: 1.5, location_id: 1 },
        { change: 1.2, location_id: 2 },
      ];

      const createMockQuery = (data: any) => ({
        eq: vi.fn().mockResolvedValue({ data, error: undefined }),
        select: vi.fn().mockReturnThis(),
      });

      mockSupabaseClient.from
        .mockReturnValueOnce(createMockQuery(mockPetAvg))
        .mockReturnValueOnce(createMockQuery(mockPetMax))
        .mockReturnValueOnce({
          select: vi
            .fn()
            .mockResolvedValue({ data: mockLocations, error: undefined }),
        })
        .mockReturnValueOnce(createMockQuery(mockPercentiles))
        .mockReturnValueOnce(createMockQuery(mockForecast))
        .mockReturnValueOnce({
          select: vi
            .fn()
            .mockResolvedValue({ data: mockChange, error: undefined }),
        });

      const result = await FetchCityRankings(2024);

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
        new DatabaseError("Invalid year: 1999. Must be between 2000 and 2100.")
      );
      await expect(FetchCityRankings(2101)).rejects.toThrow(
        new DatabaseError("Invalid year: 2101. Must be between 2000 and 2100.")
      );
      await expect(FetchCityRankings(Number.NaN)).rejects.toThrow(
        new DatabaseError("Invalid year: NaN. Must be between 2000 and 2100.")
      );
    });

    it("should handle missing petAvg data", async () => {
      const mockQuery = {
        eq: vi.fn().mockResolvedValue({ data: undefined, error: undefined }),
        select: vi.fn().mockReturnThis(),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      await expect(FetchCityRankings(2024)).rejects.toThrow(
        new DatabaseError("Failed to fetch PET average data from database")
      );
    });

    it("should handle petAvg database error", async () => {
      const mockError = new Error("Database connection failed");
      const mockQuery = {
        eq: vi.fn().mockResolvedValue({ data: undefined, error: mockError }),
        select: vi.fn().mockReturnThis(),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      await expect(FetchCityRankings(2024)).rejects.toThrow(
        new DatabaseError(
          "Failed to fetch PET average data from database",
          mockError
        )
      );
    });

    it("should handle missing petMax data", async () => {
      const mockPetAvg = [{ location_id: 1, pet: 35.5 }];

      mockSupabaseClient.from
        .mockReturnValueOnce({
          eq: vi.fn().mockResolvedValue({ data: mockPetAvg, error: undefined }),
          select: vi.fn().mockReturnThis(),
        })
        .mockReturnValueOnce({
          eq: vi.fn().mockResolvedValue({ data: undefined, error: undefined }),
          select: vi.fn().mockReturnThis(),
        });

      await expect(FetchCityRankings(2024)).rejects.toThrow(
        new DatabaseError("Failed to fetch PET max data from database")
      );
    });

    it("should handle missing locations data", async () => {
      const mockPetAvg = [{ location_id: 1, pet: 35.5 }];
      const mockPetMax = [{ location_id: 1, pet: 40.5 }];

      mockSupabaseClient.from
        .mockReturnValueOnce({
          eq: vi.fn().mockResolvedValue({ data: mockPetAvg, error: undefined }),
          select: vi.fn().mockReturnThis(),
        })
        .mockReturnValueOnce({
          eq: vi.fn().mockResolvedValue({ data: mockPetMax, error: undefined }),
          select: vi.fn().mockReturnThis(),
        })
        .mockReturnValueOnce({
          select: vi
            .fn()
            .mockResolvedValue({ data: undefined, error: undefined }),
        });

      await expect(FetchCityRankings(2024)).rejects.toThrow(
        new DatabaseError("Failed to fetch location data from database")
      );
    });

    it("should handle missing percentiles data", async () => {
      const mockPetAvg = [{ location_id: 1, pet: 35.5 }];
      const mockPetMax = [{ location_id: 1, pet: 40.5 }];
      const mockLocations = [
        { city: "Phoenix", location_id: 1, state: "Arizona" },
      ];

      mockSupabaseClient.from
        .mockReturnValueOnce({
          eq: vi.fn().mockResolvedValue({ data: mockPetAvg, error: undefined }),
          select: vi.fn().mockReturnThis(),
        })
        .mockReturnValueOnce({
          eq: vi.fn().mockResolvedValue({ data: mockPetMax, error: undefined }),
          select: vi.fn().mockReturnThis(),
        })
        .mockReturnValueOnce({
          select: vi
            .fn()
            .mockResolvedValue({ data: mockLocations, error: undefined }),
        })
        .mockReturnValueOnce({
          eq: vi.fn().mockResolvedValue({ data: undefined, error: undefined }),
          select: vi.fn().mockReturnThis(),
        });

      await expect(FetchCityRankings(2024)).rejects.toThrow(
        new DatabaseError("Failed to fetch percentiles from database")
      );
    });

    it("should handle missing future PET data", async () => {
      const mockPetAvg = [{ location_id: 1, pet: 35.5 }];
      const mockPetMax = [{ location_id: 1, pet: 40.5 }];
      const mockLocations = [
        { city: "Phoenix", location_id: 1, state: "Arizona" },
      ];
      const mockPercentiles = [
        { location_id: 1, p10: 32, p90: 38, year: 2024 },
      ];

      mockSupabaseClient.from
        .mockReturnValueOnce({
          eq: vi.fn().mockResolvedValue({ data: mockPetAvg, error: undefined }),
          select: vi.fn().mockReturnThis(),
        })
        .mockReturnValueOnce({
          eq: vi.fn().mockResolvedValue({ data: mockPetMax, error: undefined }),
          select: vi.fn().mockReturnThis(),
        })
        .mockReturnValueOnce({
          select: vi
            .fn()
            .mockResolvedValue({ data: mockLocations, error: undefined }),
        })
        .mockReturnValueOnce({
          eq: vi
            .fn()
            .mockResolvedValue({ data: mockPercentiles, error: undefined }),
          select: vi.fn().mockReturnThis(),
        })
        .mockReturnValueOnce({
          eq: vi.fn().mockResolvedValue({ data: undefined, error: undefined }),
          select: vi.fn().mockReturnThis(),
        });

      await expect(FetchCityRankings(2024)).rejects.toThrow(
        new DatabaseError("Failed to fetch future PET data from database")
      );
    });

    it("should handle missing pet change data", async () => {
      const mockPetAvg = [{ location_id: 1, pet: 35.5 }];
      const mockPetMax = [{ location_id: 1, pet: 40.5 }];
      const mockLocations = [
        { city: "Phoenix", location_id: 1, state: "Arizona" },
      ];
      const mockPercentiles = [
        { location_id: 1, p10: 32, p90: 38, year: 2024 },
      ];
      const mockForecast = [{ location_id: 1, lower: 38, upper: 42 }];

      mockSupabaseClient.from
        .mockReturnValueOnce({
          eq: vi.fn().mockResolvedValue({ data: mockPetAvg, error: undefined }),
          select: vi.fn().mockReturnThis(),
        })
        .mockReturnValueOnce({
          eq: vi.fn().mockResolvedValue({ data: mockPetMax, error: undefined }),
          select: vi.fn().mockReturnThis(),
        })
        .mockReturnValueOnce({
          select: vi
            .fn()
            .mockResolvedValue({ data: mockLocations, error: undefined }),
        })
        .mockReturnValueOnce({
          eq: vi
            .fn()
            .mockResolvedValue({ data: mockPercentiles, error: undefined }),
          select: vi.fn().mockReturnThis(),
        })
        .mockReturnValueOnce({
          eq: vi
            .fn()
            .mockResolvedValue({ data: mockForecast, error: undefined }),
          select: vi.fn().mockReturnThis(),
        })
        .mockReturnValueOnce({
          select: vi
            .fn()
            .mockResolvedValue({ data: undefined, error: undefined }),
        });

      await expect(FetchCityRankings(2024)).rejects.toThrow(
        new DatabaseError("Failed to fetch pet change data from database")
      );
    });

    it("should handle cities with null forecast values", async () => {
      const mockPetAvg = [{ location_id: 1, pet: 35.5 }];
      const mockPetMax = [{ location_id: 1, pet: 40.5 }];
      const mockLocations = [
        { city: "Phoenix", location_id: 1, state: "Arizona" },
      ];
      const mockPercentiles = [
        { location_id: 1, p10: 32, p90: 38, year: 2024 },
      ];
      const mockForecast: any[] = [];
      const mockChange = [{ change: 1.5, location_id: 1 }];

      mockSupabaseClient.from
        .mockReturnValueOnce({
          eq: vi.fn().mockResolvedValue({ data: mockPetAvg, error: undefined }),
          select: vi.fn().mockReturnThis(),
        })
        .mockReturnValueOnce({
          eq: vi.fn().mockResolvedValue({ data: mockPetMax, error: undefined }),
          select: vi.fn().mockReturnThis(),
        })
        .mockReturnValueOnce({
          select: vi
            .fn()
            .mockResolvedValue({ data: mockLocations, error: undefined }),
        })
        .mockReturnValueOnce({
          eq: vi
            .fn()
            .mockResolvedValue({ data: mockPercentiles, error: undefined }),
          select: vi.fn().mockReturnThis(),
        })
        .mockReturnValueOnce({
          eq: vi
            .fn()
            .mockResolvedValue({ data: mockForecast, error: undefined }),
          select: vi.fn().mockReturnThis(),
        })
        .mockReturnValueOnce({
          select: vi
            .fn()
            .mockResolvedValue({ data: mockChange, error: undefined }),
        });

      const result = await FetchCityRankings(2024);

      expect(result[0].FutureValueLower).toBeUndefined();
      expect(result[0].FutureValueUpper).toBeUndefined();
    });

    it("should handle cities with null change values", async () => {
      const mockPetAvg = [{ location_id: 1, pet: 35.5 }];
      const mockPetMax = [{ location_id: 1, pet: 40.5 }];
      const mockLocations = [
        { city: "Phoenix", location_id: 1, state: "Arizona" },
      ];
      const mockPercentiles = [
        { location_id: 1, p10: 32, p90: 38, year: 2024 },
      ];
      const mockForecast = [{ location_id: 1, lower: 38, upper: 42 }];
      const mockChange: any[] = [];

      mockSupabaseClient.from
        .mockReturnValueOnce({
          eq: vi.fn().mockResolvedValue({ data: mockPetAvg, error: undefined }),
          select: vi.fn().mockReturnThis(),
        })
        .mockReturnValueOnce({
          eq: vi.fn().mockResolvedValue({ data: mockPetMax, error: undefined }),
          select: vi.fn().mockReturnThis(),
        })
        .mockReturnValueOnce({
          select: vi
            .fn()
            .mockResolvedValue({ data: mockLocations, error: undefined }),
        })
        .mockReturnValueOnce({
          eq: vi
            .fn()
            .mockResolvedValue({ data: mockPercentiles, error: undefined }),
          select: vi.fn().mockReturnThis(),
        })
        .mockReturnValueOnce({
          eq: vi
            .fn()
            .mockResolvedValue({ data: mockForecast, error: undefined }),
          select: vi.fn().mockReturnThis(),
        })
        .mockReturnValueOnce({
          select: vi
            .fn()
            .mockResolvedValue({ data: mockChange, error: undefined }),
        });

      const result = await FetchCityRankings(2024);

      expect(result[0].changePerDecade).toBeUndefined();
    });
  });

  describe("FetchLocations", () => {
    it("should fetch and format location data successfully", async () => {
      const mockLocations = [
        { city: "Boston", location_id: 1, state: "Massachusetts" },
        { city: "Cambridge", location_id: 2, state: "Massachusetts" },
        { city: "Austin", location_id: 3, state: "Texas" },
        { city: "Dallas", location_id: 4, state: "Texas" },
      ];

      const mockQuery = {
        select: vi
          .fn()
          .mockResolvedValue({ data: mockLocations, error: undefined }),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const result = await FetchLocations();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith("locations");
      expect(mockQuery.select).toHaveBeenCalled();

      expect(result.locations).toEqual(mockLocations);
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

    it("should handle database errors", async () => {
      const mockError = new Error(
        "Failed to fetch location data from database"
      );
      const mockQuery = {
        select: vi
          .fn()
          .mockResolvedValue({ data: undefined, error: mockError }),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      await expect(FetchLocations()).rejects.toThrow(
        new DatabaseError(
          "Failed to fetch location data from database",
          mockError
        )
      );
    });

    it("should handle null data response", async () => {
      const mockQuery = {
        select: vi
          .fn()
          .mockResolvedValue({ data: undefined, error: undefined }),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      await expect(FetchLocations()).rejects.toThrow(
        new DatabaseError("Failed to fetch location data from database")
      );
    });
  });

  describe("FetchReferenceGraphData", () => {
    it("should throw error for invalid location ID", async () => {
      await expect(FetchReferenceGraphData("2023", 0)).rejects.toThrow(
        new DatabaseError("Invalid locationId: 0")
      );

      await expect(FetchReferenceGraphData("2023", -1)).rejects.toThrow(
        new DatabaseError("Invalid locationId: -1")
      );

      await expect(FetchReferenceGraphData("2023", Number.NaN)).rejects.toThrow(
        new DatabaseError("Invalid locationId: NaN")
      );
    });

    it("should throw error for invalid year format", async () => {
      await expect(FetchReferenceGraphData("abc", 1)).rejects.toThrow(
        new DatabaseError("Invalid year format: abc. Must be a 4-digit year.")
      );

      await expect(FetchReferenceGraphData("23", 1)).rejects.toThrow(
        new DatabaseError("Invalid year format: 23. Must be a 4-digit year.")
      );

      await expect(FetchReferenceGraphData("", 1)).rejects.toThrow(
        new DatabaseError("Invalid year format: . Must be a 4-digit year.")
      );
    });
    it("should fetch trend data successfully", async () => {
      const mockData = [
        { date: "2020-01-01", pet: 25.5 },
        { date: "2021-01-01", pet: 26.2 },
      ];

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
      };
      mockQuery.eq
        .mockImplementationOnce(() => mockQuery)
        .mockImplementationOnce(() =>
          Promise.resolve({ data: mockData, error: undefined })
        );

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const result = await FetchReferenceGraphData("2023", 5);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith("pet_year");
      expect(mockQuery.select).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith("location_id", 5);

      expect(result.pets).toEqual([25.5, 26.2]);
      expect(result.dates).toEqual([
        new Date("2020-01-01"),
        new Date("2021-01-01"),
      ]);
    });

    it("should handle database errors", async () => {
      const mockError = new Error("Database connection failed");
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
      };
      mockQuery.eq
        .mockReturnValueOnce(mockQuery)
        .mockResolvedValueOnce({ data: undefined, error: mockError });

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      await expect(FetchReferenceGraphData("2023", 1)).rejects.toThrow(
        new DatabaseError(
          "Failed to fetch reference graph data from database",
          mockError
        )
      );
    });
  });

  describe("FetchTrendGraphData", () => {
    it("should fetch trend data successfully", async () => {
      const mockData = [
        { pet: 25.5, year: 2020 },
        { pet: 26.2, year: 2021 },
      ];

      const mockQuery = {
        eq: vi.fn().mockResolvedValue({ data: mockData, error: undefined }),
        select: vi.fn().mockReturnThis(),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);
      mockLinearRegression.predict.mockImplementation(
        (year: number) => year * 0.7 + 24
      );

      const result = await FetchTrendGraphData("avg", 1);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith("pet_year_avg");
      expect(mockQuery.select).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith("location_id", 1);

      expect(result.years).toEqual([2020, 2021]);
      expect(result.year_pets).toEqual([25.5, 26.2]);
      expect(result.trendline_pets[0]).toBeCloseTo(1438, 0);
      expect(result.trendline_pets[1]).toBeCloseTo(1438.7, 0);
    });

    it("should return empty arrays for invalid location ID", async () => {
      const result1 = await FetchTrendGraphData("avg", 0);
      const result2 = await FetchTrendGraphData("avg", -1);
      const result3 = await FetchTrendGraphData("avg", Number.NaN);

      expect(result1).toEqual({
        increase_per_year: 0,
        trendline_pets: [],
        year_pets: [],
        years: [],
      });
      expect(result2).toEqual({
        increase_per_year: 0,
        trendline_pets: [],
        year_pets: [],
        years: [],
      });
      expect(result3).toEqual({
        increase_per_year: 0,
        trendline_pets: [],
        year_pets: [],
        years: [],
      });
    });

    it("should throw error for invalid option", async () => {
      await expect(FetchTrendGraphData("invalid", 1)).rejects.toThrow(
        new DatabaseError("Invalid option: invalid. Must be 'avg' or 'max'")
      );

      await expect(FetchTrendGraphData("", 1)).rejects.toThrow(
        new DatabaseError("Invalid option: . Must be 'avg' or 'max'")
      );
    });

    it("should return empty arrays when no data found", async () => {
      const mockQuery = {
        eq: vi.fn().mockResolvedValue({ data: [], error: undefined }),
        select: vi.fn().mockReturnThis(),
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
        eq: vi.fn().mockResolvedValue({ data: undefined, error: mockError }),
        select: vi.fn().mockReturnThis(),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      await expect(FetchTrendGraphData("avg", 1)).rejects.toThrow(
        new DatabaseError(
          "Failed to fetch trend graph data from database",
          mockError
        )
      );
    });

    it("should handle both avg and max options", async () => {
      const mockData = [{ pet: 25.5, year: 2020 }];
      const mockQuery = {
        eq: vi.fn().mockResolvedValue({ data: mockData, error: undefined }),
        select: vi.fn().mockReturnThis(),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);
      mockLinearRegression.predict.mockReturnValue(1438);

      await FetchTrendGraphData("avg", 1);
      expect(mockSupabaseClient.from).toHaveBeenNthCalledWith(
        1,
        "pet_year_avg"
      );

      await FetchTrendGraphData("max", 1);
      expect(mockSupabaseClient.from).toHaveBeenNthCalledWith(
        2,
        "pet_year_max"
      );
    });
  });
});
