import { beforeEach, describe, expect, it, vi } from "vitest";

import { FetchError } from "@/lib/utils/errors";
import {
  createMockLinearRegression,
  mockSimpleLinearRegression,
  mockSupabaseClient,
  mockValidationModule,
} from "@/testing/mocks";
import { clearAllMocks, setupApiClientTest } from "@/testing/test-utilities";

import { FetchForecastData, FetchTrendGraphData } from "../fetch-client";

mockSupabaseClient();
mockValidationModule();
mockSimpleLinearRegression();

describe("FetchTrendGraphData", () => {
  it("should throw error when called in non-browser environment", async () => {
    const originalWindow = globalThis.window;

    Reflect.deleteProperty(globalThis, "window");

    await expect(FetchTrendGraphData("avg", 1)).rejects.toThrow(
      "FetchTrendGraphData can only be called in browser environment"
    );

    globalThis.window = originalWindow;
  });
  let mockSupabaseClient: ReturnType<
    (typeof import("@/testing/mocks"))["createMockSupabaseClient"]
  >;
  let mockValidation: ReturnType<
    (typeof import("@/testing/mocks"))["createMockValidation"]
  >;
  let mockLinearRegression: ReturnType<typeof createMockLinearRegression>;

  beforeEach(async () => {
    clearAllMocks();

    const setup = await setupApiClientTest();
    mockSupabaseClient = setup.mockSupabaseClient;
    mockValidation = setup.mockValidation;

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

  it("should return empty graph data when no rows are found", async () => {
    const mockQuery = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: undefined }),
      select: vi.fn().mockReturnThis(),
    };

    mockSupabaseClient.from.mockReturnValue(mockQuery);

    await expect(FetchTrendGraphData("avg", 1)).resolves.toEqual({
      increase_per_year: 0,
      trendline_pets: [],
      year_pets: [],
      years: [],
    });
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

    vi.mocked(mockLinearRegression.predict).mockImplementation(() => {
      throw new Error("Regression calculation failed");
    });

    await expect(FetchTrendGraphData("avg", 1)).rejects.toThrow(
      "Failed to fetch trend graph data for location 1 (avg): Regression calculation failed"
    );
  });

  it("should handle database response with null data", async () => {
    const mockQuery = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: undefined, error: undefined }),
      select: vi.fn().mockReturnThis(),
    };

    mockSupabaseClient.from.mockReturnValue(mockQuery);

    await expect(FetchTrendGraphData("avg", 1)).resolves.toEqual({
      increase_per_year: 0,
      trendline_pets: [],
      year_pets: [],
      years: [],
    });
  });
});

describe("FetchForecastData", () => {
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

  it("should throw error when called in non-browser environment", async () => {
    const originalWindow = globalThis.window;

    Reflect.deleteProperty(globalThis, "window");

    await expect(FetchForecastData(1, 10)).rejects.toThrow(
      "FetchForecastData can only be called in browser environment"
    );

    globalThis.window = originalWindow;
  });

  it("should throw FetchError for invalid location ID", async () => {
    mockValidation.validateLocationId.mockReturnValue(false);

    await expect(FetchForecastData(-1, 10)).rejects.toThrow(
      new FetchError("Invalid location ID: -1")
    );
  });

  it("should fetch forecast data successfully", async () => {
    const mockHistoricalData = [{ year: 2025 }];
    const mockForecastData = [
      { lower: 28.5, pet: 30.5, upper: 32.5, year: 2026 },
      { lower: 29, pet: 31, upper: 33, year: 2027 },
    ];

    const mockHistoricalQuery = {
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: mockHistoricalData }),
      order: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
    };

    const mockForecastQuery = {
      eq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi
        .fn()
        .mockResolvedValue({ data: mockForecastData, error: undefined }),
      select: vi.fn().mockReturnThis(),
    };

    mockSupabaseClient.from
      .mockReturnValueOnce(mockHistoricalQuery)
      .mockReturnValueOnce(mockForecastQuery);

    const result = await FetchForecastData(1, 10);

    expect(mockSupabaseClient.from).toHaveBeenNthCalledWith(1, "pet_year_avg");
    expect(mockSupabaseClient.from).toHaveBeenNthCalledWith(2, "pet_forecast");
    expect(mockSupabaseClient.from).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      forecastValues: [30.5, 31],
      forecastYears: [2026, 2027],
      lowerBound10: [28.5, 29],
      upperBound90: [32.5, 33],
    });
  });

  it("should return undefined when no historical data found", async () => {
    const mockHistoricalQuery = {
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [] }),
      order: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
    };

    mockSupabaseClient.from.mockReturnValue(mockHistoricalQuery);

    const result = await FetchForecastData(1, 10);

    expect(result).toBeUndefined();
  });

  it("should return undefined when no forecast data found", async () => {
    const mockHistoricalData = [{ year: 2025 }];

    const mockHistoricalQuery = {
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: mockHistoricalData }),
      order: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
    };

    const mockForecastQuery = {
      eq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: undefined }),
      select: vi.fn().mockReturnThis(),
    };

    mockSupabaseClient.from
      .mockReturnValueOnce(mockHistoricalQuery)
      .mockReturnValueOnce(mockForecastQuery);

    const result = await FetchForecastData(1, 10);

    expect(result).toBeUndefined();
  });

  it("should handle database errors when fetching forecast", async () => {
    const mockHistoricalData = [{ year: 2025 }];
    const mockError = new Error("Database connection failed");

    const mockHistoricalQuery = {
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: mockHistoricalData }),
      order: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
    };

    const mockForecastQuery = {
      eq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: undefined, error: mockError }),
      select: vi.fn().mockReturnThis(),
    };

    mockSupabaseClient.from
      .mockReturnValueOnce(mockHistoricalQuery)
      .mockReturnValueOnce(mockForecastQuery);

    await expect(FetchForecastData(1, 10)).rejects.toThrow(
      "Database error fetching forecast data"
    );
  });

  it("should calculate correct target year based on yearsAhead", async () => {
    const mockHistoricalData = [{ year: 2020 }];
    const mockForecastData = [
      { lower: 28.5, pet: 30.5, upper: 32.5, year: 2021 },
      { lower: 30, pet: 32, upper: 34, year: 2025 },
    ];

    const mockHistoricalQuery = {
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: mockHistoricalData }),
      order: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
    };

    const mockForecastQuery = {
      eq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi
        .fn()
        .mockResolvedValue({ data: mockForecastData, error: undefined }),
      select: vi.fn().mockReturnThis(),
    };

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

    const mockHistoricalQuery = {
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: mockHistoricalData }),
      order: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
    };

    const mockForecastQuery = {
      eq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi
        .fn()
        .mockResolvedValue({ data: mockForecastData, error: undefined }),
      select: vi.fn().mockReturnThis(),
    };

    mockSupabaseClient.from
      .mockReturnValueOnce(mockHistoricalQuery)
      .mockReturnValueOnce(mockForecastQuery);

    const result = await FetchForecastData(1, 1);

    expect(result?.forecastValues).toEqual([30.5]);
    expect(result?.lowerBound10).toEqual([28.5]);
    expect(result?.upperBound90).toEqual([32.5]);
  });
});

describe("FetchReferenceGraphData export", () => {
  it("should export FetchReferenceGraphData", async () => {
    const { FetchReferenceGraphData } = await import("../fetch-client");
    expect(FetchReferenceGraphData).toBeDefined();
    expect(typeof FetchReferenceGraphData).toBe("function");
  });
});
