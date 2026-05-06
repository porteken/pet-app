/* oxlint-disable @typescript-eslint/no-unsafe-type-assertion */
import { FetchError } from "@/lib/utils/errors";
import { createMockLinearRegression } from "@/testing/mocks";
import { clearAllMocks, setupApiClientTest } from "@/testing/test-utilities";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FetchForecastData, FetchTrendGraphData } from "../fetch-client";

import type { SimpleLinearRegression } from "@/lib/utils/simple-linear-regression";
import type {
  createMockSupabaseClient,
  createMockValidation,
} from "@/testing/mocks";

const createTrendQuery = (data: unknown, error?: unknown) => ({
  eq: mockFn().mockReturnThis(),
  order: mockFn().mockResolvedValue({ data, error }),
  select: mockFn().mockReturnThis(),
});

const createHistoricalQuery = (data: unknown) => ({
  eq: mockFn().mockReturnThis(),
  limit: mockFn().mockReturnThis(),
  maybeSingle: mockFn().mockResolvedValue({ data }),
  order: mockFn().mockReturnThis(),
  select: mockFn().mockReturnThis(),
});

const createForecastQuery = (data: unknown, error?: unknown) => ({
  eq: mockFn().mockReturnThis(),
  gt: mockFn().mockReturnThis(),
  lte: mockFn().mockReturnThis(),
  order: mockFn().mockResolvedValue({ data, error }),
  select: mockFn().mockReturnThis(),
});

describe("fetchTrendGraphData", () => {
  let mockSupabaseClient: ReturnType<typeof createMockSupabaseClient>;
  let mockValidation: ReturnType<typeof createMockValidation>;
  let mockLinearRegression: ReturnType<typeof createMockLinearRegression>;

  beforeEach(async () => {
    clearAllMocks();

    const setup = await setupApiClientTest();
    mockSupabaseClient = setup.mockSupabaseClient;
    mockValidation = setup.mockValidation;

    mockLinearRegression = createMockLinearRegression();
    const { SimpleLinearRegression } =
      await import("@/lib/utils/simple-linear-regression");
    vi.mocked(SimpleLinearRegression).mockImplementation(
      function MockSimpleLinearRegression() {
        return mockLinearRegression as unknown as SimpleLinearRegression;
      },
    );
  });

  it("should throw error when called in non-browser environment", async () => {
    mockValidation.validateTrendOption.mockReturnValue(false);

    await expect(FetchTrendGraphData("invalid", 1)).rejects.toThrow(
      new FetchError("Invalid trend option. Must be 'avg' or 'max'"),
    );
  });

  it("should throw FetchError for invalid location ID", async () => {
    mockValidation.validateLocationId.mockReturnValue(false);

    await expect(FetchTrendGraphData("avg", -1)).rejects.toThrow(
      new FetchError("Invalid location ID: -1"),
    );
  });

  it("should fetch data for avg option", async () => {
    const mockData = [
      { location_id: 1, pet: 25.5, year: 2020 },
      { location_id: 1, pet: 26.2, year: 2021 },
    ];

    const mockQuery = createTrendQuery(mockData);

    mockSupabaseClient.from.mockReturnValue(mockQuery);
    mockLinearRegression.predict.mockImplementation(
      (year: number) => year * 0.7 + 24,
    );

    const result = await FetchTrendGraphData("avg", 1);

    expect(mockSupabaseClient.from).toHaveBeenCalledWith("pet_year_avg");
    expect(mockQuery.select).toHaveBeenCalledWith("year, pet, location_id");
    expect(mockQuery.eq).toHaveBeenCalledWith("location_id", 1);
    expect(mockQuery.eq).toHaveBeenCalledWith("season", "Annual");
    expect(mockQuery.order).toHaveBeenCalledWith("year", { ascending: true });

    expect(result.years).toStrictEqual([2020, 2021]);
    expect(result.year_pets).toStrictEqual([25.5, 26.2]);
    expect(result.trendline_pets[0]).toBe(1438);
    expect(result.trendline_pets[1]).toBeCloseTo(1438.7, 1);
  });

  it("should fetch data for max option", async () => {
    const mockData = [
      { location_id: 1, pet: 30.5, year: 2020 },
      { location_id: 1, pet: 31.2, year: 2021 },
    ];

    const mockQuery = createTrendQuery(mockData);

    mockSupabaseClient.from.mockReturnValue(mockQuery);
    mockLinearRegression.predict.mockImplementation(
      (year: number) => year * 0.7 + 29,
    );

    const result = await FetchTrendGraphData("max", 1);

    expect(mockSupabaseClient.from).toHaveBeenCalledWith("pet_year_max");
    expect(mockQuery.eq).toHaveBeenCalledWith("season", "Annual");
    expect(result.years).toStrictEqual([2020, 2021]);
    expect(result.year_pets).toStrictEqual([30.5, 31.2]);
    expect(result.trendline_pets[0]).toBe(1443);
    expect(result.trendline_pets[1]).toBeCloseTo(1443.7, 1);
  });

  it("should return empty graph data when no rows are found", async () => {
    const mockQuery = createTrendQuery([]);

    mockSupabaseClient.from.mockReturnValue(mockQuery);

    await expect(FetchTrendGraphData("avg", 1)).resolves.toStrictEqual({
      increase_per_year: 0,
      trendline_pets: [],
      year_pets: [],
      years: [],
    });
  });

  it("should handle database errors", async () => {
    const mockError = new Error("Database connection failed");
    const mockQuery = createTrendQuery(undefined, mockError);

    mockSupabaseClient.from.mockReturnValue(mockQuery);

    await expect(FetchTrendGraphData("avg", 1)).rejects.toThrow(
      "Database error fetching trend data",
    );
  });

  it("should handle FetchError during data processing", async () => {
    const mockData = [{ location_id: 1, pet: 25.5, year: 2020 }];

    const mockQuery = createTrendQuery(mockData);

    mockSupabaseClient.from.mockReturnValue(mockQuery);
    mockValidation.validateYearPets.mockImplementation(() => {
      throw new FetchError("Invalid pet data");
    });

    await expect(FetchTrendGraphData("avg", 1)).rejects.toThrow(
      "Invalid pet data",
    );
  });

  it("should handle unexpected errors", async () => {
    const mockData = [{ location_id: 1, pet: 25.5, year: 2020 }];

    const mockQuery = createTrendQuery(mockData);

    mockSupabaseClient.from.mockReturnValue(mockQuery);

    vi.mocked(mockLinearRegression.predict).mockImplementation(() => {
      throw new Error("Regression calculation failed");
    });

    await expect(FetchTrendGraphData("avg", 1)).rejects.toThrow(
      "Failed to fetch trend graph data for location 1 (avg): Regression calculation failed",
    );
  });

  it("should handle database response with null data", async () => {
    const mockQuery = createTrendQuery(undefined);

    mockSupabaseClient.from.mockReturnValue(mockQuery);

    await expect(FetchTrendGraphData("avg", 1)).resolves.toStrictEqual({
      increase_per_year: 0,
      trendline_pets: [],
      year_pets: [],
      years: [],
    });
  });
});

describe("fetchForecastData", () => {
  let mockSupabaseClient: ReturnType<typeof createMockSupabaseClient>;
  let mockValidation: ReturnType<typeof createMockValidation>;

  beforeEach(async () => {
    clearAllMocks();

    const setup = await setupApiClientTest();
    mockSupabaseClient = setup.mockSupabaseClient;
    mockValidation = setup.mockValidation;
  });

  it("should throw error when called in non-browser environment", async () => {
    const originalWindow = globalThis.window;

    Reflect.deleteProperty(globalThis, "window");

    await expect(FetchForecastData(1, 10)).rejects.toThrow(
      "FetchForecastData can only be called in browser environment",
    );

    globalThis.window = originalWindow;
  });

  it("should throw FetchError for invalid location ID", async () => {
    mockValidation.validateLocationId.mockReturnValue(false);

    await expect(FetchForecastData(-1, 10)).rejects.toThrow(
      new FetchError("Invalid location ID: -1"),
    );
  });

  it("should fetch forecast data successfully", async () => {
    const mockHistoricalData = [{ year: 2025 }];
    const mockForecastData = [
      { lower: 28.5, pet: 30.5, upper: 32.5, year: 2026 },
      { lower: 29, pet: 31, upper: 33, year: 2027 },
    ];

    const mockHistoricalQuery = createHistoricalQuery(mockHistoricalData[0]);

    const mockForecastQuery = createForecastQuery(mockForecastData);

    mockSupabaseClient.from
      .mockReturnValueOnce(mockHistoricalQuery)
      .mockReturnValueOnce(mockForecastQuery);

    const result = await FetchForecastData(1, 10);

    expect(mockSupabaseClient.from).toHaveBeenNthCalledWith(1, "pet_year_avg");
    expect(mockSupabaseClient.from).toHaveBeenNthCalledWith(2, "pet_forecast");
    expect(mockSupabaseClient.from).toHaveBeenCalledTimes(2);
    expect(mockHistoricalQuery.eq).toHaveBeenCalledWith("season", "Annual");
    expect(mockForecastQuery.eq).toHaveBeenCalledWith("season", "Annual");
    expect(result).toStrictEqual({
      forecastValues: [30.5, 31],
      forecastYears: [2026, 2027],
      lowerBound10: [28.5, 29],
      upperBound90: [32.5, 33],
    });
  });

  it("should fetch seasonal forecast data when season is provided", async () => {
    const mockHistoricalData = [{ year: 2025 }];
    const mockForecastData = [
      { lower: 10.5, pet: 12.5, upper: 14.5, year: 2026 },
    ];

    const mockHistoricalQuery = createHistoricalQuery(mockHistoricalData[0]);

    const mockForecastQuery = createForecastQuery(mockForecastData);

    mockSupabaseClient.from
      .mockReturnValueOnce(mockHistoricalQuery)
      .mockReturnValueOnce(mockForecastQuery);

    await FetchForecastData(1, 10, "Winter");

    expect(mockHistoricalQuery.eq).toHaveBeenCalledWith("season", "Winter");
    expect(mockForecastQuery.eq).toHaveBeenCalledWith("season", "Winter");
  });

  it("should return undefined when no historical data found", async () => {
    const mockHistoricalQuery = createHistoricalQuery(null);

    mockSupabaseClient.from.mockReturnValue(mockHistoricalQuery);

    const result = await FetchForecastData(1, 10);

    expect(result).toBeUndefined();
  });

  it("should return undefined when no forecast data found", async () => {
    const mockHistoricalData = [{ year: 2025 }];

    const mockHistoricalQuery = createHistoricalQuery(mockHistoricalData[0]);

    const mockForecastQuery = createForecastQuery([]);

    mockSupabaseClient.from
      .mockReturnValueOnce(mockHistoricalQuery)
      .mockReturnValueOnce(mockForecastQuery);

    const result = await FetchForecastData(1, 10);

    expect(result).toBeUndefined();
  });

  it("should handle database errors when fetching forecast", async () => {
    const mockHistoricalData = [{ year: 2025 }];
    const mockError = new Error("Database connection failed");

    const mockHistoricalQuery = createHistoricalQuery(mockHistoricalData[0]);

    const mockForecastQuery = createForecastQuery(undefined, mockError);

    mockSupabaseClient.from
      .mockReturnValueOnce(mockHistoricalQuery)
      .mockReturnValueOnce(mockForecastQuery);

    await expect(FetchForecastData(1, 10)).rejects.toThrow(
      "Database error fetching forecast data",
    );
  });

  it("should calculate correct target year based on yearsAhead", async () => {
    const mockHistoricalData = [{ year: 2020 }];
    const mockForecastData = [
      { lower: 28.5, pet: 30.5, upper: 32.5, year: 2021 },
      { lower: 30, pet: 32, upper: 34, year: 2025 },
    ];

    const mockHistoricalQuery = createHistoricalQuery(mockHistoricalData[0]);

    const mockForecastQuery = createForecastQuery(mockForecastData);

    mockSupabaseClient.from
      .mockReturnValueOnce(mockHistoricalQuery)
      .mockReturnValueOnce(mockForecastQuery);

    await FetchForecastData(1, 5);

    expect(mockForecastQuery.gt).toHaveBeenCalledWith("year", 2020);
    expect(mockForecastQuery.lte).toHaveBeenCalledWith("year", 2025);
  });

  it("should convert pet, lower, and upper values to numbers", async () => {
    const mockHistoricalData = [{ year: 2025 }];
    const mockForecastData = [
      { lower: "28.5", pet: "30.5", upper: "32.5", year: 2026 },
    ];

    const mockHistoricalQuery = createHistoricalQuery(mockHistoricalData[0]);

    const mockForecastQuery = createForecastQuery(mockForecastData);

    mockSupabaseClient.from
      .mockReturnValueOnce(mockHistoricalQuery)
      .mockReturnValueOnce(mockForecastQuery);

    const result = await FetchForecastData(1, 1);

    expect(result?.forecastValues).toStrictEqual([30.5]);
    expect(result?.lowerBound10).toStrictEqual([28.5]);
    expect(result?.upperBound90).toStrictEqual([32.5]);
  });
});

describe("fetchReferenceGraphData export", () => {
  it("should export FetchReferenceGraphData", async () => {
    const { FetchReferenceGraphData } = await import("../fetch-client");
    expect(FetchReferenceGraphData).toBeDefined();
    expect(typeof FetchReferenceGraphData).toBe("function");
  });
});
