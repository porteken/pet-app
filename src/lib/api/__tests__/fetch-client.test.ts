import { beforeEach, describe, expect, it, vi } from "vitest";

import { FetchError } from "@/lib/utils/errors";
import {
  clearAllMocks,
  createMockLinearRegression,
  mockSimpleLinearRegression,
  mockSupabaseClient,
  mockValidationModule,
  setupApiClientTest,
} from "@/testing";

import { FetchTrendGraphData } from "../fetch-client";

// Mock dependencies
mockSupabaseClient();
mockValidationModule();
mockSimpleLinearRegression();

describe("FetchTrendGraphData", () => {
  it("should throw error when called in non-browser environment", async () => {
    // Mock non-browser environment
    const originalWindow = globalThis.window;
    // @ts-expect-error - Testing non-browser environment
    delete globalThis.window;

    await expect(FetchTrendGraphData("avg", 1)).rejects.toThrow(
      "FetchTrendGraphData can only be called in browser environment"
    );

    // Restore window
    globalThis.window = originalWindow;
  });
  let mockSupabaseClient: ReturnType<
    (typeof import("@/testing"))["createMockSupabaseClient"]
  >;
  let mockValidation: ReturnType<
    (typeof import("@/testing"))["createMockValidation"]
  >;
  let mockLinearRegression: ReturnType<typeof createMockLinearRegression>;

  beforeEach(async () => {
    clearAllMocks();

    const setup = await setupApiClientTest();
    mockSupabaseClient = setup.mockSupabaseClient;
    mockValidation = setup.mockValidation;

    // Mock SimpleLinearRegression
    mockLinearRegression = createMockLinearRegression();
    const { SimpleLinearRegression } = await import(
      "@/lib/utils/simple-linear-regression"
    );
    vi.mocked(SimpleLinearRegression).mockImplementation(
      () => mockLinearRegression as any
    );
  });

  it("should throw FetchError for invalid trend option", async () => {
    mockValidation.validateTrendOption.mockReturnValue(false);

    await expect(FetchTrendGraphData("invalid", 1)).rejects.toThrow(
      new FetchError("Invalid trend option. Must be 'avg' or 'max'")
    );
  });

  it("should throw FetchError for invalid location ID", async () => {
    mockValidation.validateLocationId.mockReturnValue(false);

    await expect(FetchTrendGraphData("avg", -1)).rejects.toThrow(
      new FetchError("Invalid location ID: -1")
    );
  });

  it("should fetch data for avg option", async () => {
    const mockData = [
      { location_id: 1, pet: 25.5, year: 2020 },
      { location_id: 1, pet: 26.2, year: 2021 },
    ];

    const mockQuery = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockData, error: undefined }),
      select: vi.fn().mockReturnThis(),
    };

    mockSupabaseClient.from.mockReturnValue(mockQuery);
    mockLinearRegression.predict.mockImplementation(
      (year: number) => year * 0.7 + 24
    );

    const result = await FetchTrendGraphData("avg", 1);

    expect(mockSupabaseClient.from).toHaveBeenCalledWith("pet_year_avg");
    expect(mockQuery.select).toHaveBeenCalledWith("year, pet, location_id");
    expect(mockQuery.eq).toHaveBeenCalledWith("location_id", 1);
    expect(mockQuery.order).toHaveBeenCalledWith("year", { ascending: true });

    expect(result.years).toEqual([2020, 2021]);
    expect(result.year_pets).toEqual([25.5, 26.2]);
    expect(result.trendline_pets[0]).toBe(1438);
    expect(result.trendline_pets[1]).toBeCloseTo(1438.7, 1);
  });

  it("should fetch data for max option", async () => {
    const mockData = [
      { location_id: 1, pet: 30.5, year: 2020 },
      { location_id: 1, pet: 31.2, year: 2021 },
    ];

    const mockQuery = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockData, error: undefined }),
      select: vi.fn().mockReturnThis(),
    };

    mockSupabaseClient.from.mockReturnValue(mockQuery);
    mockLinearRegression.predict.mockImplementation(
      (year: number) => year * 0.7 + 29
    );

    const result = await FetchTrendGraphData("max", 1);

    expect(mockSupabaseClient.from).toHaveBeenCalledWith("pet_year_max");
    expect(result.years).toEqual([2020, 2021]);
    expect(result.year_pets).toEqual([30.5, 31.2]);
    expect(result.trendline_pets[0]).toBe(1443);
    expect(result.trendline_pets[1]).toBeCloseTo(1443.7, 1);
  });

  it("should throw error when no data found", async () => {
    const mockQuery = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: undefined }),
      select: vi.fn().mockReturnThis(),
    };

    mockSupabaseClient.from.mockReturnValue(mockQuery);

    await expect(FetchTrendGraphData("avg", 1)).rejects.toThrow(
      "No data found for location 1"
    );
  });

  it("should handle database errors", async () => {
    const mockError = new Error("Database connection failed");
    const mockQuery = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: undefined, error: mockError }),
      select: vi.fn().mockReturnThis(),
    };

    mockSupabaseClient.from.mockReturnValue(mockQuery);

    await expect(FetchTrendGraphData("avg", 1)).rejects.toThrow(
      "Database error fetching trend data"
    );
  });

  it("should handle FetchError during data processing", async () => {
    const mockData = [{ location_id: 1, pet: 25.5, year: 2020 }];

    const mockQuery = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockData, error: undefined }),
      select: vi.fn().mockReturnThis(),
    };

    mockSupabaseClient.from.mockReturnValue(mockQuery);
    mockValidation.validateYearPets.mockImplementation(() => {
      throw new FetchError("Invalid pet data");
    });

    await expect(FetchTrendGraphData("avg", 1)).rejects.toThrow(
      "Invalid pet data"
    );
  });

  it("should handle unexpected errors", async () => {
    const mockData = [{ location_id: 1, pet: 25.5, year: 2020 }];

    const mockQuery = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockData, error: undefined }),
      select: vi.fn().mockReturnThis(),
    };

    mockSupabaseClient.from.mockReturnValue(mockQuery);

    // Mock SimpleLinearRegression to throw
    vi.mocked(mockLinearRegression.predict).mockImplementation(() => {
      throw new Error("Regression calculation failed");
    });

    await expect(FetchTrendGraphData("avg", 1)).rejects.toThrow(
      "Unexpected error in FetchTrendGraphData: Error: Regression calculation failed"
    );
  });

  it("should handle database response with null data", async () => {
    const mockQuery = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: undefined, error: undefined }),
      select: vi.fn().mockReturnThis(),
    };

    mockSupabaseClient.from.mockReturnValue(mockQuery);

    await expect(FetchTrendGraphData("avg", 1)).rejects.toThrow(
      "No data found for location 1"
    );
  });
});

describe("FetchReferenceGraphData export", () => {
  it("should export FetchReferenceGraphData", async () => {
    const { FetchReferenceGraphData } = await import("../fetch-client");
    expect(FetchReferenceGraphData).toBeDefined();
    expect(typeof FetchReferenceGraphData).toBe("function");
  });
});
