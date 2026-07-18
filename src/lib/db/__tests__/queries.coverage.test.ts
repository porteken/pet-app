import * as environment from "@/config/environment";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  fetchCityRankingsRows,
  fetchForecastRows,
  fetchHistoricalYearRow,
  fetchLocationRows,
  fetchTrendGraphRows,
} from "../queries";

const makePGRST204Error = (relation: string, column: string) =>
  Object.assign(new Error(`Column '${column}' not found in '${relation}'`), {
    code: "PGRST204",
    message: `Column '${column}' not found in '${relation}'`,
  });

const make42703Error = (relation: string, column: string) =>
  Object.assign(
    new Error(`column "${column}" of relation "${relation}" does not exist`),
    {
      code: "42703",
      message: `column "${column}" of relation "${relation}" does not exist`,
    },
  );

const makeUnknownError = () =>
  Object.assign(new Error("something went wrong"), { code: "99999" });

vi.mock("@/config/environment", async (importOriginal) => ({
  ...(await importOriginal<typeof environment>()),
  shouldUseRuntimeDbMocks: vi.fn<() => boolean>(() => false),
}));

const mockExecute = vi.fn<() => Promise<unknown>>();
const mockExecuteTakeFirst = vi.fn<() => Promise<unknown>>();

vi.mock("../kysely", () => ({
  getDb: () => ({
    selectFrom: () => ({
      select: () => ({
        where: function where() {
          return {
            where,
            orderBy: () => ({
              execute: mockExecute,
              executeTakeFirst: mockExecuteTakeFirst,
              limit: () => ({
                execute: mockExecute,
                executeTakeFirst: mockExecuteTakeFirst,
              }),
            }),
            execute: mockExecute,
            executeTakeFirst: mockExecuteTakeFirst,
          };
        },
        orderBy: () => ({
          execute: mockExecute,
        }),
        execute: mockExecute,
      }),
    }),
  }),
  withDbRetry: async (fn: () => Promise<unknown>) => fn(),
}));

vi.mock("@/lib/utils/errors", () => ({
  classifyDbError: (error: unknown) => error,
}));

describe("queries isMissingColumnError + fallback branches", () => {
  beforeEach(() => {
    vi.spyOn(environment, "shouldUseRuntimeDbMocks").mockReturnValue(false);
    mockExecute.mockReset();
    mockExecuteTakeFirst.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("fetchCityRankingsRows", () => {
    it("returns rows from DB when no error occurs", async () => {
      const rows = [{ location_id: 1, city: "Boston", avg_pet: 20 }];
      mockExecute.mockResolvedValue(rows);

      const result = await fetchCityRankingsRows(2024, "Summer");
      expect(result).toStrictEqual(rows);
    });

    it("falls back without season on PGRST204 missing-season error", async () => {
      const seasonError = makePGRST204Error("city_rankings_view", "season");
      const fallbackRows = [{ location_id: 1, city: "Boston", avg_pet: 20 }];
      mockExecute
        .mockRejectedValueOnce(seasonError)
        .mockResolvedValue(fallbackRows);

      const result = await fetchCityRankingsRows(2024, "Summer");
      expect(result).toStrictEqual(fallbackRows);
    });

    it("falls back without season on 42703 missing-season error", async () => {
      const seasonError = make42703Error("city_rankings_view", "season");
      const fallbackRows = [{ location_id: 2, city: "NYC", avg_pet: 22 }];
      mockExecute
        .mockRejectedValueOnce(seasonError)
        .mockResolvedValue(fallbackRows);

      const result = await fetchCityRankingsRows(2024, "Winter");
      expect(result).toStrictEqual(fallbackRows);
    });

    it("rethrows non-missing-column errors", async () => {
      mockExecute.mockRejectedValue(makeUnknownError());

      await expect(fetchCityRankingsRows(2024, "Summer")).rejects.toMatchObject(
        {
          code: "99999",
        },
      );
    });

    it("rethrows missing-column error when no season was provided", async () => {
      const err = makePGRST204Error("city_rankings_view", "season");
      mockExecute.mockRejectedValue(err);

      await expect(fetchCityRankingsRows(2024)).rejects.toBe(err);
    });
  });

  describe("fetchLocationRows", () => {
    it("returns rows from DB for 'id' column", async () => {
      const rows = [{ id: 1, city: "Boston", lat: 42, lng: -71, state: "MA" }];
      mockExecute.mockResolvedValue(rows);

      const result = await fetchLocationRows("id");
      expect(result).toStrictEqual(rows);
    });

    it("falls back to location_id column on PGRST204 id-missing error", async () => {
      const idError = makePGRST204Error("locations", "id");
      const fallbackRows = [
        { location_id: 1, city: "Boston", lat: 42, lng: -71, state: "MA" },
      ];
      mockExecute
        .mockRejectedValueOnce(idError)
        .mockResolvedValue(fallbackRows);

      const result = await fetchLocationRows("id");
      expect(result).toStrictEqual(fallbackRows);
    });

    it("rethrows when column is 'location_id' and error is not id-missing", async () => {
      mockExecute.mockRejectedValue(makeUnknownError());

      await expect(fetchLocationRows("location_id")).rejects.toMatchObject({
        code: "99999",
      });
    });

    it("rethrows non-missing-column errors for 'id' column", async () => {
      mockExecute.mockRejectedValue(makeUnknownError());

      await expect(fetchLocationRows("id")).rejects.toMatchObject({
        code: "99999",
      });
    });
  });

  describe("fetchTrendGraphRows", () => {
    it("returns rows from DB when no error occurs", async () => {
      const rows = [{ location_id: 1, year: 2020, pet: 15 }];
      mockExecute.mockResolvedValue(rows);

      const result = await fetchTrendGraphRows(1, "avg", "Annual");
      expect(result).toStrictEqual(rows);
    });

    it("falls back without season on PGRST204 missing-season error", async () => {
      const seasonError = makePGRST204Error("pet_year_stats", "season");
      const fallbackRows = [{ location_id: 1, year: 2020, pet: 15 }];
      mockExecute
        .mockRejectedValueOnce(seasonError)
        .mockResolvedValue(fallbackRows);

      const result = await fetchTrendGraphRows(1, "avg", "Summer");
      expect(result).toStrictEqual(fallbackRows);
    });

    it("falls back without season on 42703 missing-season error", async () => {
      const seasonError = make42703Error("pet_year_stats", "season");
      const fallbackRows = [{ location_id: 1, year: 2021, pet: 16 }];
      mockExecute
        .mockRejectedValueOnce(seasonError)
        .mockResolvedValue(fallbackRows);

      const result = await fetchTrendGraphRows(1, "max", "Winter");
      expect(result).toStrictEqual(fallbackRows);
    });

    it("rethrows non-missing-column errors", async () => {
      mockExecute.mockRejectedValue(makeUnknownError());

      await expect(
        fetchTrendGraphRows(1, "avg", "Spring"),
      ).rejects.toMatchObject({ code: "99999" });
    });

    it("rethrows missing-column error when no season is provided", async () => {
      const err = makePGRST204Error("pet_year_stats", "season");
      mockExecute.mockRejectedValue(err);

      await expect(fetchTrendGraphRows(1, "avg")).rejects.toBe(err);
    });
  });

  describe("fetchHistoricalYearRow", () => {
    it("returns a row from DB when no error occurs", async () => {
      mockExecuteTakeFirst.mockResolvedValue({ year: 2025 });

      const result = await fetchHistoricalYearRow(1, "Annual");
      expect(result).toStrictEqual({ year: 2025 });
    });

    it("falls back without season on PGRST204 missing-season error", async () => {
      const seasonError = makePGRST204Error("pet_year_stats", "season");
      mockExecuteTakeFirst
        .mockRejectedValueOnce(seasonError)
        .mockResolvedValue({ year: 2024 });

      const result = await fetchHistoricalYearRow(1, "Summer");
      expect(result).toStrictEqual({ year: 2024 });
    });

    it("falls back without season on 42703 missing-season error", async () => {
      const seasonError = make42703Error("pet_year_stats", "season");
      mockExecuteTakeFirst
        .mockRejectedValueOnce(seasonError)
        .mockResolvedValue({ year: 2023 });

      const result = await fetchHistoricalYearRow(1, "Fall");
      expect(result).toStrictEqual({ year: 2023 });
    });

    it("rethrows non-missing-column errors", async () => {
      mockExecuteTakeFirst.mockRejectedValue(makeUnknownError());

      await expect(fetchHistoricalYearRow(1, "Annual")).rejects.toMatchObject({
        code: "99999",
      });
    });

    it("rethrows missing-column error when no season is provided", async () => {
      const err = makePGRST204Error("pet_year_stats", "season");
      mockExecuteTakeFirst.mockRejectedValue(err);

      await expect(fetchHistoricalYearRow(1)).rejects.toBe(err);
    });
  });

  describe("fetchForecastRows", () => {
    const queryWindow = { lastHistoricalYear: 2025, targetYear: 2075 };

    it("returns rows from DB when no error occurs", async () => {
      const rows = [{ year: 2030, pet: 20, lower: 18, upper: 22 }];
      mockExecute.mockResolvedValue(rows);

      const result = await fetchForecastRows(1, queryWindow, "Annual", "avg");
      expect(result).toStrictEqual(rows);
    });

    it("uses pet_forecast_max table when option is max", async () => {
      const rows = [{ year: 2030, pet: 25, lower: 23, upper: 27 }];
      mockExecute.mockResolvedValue(rows);

      const result = await fetchForecastRows(1, queryWindow, "Annual", "max");
      expect(result).toStrictEqual(rows);
    });

    it("falls back without season on PGRST204 missing-season error (avg)", async () => {
      const seasonError = makePGRST204Error("pet_forecast", "season");
      const fallbackRows = [{ year: 2030, pet: 20, lower: 18, upper: 22 }];
      mockExecute
        .mockRejectedValueOnce(seasonError)
        .mockResolvedValue(fallbackRows);

      const result = await fetchForecastRows(1, queryWindow, "Summer", "avg");
      expect(result).toStrictEqual(fallbackRows);
    });

    it("falls back without season on 42703 missing-season error (max)", async () => {
      const seasonError = make42703Error("pet_forecast_max", "season");
      const fallbackRows = [{ year: 2031, pet: 26, lower: 24, upper: 28 }];
      mockExecute
        .mockRejectedValueOnce(seasonError)
        .mockResolvedValue(fallbackRows);

      const result = await fetchForecastRows(1, queryWindow, "Winter", "max");
      expect(result).toStrictEqual(fallbackRows);
    });

    it("rethrows non-missing-column errors", async () => {
      mockExecute.mockRejectedValue(makeUnknownError());

      await expect(
        fetchForecastRows(1, queryWindow, "Annual", "avg"),
      ).rejects.toMatchObject({ code: "99999" });
    });

    it("rethrows missing-column error when no season is provided", async () => {
      const err = makePGRST204Error("pet_forecast", "season");
      mockExecute.mockRejectedValue(err);

      await expect(
        fetchForecastRows(1, queryWindow, undefined, "avg"),
      ).rejects.toBe(err);
    });
  });
});

describe("isMissingColumnError guard paths", () => {
  beforeEach(() => {
    vi.spyOn(environment, "shouldUseRuntimeDbMocks").mockReturnValue(false);
    mockExecute.mockReset();
    mockExecuteTakeFirst.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rethrows null errors without treating them as missing-column errors", async () => {
    mockExecute.mockRejectedValue(null);

    await expect(fetchCityRankingsRows(2024, "Summer")).rejects.toBeNull();
  });

  it("rethrows primitive string errors without treating them as missing-column errors", async () => {
    mockExecute.mockRejectedValue("plain string error");

    await expect(fetchCityRankingsRows(2024, "Summer")).rejects.toBe(
      "plain string error",
    );
  });

  it("rethrows errors with non-string message property", async () => {
    const weirdError = { code: "PGRST204", message: 42 };
    mockExecute.mockRejectedValue(weirdError);

    await expect(fetchCityRankingsRows(2024, "Summer")).rejects.toBe(
      weirdError,
    );
  });

  it("does not treat a PGRST204 error for the wrong column as a match", async () => {
    const wrongColumnError = Object.assign(
      new Error("Column 'other_col' not found in 'city_rankings_view'"),
      {
        code: "PGRST204",
        message: "Column 'other_col' not found in 'city_rankings_view'",
      },
    );
    mockExecute.mockRejectedValue(wrongColumnError);

    await expect(fetchCityRankingsRows(2024, "Summer")).rejects.toBe(
      wrongColumnError,
    );
  });

  it("does not treat a 42703 error for an unrelated relation as a match", async () => {
    const wrongRelationError = Object.assign(
      new Error('column "season" of relation "other_table" does not exist'),
      {
        code: "42703",
        message: 'column "season" of relation "other_table" does not exist',
      },
    );
    mockExecute.mockRejectedValue(wrongRelationError);

    await expect(fetchCityRankingsRows(2024, "Summer")).rejects.toBe(
      wrongRelationError,
    );
  });
});
