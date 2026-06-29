import { getServerDatabaseEnvironment } from "@/config/environment";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import type { Database } from "./types";
import type { ServerDatabaseEnvironment } from "@/config/environment";

const DB_RETRY_ATTEMPTS = 3;
const DB_RETRY_BASE_DELAY_MS = 200;

export const withDbRetry = async <T>(fn: () => Promise<T>): Promise<T> => {
  let lastError: unknown;
  for (let attempt = 0; attempt < DB_RETRY_ATTEMPTS; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < DB_RETRY_ATTEMPTS - 1) {
        await new Promise<void>((resolve) => {
          setTimeout(resolve, DB_RETRY_BASE_DELAY_MS * 2 ** attempt);
        });
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
};

const dbSingletonKey = "petAppDbSingleton";
const pgPoolSingletonKey = "petAppPgPoolSingleton";

type PetAppGlobal = typeof globalThis & {
  [dbSingletonKey]?: Kysely<Database>;
  [pgPoolSingletonKey]?: Pool;
};

const resolveSslConfiguration = (
  sslMode: ServerDatabaseEnvironment["PGSSLMODE"],
) => {
  if (sslMode === "disable") {
    return false;
  }

  return {
    rejectUnauthorized: sslMode === "verify-ca" || sslMode === "verify-full",
  };
};

const createPool = () => {
  const environment = getServerDatabaseEnvironment();

  return new Pool({
    connectionTimeoutMillis: 5000,
    database: environment.PGDATABASE,
    host: environment.PGHOST,
    idleTimeoutMillis: 30_000,
    max: process.env.NODE_ENV === "test" ? 1 : 10,
    password: environment.PGPASSWORD,
    port: environment.PGPORT,
    ssl: resolveSslConfiguration(environment.PGSSLMODE),
    user: environment.PGUSER,
  });
};

export const getDb = (): Kysely<Database> => {
  const petAppGlobal = globalThis as PetAppGlobal;

  if (petAppGlobal[dbSingletonKey]) {
    return petAppGlobal[dbSingletonKey];
  }

  const pool = petAppGlobal[pgPoolSingletonKey] ?? createPool();
  petAppGlobal[pgPoolSingletonKey] = pool;
  petAppGlobal[dbSingletonKey] = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool,
    }),
  });

  return petAppGlobal[dbSingletonKey];
};
