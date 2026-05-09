import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ForecastQueryWindow } from "../queries";

interface QueryPlan {
  executeError?: unknown;
  executeResult?: unknown;
  executeTakeFirstError?: unknown;
  executeTakeFirstResult?: unknown;
  table?: string;
}

interface QueryRecord {
  limits: number[];
  orderBys: Array<[string, string]>;
  selects: unknown[];
  table: string;
  wheres: Array<[string, string, unknown]>;
}

interface QueryBuilder {
  execute: () => Promise<unknown>;
  executeTakeFirst: () => Promise<unknown>;
  limit: (value: number) => QueryBuilder;
  orderBy: (column: string, direction: string) => QueryBuilder;
  select: (selection: unknown) => QueryBuilder;
  where: (column: string, operator: string, value: unknown) => QueryBuilder;
}

interface DbMockClient {
  selectFrom: (table: string) => QueryBuilder;
}

const createSqlTag = () =>
  Object.assign(
    (strings: TemplateStringsArray, ...values: unknown[]) => ({
      as: (alias: string) => ({
        alias,
        strings: [...strings],
        values,
      }),
    }),
    {},
  );

const createRef = (column: string) => ({
  as: (alias: string) => ({ alias, column }),
  column,
});

const resolveSelection = (selection: unknown) => {
  if (typeof selection !== "function") {
    return selection;
  }

  return selection({
    ref: createRef,
  });
};

const createDbMock = (plans: QueryPlan[]) => {
  const records: QueryRecord[] = [];

  const getDb = vi.fn<() => DbMockClient>(() => ({
    selectFrom(table: string) {
      const plan = plans.shift() ?? {};
      if (plan.table !== undefined) {
        expect(table).toBe(plan.table);
      }

      const record: QueryRecord = {
        limits: [],
        orderBys: [],
        selects: [],
        table,
        wheres: [],
      };
      records.push(record);

      const builder: QueryBuilder = {
        execute: async () => {
          if (plan.executeError !== undefined) {
            throw plan.executeError;
          }

          return plan.executeResult ?? [];
        },
        executeTakeFirst: async () => {
          if (plan.executeTakeFirstError !== undefined) {
            throw plan.executeTakeFirstError;
          }

          return plan.executeTakeFirstResult;
        },
        limit(value: number) {
          record.limits.push(value);
          return builder;
        },
        orderBy(column: string, direction: string) {
          record.orderBys.push([column, direction]);
          return builder;
        },
        select(selection: unknown) {
          record.selects.push(resolveSelection(selection));

          return builder;
        },
        where(column: string, operator: string, value: unknown) {
          record.wheres.push([column, operator, value]);
          return builder;
        },
      };

      return builder;
    },
  }));

  return { getDb, records };
};

const loadQueriesModule = async ({
  e2e = false,
  plans = [],
}: {
  e2e?: boolean;
  plans?: QueryPlan[];
} = {}) => {
  const dbMock = createDbMock([...plans]);

  vi.doMock("@/config/environment", () => ({
    isE2ETestRun: () => e2e,
  }));
  vi.doMock("@/lib/db/kysely", () => ({
    getDb: dbMock.getDb,
  }));
  vi.doMock("kysely", () => ({
    sql: createSqlTag(),
  }));

  const queries = await import("../queries");

  return { dbMock, queries };
};

describe("db queries", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  describe("runtime mocks", () => {
    it("returns runtime city ranking rows for the requested season", async () => {
      const { queries } = await loadQueriesModule({ e2e: true });

      const summerRows = await queries.fetchCityRankingsRows(2024, "Summer");
      const winterRows = await queries.fetchCityRankingsRows(2024, "Winter");

      expect(summerRows).not.toHaveLength(0);
      expect(summerRows.every((row) => row.year === 2024)).toBe(true);
      expect(summerRows.map((row) => row.location_id)).toStrictEqual(
        winterRows.map((row) => row.location_id),
      );
      expect(Number(summerRows[0]?.avg_pet)).not.toBe(
        Number(winterRows[0]?.avg_pet),
      );
    });

    it("returns runtime location rows for both id column variants", async () => {
      const { queries } = await loadQueriesModule({ e2e: true });

      const idRows = await queries.fetchLocationRows("id");
      const locationIdRows = await queries.fetchLocationRows("location_id");

      expect(idRows[0]).toMatchObject({ city: "Phoenix", id: 1, state: "AZ" });
      expect(idRows[0]).not.toHaveProperty("location_id");
      expect(locationIdRows[0]).toMatchObject({
        city: "Phoenix",
        location_id: 1,
        state: "AZ",
      });
      expect(locationIdRows[0]).not.toHaveProperty("id");
    });

    it("returns sorted runtime trend rows for average and maximum PET", async () => {
      const { queries } = await loadQueriesModule({ e2e: true });

      const averageRows = await queries.fetchTrendGraphRows(1, "avg", "Winter");
      const maximumRows = await queries.fetchTrendGraphRows(1, "max", "Winter");

      expect(averageRows[0]).toMatchObject({ location_id: 1, year: 2000 });
      expect(averageRows.at(-1)).toMatchObject({ year: 2025 });
      expect(maximumRows[0]?.pet).not.toBe(averageRows[0]?.pet);
      expect(maximumRows.map((row) => row.year)).toStrictEqual(
        averageRows.map((row) => row.year),
      );
    });

    it("returns sorted runtime reference rows for a single year", async () => {
      const { queries } = await loadQueriesModule({ e2e: true });

      const rows = await queries.fetchReferenceGraphRows(1, "2001");

      expect(rows).toHaveLength(10);
      expect(rows[0]).toMatchObject({
        date: "2001-06-01",
        location_id: 1,
      });
      expect(rows.at(-1)).toMatchObject({ date: "2001-08-08" });
    });

    it("returns the latest runtime historical year or undefined", async () => {
      const { queries } = await loadQueriesModule({ e2e: true });

      await expect(
        queries.fetchHistoricalYearRow(1, "Annual"),
      ).resolves.toStrictEqual({
        year: 2025,
      });
      await expect(
        queries.fetchHistoricalYearRow(999),
      ).resolves.toBeUndefined();
    });

    it("returns runtime forecast rows within the requested window", async () => {
      const { queries } = await loadQueriesModule({ e2e: true });

      const springRows = await queries.fetchForecastRows(
        1,
        {
          lastHistoricalYear: 2025,
          targetYear: 2028,
        },
        "Spring",
      );
      const winterRows = await queries.fetchForecastRows(
        1,
        {
          lastHistoricalYear: 2025,
          targetYear: 2028,
        },
        "Winter",
      );

      expect(springRows.map((row) => row.year)).toStrictEqual([
        2026, 2027, 2028,
      ]);
      expect(winterRows.map((row) => row.year)).toStrictEqual([
        2026, 2027, 2028,
      ]);
      expect(Number(springRows[0]?.pet)).not.toBe(Number(winterRows[0]?.pet));
    });
  });

  describe("database queries", () => {
    it("falls back to city rankings without season when the column is missing", async () => {
      const { dbMock, queries } = await loadQueriesModule({
        plans: [
          {
            executeError: {
              code: "PGRST204",
              message:
                "Could not find the 'season' column of 'city_rankings_view' in the schema cache",
            },
            table: "city_rankings_view",
          },
          {
            executeResult: [{ city: "Phoenix" }],
            table: "city_rankings_view",
          },
        ],
      });

      await expect(
        queries.fetchCityRankingsRows(2024, "Summer"),
      ).resolves.toStrictEqual([{ city: "Phoenix" }]);

      expect(dbMock.records).toHaveLength(2);
      expect(dbMock.records[0]?.wheres).toStrictEqual([
        ["year", "=", 2024],
        ["season", "=", "Summer"],
      ]);
      expect(dbMock.records[1]?.wheres).toStrictEqual([["year", "=", 2024]]);
    });

    it("rethrows non-column errors from city rankings queries", async () => {
      const thrownError = "kapow";
      const { queries } = await loadQueriesModule({
        plans: [
          {
            executeError: thrownError,
            table: "city_rankings_view",
          },
        ],
      });

      await expect(queries.fetchCityRankingsRows(2024, "Summer")).rejects.toBe(
        thrownError,
      );
    });

    it("falls back from id to location_id when the legacy id column is missing", async () => {
      const { dbMock, queries } = await loadQueriesModule({
        plans: [
          {
            executeError: {
              code: "42703",
              message: "column locations.id does not exist",
            },
            table: "locations",
          },
          {
            executeResult: [{ city: "Phoenix", location_id: 1 }],
            table: "locations",
          },
        ],
      });

      await expect(queries.fetchLocationRows("id")).resolves.toStrictEqual([
        { city: "Phoenix", location_id: 1 },
      ]);

      expect(dbMock.records[0]?.selects[0]).toStrictEqual([
        "city",
        "lat",
        "lng",
        "id",
        "state",
      ]);
      expect(dbMock.records[1]?.selects[0]).toStrictEqual([
        "city",
        "lat",
        "lng",
        "location_id",
        "state",
      ]);
    });

    it("selects the requested trend metric and falls back when season is missing", async () => {
      const { dbMock, queries } = await loadQueriesModule({
        plans: [
          {
            executeError: {
              code: "42703",
              message: "column pet_year_stats.season does not exist",
            },
            table: "pet_year_stats",
          },
          {
            executeResult: [{ location_id: 5, pet: 33.4, year: 2024 }],
            table: "pet_year_stats",
          },
        ],
      });

      await expect(
        queries.fetchTrendGraphRows(5, "max", "Winter"),
      ).resolves.toStrictEqual([{ location_id: 5, pet: 33.4, year: 2024 }]);

      expect(dbMock.records[0]?.selects[0]).toStrictEqual([
        "location_id",
        "year",
        { alias: "pet", column: "max_pet" },
      ]);
      expect(dbMock.records[0]?.wheres).toStrictEqual([
        ["location_id", "=", 5],
        ["season", "=", "Winter"],
      ]);
      expect(dbMock.records[0]?.orderBys).toStrictEqual([["year", "asc"]]);
      expect(dbMock.records[1]?.wheres).toStrictEqual([
        ["location_id", "=", 5],
      ]);
    });

    it("builds the reference graph query with the expected date window", async () => {
      const { dbMock, queries } = await loadQueriesModule({
        plans: [
          {
            executeResult: [{ date: "2002-06-01", location_id: 1, pet: 19.5 }],
            table: "pet",
          },
        ],
      });

      await expect(
        queries.fetchReferenceGraphRows(1, "2002"),
      ).resolves.toStrictEqual([
        { date: "2002-06-01", location_id: 1, pet: 19.5 },
      ]);

      expect(dbMock.records[0]?.wheres).toStrictEqual([
        ["location_id", "=", 1],
        ["date", ">=", "2002-01-01"],
        ["date", "<", "2003-01-01"],
      ]);
      expect(dbMock.records[0]?.orderBys).toStrictEqual([["date", "asc"]]);
      expect(dbMock.records[0]?.selects[0]).toStrictEqual([
        {
          alias: "date",
          strings: ["cast(", " as text)"],
          values: [{ as: expect.any(Function), column: "date" }],
        },
        "location_id",
        "pet",
      ]);
    });

    it("falls back to historical year queries without season when needed", async () => {
      const { dbMock, queries } = await loadQueriesModule({
        plans: [
          {
            executeTakeFirstError: {
              code: "PGRST204",
              message:
                "Could not find the 'season' column of 'pet_year_stats' in the schema cache",
            },
            table: "pet_year_stats",
          },
          {
            executeTakeFirstResult: { year: 2024 },
            table: "pet_year_stats",
          },
        ],
      });

      await expect(
        queries.fetchHistoricalYearRow(3, "Fall"),
      ).resolves.toStrictEqual({ year: 2024 });

      expect(dbMock.records[0]?.wheres).toStrictEqual([
        ["location_id", "=", 3],
        ["season", "=", "Fall"],
      ]);
      expect(dbMock.records[0]?.orderBys).toStrictEqual([["year", "desc"]]);
      expect(dbMock.records[0]?.limits).toStrictEqual([1]);
      expect(dbMock.records[1]?.wheres).toStrictEqual([
        ["location_id", "=", 3],
      ]);
    });

    it("falls back to forecast queries without season when needed", async () => {
      const queryWindow: ForecastQueryWindow = {
        lastHistoricalYear: 2025,
        targetYear: 2030,
      };

      const { dbMock, queries } = await loadQueriesModule({
        plans: [
          {
            executeError: {
              code: "42703",
              message: "column pet_forecast.season does not exist",
            },
            table: "pet_forecast",
          },
          {
            executeResult: [{ lower: 28, pet: 30, upper: 32, year: 2026 }],
            table: "pet_forecast",
          },
        ],
      });

      await expect(
        queries.fetchForecastRows(8, queryWindow, "Spring"),
      ).resolves.toStrictEqual([{ lower: 28, pet: 30, upper: 32, year: 2026 }]);

      expect(dbMock.records[0]?.wheres).toStrictEqual([
        ["location_id", "=", 8],
        ["year", ">", 2025],
        ["year", "<=", 2030],
        ["season", "=", "Spring"],
      ]);
      expect(dbMock.records[0]?.orderBys).toStrictEqual([["year", "asc"]]);
      expect(dbMock.records[1]?.wheres).toStrictEqual([
        ["location_id", "=", 8],
        ["year", ">", 2025],
        ["year", "<=", 2030],
      ]);
    });
  });
});
