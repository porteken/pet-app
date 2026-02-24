import { beforeEach, describe, expect, it, vi } from "vitest";

import { FetchError } from "@/lib/utils/errors";
import { mockSupabaseClient, mockValidationModule } from "@/testing/mocks";
import { clearAllMocks, setupApiClientTest } from "@/testing/test-utilities";

import { FetchReferenceGraphData } from "../reference-graph-data";

mockSupabaseClient();
mockValidationModule();

describe("reference-graph-data", () => {
  let mockSupabaseClient: ReturnType<
    (typeof import("@/testing/mocks"))["createMockSupabaseClient"]
  >;
  let mockValidation: ReturnType<
    (typeof import("@/testing/mocks"))["createMockValidation"]
  >;

  beforeEach(async () => {
    clearAllMocks();

    const setup = await setupApiClientTest();
    mockSupabaseClient = setup.mockSupabaseClient;
    mockValidation = setup.mockValidation;
  });
  describe("FetchReferenceGraphData", () => {
    it("should fetch and process reference data successfully", async () => {
      const mockData = [
        { date: "2023-01-01", location_id: 1, pet: 25.5, year: "2023" },
        { date: "2023-01-02", location_id: 1, pet: 26.2, year: "2023" },
      ];

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockData, error: undefined }),
        select: vi.fn().mockReturnThis(),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const result = await FetchReferenceGraphData("2023", 1);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith("pet_year");
      expect(mockQuery.select).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenNthCalledWith(1, "location_id", 1);
      expect(mockQuery.eq).toHaveBeenNthCalledWith(2, "year", "2023");
      expect(mockQuery.order).toHaveBeenCalledWith("date", { ascending: true });

      expect(result.dates).toEqual([
        new Date("2023-01-01"),
        new Date("2023-01-02"),
      ]);
      expect(result.pets).toEqual([25.5, 26.2]);

      expect(mockValidation.validateDates).toHaveBeenCalledWith([
        new Date("2023-01-01"),
        new Date("2023-01-02"),
      ]);
      expect(mockValidation.validatePets).toHaveBeenCalledWith([25.5, 26.2]);
    });

    it("should throw FetchError for invalid year", async () => {
      mockValidation.validateYear.mockReturnValue(false);

      await expect(FetchReferenceGraphData("abc", 1)).rejects.toThrow(
        new FetchError("Invalid year format. Must be a 4-digit year.")
      );

      expect(mockValidation.validateYear).toHaveBeenCalledWith("abc");
    });

    it("should throw FetchError for invalid location ID", async () => {
      mockValidation.validateLocationId.mockReturnValue(false);

      await expect(FetchReferenceGraphData("2023", -1)).rejects.toThrow(
        new FetchError("Invalid location ID: -1")
      );

      expect(mockValidation.validateLocationId).toHaveBeenCalledWith(-1);
    });

    it("should throw error when no data found", async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: undefined }),
        select: vi.fn().mockReturnThis(),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      await expect(FetchReferenceGraphData("2023", 1)).rejects.toThrow(
        "No data found for location 1 in year 2023"
      );
    });

    it("should handle database errors", async () => {
      const mockError = { message: "Database connection failed" };
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: undefined, error: mockError }),
        select: vi.fn().mockReturnThis(),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      await expect(FetchReferenceGraphData("2023", 1)).rejects.toThrow(
        new FetchError(
          "Database error fetching reference data for location 1, year 2023: Database connection failed",
          mockError
        )
      );
    });

    it("should handle null data response", async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: undefined, error: undefined }),
        select: vi.fn().mockReturnThis(),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      await expect(FetchReferenceGraphData("2023", 1)).rejects.toThrow(
        "No data found for location 1 in year 2023"
      );
    });

    it("should handle unexpected errors during data fetching", async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockRejectedValue(new Error("Network error")),
        select: vi.fn().mockReturnThis(),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      await expect(FetchReferenceGraphData("2023", 1)).rejects.toThrow(
        new Error("Network error")
      );
    });

    it("should handle validation errors during data processing", async () => {
      const mockData = [
        { date: "2023-01-01", location_id: 1, pet: 25.5, year: "2023" },
      ];

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockData, error: undefined }),
        select: vi.fn().mockReturnThis(),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);
      mockValidation.validateDates.mockImplementation(() => {
        throw new Error("Invalid dates");
      });

      await expect(FetchReferenceGraphData("2023", 1)).rejects.toThrow(
        new Error("Invalid dates")
      );
    });

    it("should rethrow FetchErrors from data fetching", async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockRejectedValue(new FetchError("Custom fetch error")),
        select: vi.fn().mockReturnThis(),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      await expect(FetchReferenceGraphData("2023", 1)).rejects.toThrow(
        new FetchError("Custom fetch error")
      );
    });
  });
});
