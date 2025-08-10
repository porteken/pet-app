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
  FetchLocations,
  FetchReferenceGraphData,
  FetchTrendGraphData,
} from "../fetch-server";

// Mock dependencies
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
      const mockError = new Error("Database connection failed");
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
        new DatabaseError(
          "Failed to fetch location data from database",
          undefined
        )
      );
    });
  });

  describe("FetchReferenceGraphData", () => {
    it("should fetch reference data successfully", async () => {
      const mockData = [
        { date: "2023-01-01", pet: 25.5 },
        { date: "2023-01-02", pet: 26.2 },
      ];

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
      };
      mockQuery.eq
        .mockReturnValueOnce(mockQuery) // first eq call
        .mockResolvedValueOnce({ data: mockData, error: undefined }); // second eq call

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const result = await FetchReferenceGraphData("2023", 1);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith("pet_year");
      expect(mockQuery.select).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith("location_id", 1);
      expect(mockQuery.eq).toHaveBeenCalledWith("year", "2023");

      expect(result.dates).toEqual([
        new Date("2023-01-01"),
        new Date("2023-01-02"),
      ]);
      expect(result.pets).toEqual([25.5, 26.2]);
    });

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

    it("should handle database errors", async () => {
      const mockError = new Error("Database connection failed");
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
      };
      mockQuery.eq
        .mockReturnValueOnce(mockQuery) // first eq call
        .mockResolvedValueOnce({ data: undefined, error: mockError }); // second eq call

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

      expect(result1).toEqual({ trendline_pets: [], year_pets: [], years: [] });
      expect(result2).toEqual({ trendline_pets: [], year_pets: [], years: [] });
      expect(result3).toEqual({ trendline_pets: [], year_pets: [], years: [] });
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

      expect(result).toEqual({ trendline_pets: [], year_pets: [], years: [] });
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
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("pet_year_avg");

      await FetchTrendGraphData("max", 1);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("pet_year_max");
    });
  });
});
