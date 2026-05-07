import { FetchError } from "@/lib/utils/errors";
import { clearAllMocks, setupApiClientTest } from "@/testing/test-utilities";
import { beforeEach, describe, expect, it } from "vitest";

import { FetchReferenceGraphData } from "../reference-graph-data";

import type {
  createMockSupabaseClient,
  createMockValidation,
} from "@/testing/mocks";

describe("reference-graph-data", () => {
  let mockSupabaseClient: ReturnType<typeof createMockSupabaseClient>;
  let mockValidation: ReturnType<typeof createMockValidation>;

  beforeEach(async () => {
    clearAllMocks();

    const setup = await setupApiClientTest();
    mockSupabaseClient = setup.mockSupabaseClient;
    mockValidation = setup.mockValidation;
  });
  describe("fetchReferenceGraphData", () => {
    it("should fetch and process reference data successfully", async () => {
      const mockData = [
        { date: "2023-01-01", location_id: 1, pet: 25.5, year: "2023" },
        { date: "2023-01-02", location_id: 1, pet: 26.2, year: "2023" },
      ];

      const mockQuery = {
        eq: mockFn().mockReturnThis(),
        gte: mockFn().mockReturnThis(),
        lt: mockFn().mockReturnThis(),
        order: mockFn().mockResolvedValue({ data: mockData, error: undefined }),
        select: mockFn().mockReturnThis(),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const result = await FetchReferenceGraphData("2023", 1);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith("pet");
      expect(mockQuery.select).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenNthCalledWith(1, "location_id", 1);
      expect(mockQuery.gte).toHaveBeenCalledWith("date", "2023-01-01");
      expect(mockQuery.lt).toHaveBeenCalledWith("date", "2024-01-01");
      expect(mockQuery.order).toHaveBeenCalledWith("date", { ascending: true });

      expect(result.dates).toStrictEqual([
        new Date("2023-01-01"),
        new Date("2023-01-02"),
      ]);
      expect(result.pets).toStrictEqual([25.5, 26.2]);

      expect(mockValidation.validateDates).toHaveBeenCalledWith([
        new Date("2023-01-01"),
        new Date("2023-01-02"),
      ]);
      expect(mockValidation.validatePets).toHaveBeenCalledWith([25.5, 26.2]);
    });

    it("should throw FetchError for invalid year", async () => {
      mockValidation.validateYear.mockReturnValue(false);

      await expect(FetchReferenceGraphData("abc", 1)).rejects.toThrow(
        new FetchError("Invalid year format. Must be a 4-digit year."),
      );

      expect(mockValidation.validateYear).toHaveBeenCalledWith("abc");
    });

    it("should throw FetchError for invalid location ID", async () => {
      mockValidation.validateLocationId.mockReturnValue(false);

      await expect(FetchReferenceGraphData("2023", -1)).rejects.toThrow(
        new FetchError("Invalid location ID: -1"),
      );

      expect(mockValidation.validateLocationId).toHaveBeenCalledWith(-1);
    });

    it("should return empty arrays when no data is found", async () => {
      const mockQuery = {
        eq: mockFn().mockReturnThis(),
        gte: mockFn().mockReturnThis(),
        lt: mockFn().mockReturnThis(),
        order: mockFn().mockResolvedValue({ data: [], error: undefined }),
        select: mockFn().mockReturnThis(),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      await expect(FetchReferenceGraphData("2023", 1)).resolves.toStrictEqual({
        dates: [],
        pets: [],
      });
    });

    it("should handle database errors", async () => {
      const mockError = { message: "Database connection failed" };
      const mockQuery = {
        eq: mockFn().mockReturnThis(),
        gte: mockFn().mockReturnThis(),
        lt: mockFn().mockReturnThis(),
        order: mockFn().mockResolvedValue({
          data: undefined,
          error: mockError,
        }),
        select: mockFn().mockReturnThis(),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      await expect(FetchReferenceGraphData("2023", 1)).rejects.toThrow(
        new FetchError(
          "Database error fetching reference data for location 1, year 2023: Database connection failed",
          mockError,
        ),
      );
    });

    it("should handle null data response", async () => {
      const mockQuery = {
        eq: mockFn().mockReturnThis(),
        gte: mockFn().mockReturnThis(),
        lt: mockFn().mockReturnThis(),
        order: mockFn().mockResolvedValue({
          data: undefined,
          error: undefined,
        }),
        select: mockFn().mockReturnThis(),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      await expect(FetchReferenceGraphData("2023", 1)).resolves.toStrictEqual({
        dates: [],
        pets: [],
      });
    });

    it("should handle unexpected errors during data fetching", async () => {
      const mockQuery = {
        eq: mockFn().mockReturnThis(),
        gte: mockFn().mockReturnThis(),
        lt: mockFn().mockReturnThis(),
        order: mockFn().mockRejectedValue(new Error("Network error")),
        select: mockFn().mockReturnThis(),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      await expect(FetchReferenceGraphData("2023", 1)).rejects.toThrow(
        new Error("Network error"),
      );
    });

    it("should handle validation errors during data processing", async () => {
      const mockData = [
        { date: "2023-01-01", location_id: 1, pet: 25.5, year: "2023" },
      ];

      const mockQuery = {
        eq: mockFn().mockReturnThis(),
        gte: mockFn().mockReturnThis(),
        lt: mockFn().mockReturnThis(),
        order: mockFn().mockResolvedValue({ data: mockData, error: undefined }),
        select: mockFn().mockReturnThis(),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);
      mockValidation.validateDates.mockImplementation(() => {
        throw new Error("Invalid dates");
      });

      await expect(FetchReferenceGraphData("2023", 1)).rejects.toThrow(
        new Error("Invalid dates"),
      );
    });

    it("should rethrow FetchErrors from data fetching", async () => {
      const mockQuery = {
        eq: mockFn().mockReturnThis(),
        gte: mockFn().mockReturnThis(),
        lt: mockFn().mockReturnThis(),
        order: mockFn().mockRejectedValue(new FetchError("Custom fetch error")),
        select: mockFn().mockReturnThis(),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      await expect(FetchReferenceGraphData("2023", 1)).rejects.toThrow(
        new FetchError("Custom fetch error"),
      );
    });
  });
});
