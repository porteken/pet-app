import { getServerDatabaseEnvironment } from "@/config/environment";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import type { Database } from "./types";
import type { ServerDatabaseEnvironment } from "@/config/environment";

declare global {
  let petAppDbSingleton: Kysely<Database> | undefined;
  let petAppPgPoolSingleton: Pool | undefined;
}

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
    database: environment.PGDATABASE,
    host: environment.PGHOST,
    max: process.env.NODE_ENV === "test" ? 1 : 10,
    password: environment.PGPASSWORD,
    port: environment.PGPORT,
    ssl: resolveSslConfiguration(environment.PGSSLMODE),
    user: environment.PGUSER,
  });
};

export const getDb = (): Kysely<Database> => {
  if (globalThis.petAppDbSingleton) {
    return globalThis.petAppDbSingleton;
  }

  const pool = globalThis.petAppPgPoolSingleton ?? createPool();
  globalThis.petAppPgPoolSingleton = pool;
  globalThis.petAppDbSingleton = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool,
    }),
  });

  return globalThis.petAppDbSingleton;
};
