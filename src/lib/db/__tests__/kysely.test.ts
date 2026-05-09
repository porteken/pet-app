import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ServerDatabaseEnvironment } from "@/config/environment";

interface MockConstructedClient<TKind extends string> {
  configuration: Record<string, unknown>;
  kind: TKind;
}

interface LoadKyselyModuleOptions {
  nodeEnv?: string;
  sslMode?: ServerDatabaseEnvironment["PGSSLMODE"];
}

const resetDbGlobals = () => {
  globalThis.petAppDbSingleton = undefined;
  globalThis.petAppPgPoolSingleton = undefined;
};

const loadKyselyModule = async ({
  nodeEnv = "development",
  sslMode = "require",
}: LoadKyselyModuleOptions = {}) => {
  vi.stubEnv("NODE_ENV", nodeEnv);

  const poolMock = vi.fn<
    (configuration: Record<string, unknown>) => MockConstructedClient<"pool">
  >(function MockPool(configuration: Record<string, unknown>) {
    return {
      configuration,
      kind: "pool",
    };
  });
  const postgresDialectMock = vi.fn<
    (configuration: Record<string, unknown>) => MockConstructedClient<"dialect">
  >(function MockPostgresDialect(configuration: Record<string, unknown>) {
    return {
      configuration,
      kind: "dialect",
    };
  });
  const kyselyMock = vi.fn<
    (configuration: Record<string, unknown>) => MockConstructedClient<"db">
  >(function MockKysely(configuration: Record<string, unknown>) {
    return {
      configuration,
      kind: "db",
    };
  });

  vi.doMock("@/config/environment", () => ({
    getServerDatabaseEnvironment: () => ({
      PGDATABASE: "pet",
      PGHOST: "db.example.test",
      PGPASSWORD: "postgres",
      PGPORT: 5432,
      PGSSLMODE: sslMode,
      PGUSER: "copilot",
    }),
  }));
  vi.doMock("kysely", () => ({
    Kysely: kyselyMock,
    PostgresDialect: postgresDialectMock,
  }));
  vi.doMock("pg", () => ({
    Pool: poolMock,
  }));

  const kyselyModule = await import("../kysely");

  return {
    kyselyModule,
    kyselyMock,
    poolMock,
    postgresDialectMock,
  };
};

describe("getDb", () => {
  beforeEach(() => {
    resetDbGlobals();
    vi.resetModules();
  });

  afterEach(() => {
    resetDbGlobals();
    vi.restoreAllMocks();
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("creates and caches a database client with ssl disabled in test mode", async () => {
    const { kyselyMock, kyselyModule, poolMock, postgresDialectMock } =
      await loadKyselyModule({ nodeEnv: "test", sslMode: "disable" });

    const firstDb = kyselyModule.getDb();
    const secondDb = kyselyModule.getDb();

    expect(secondDb).toBe(firstDb);
    expect(poolMock).toHaveBeenCalledTimes(1);
    expect(poolMock).toHaveBeenCalledWith({
      database: "pet",
      host: "db.example.test",
      max: 1,
      password: "postgres",
      port: 5432,
      ssl: false,
      user: "copilot",
    });

    const pool = poolMock.mock.results[0]?.value;
    const dialect = postgresDialectMock.mock.results[0]?.value;

    expect(globalThis.petAppPgPoolSingleton).toBe(pool);
    expect(globalThis.petAppDbSingleton).toBe(firstDb);
    expect(postgresDialectMock).toHaveBeenCalledWith({ pool });
    expect(kyselyMock).toHaveBeenCalledWith({ dialect });
  });

  it("uses strict ssl verification for verify-full mode", async () => {
    const { poolMock } = await loadKyselyModule({ sslMode: "verify-full" });

    await import("../kysely").then((module) => module.getDb());

    expect(poolMock).toHaveBeenCalledWith(
      expect.objectContaining({
        max: 10,
        ssl: { rejectUnauthorized: true },
      }),
    );
  });

  it("uses relaxed ssl for non-strict modes", async () => {
    const { poolMock } = await loadKyselyModule({ sslMode: "require" });

    await import("../kysely").then((module) => module.getDb());

    expect(poolMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ssl: { rejectUnauthorized: false },
      }),
    );
  });

  it("reuses an existing pool singleton", async () => {
    const existingPool = { existing: true };
    globalThis.petAppPgPoolSingleton = existingPool as never;

    const { kyselyModule, poolMock, postgresDialectMock } =
      await loadKyselyModule();

    const db = kyselyModule.getDb();

    expect(db).toBe(globalThis.petAppDbSingleton);
    expect(poolMock).not.toHaveBeenCalled();
    expect(postgresDialectMock).toHaveBeenCalledWith({ pool: existingPool });
  });

  it("returns an existing database singleton without rebuilding clients", async () => {
    const existingDb = { existing: true };
    globalThis.petAppDbSingleton = existingDb as never;

    const { kyselyMock, kyselyModule, poolMock, postgresDialectMock } =
      await loadKyselyModule();

    expect(kyselyModule.getDb()).toBe(existingDb);
    expect(poolMock).not.toHaveBeenCalled();
    expect(postgresDialectMock).not.toHaveBeenCalled();
    expect(kyselyMock).not.toHaveBeenCalled();
  });
});
