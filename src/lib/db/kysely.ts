import { getServerDatabaseEnvironment } from "@/config/environment";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import type { Database } from "./types";
import type { ServerDatabaseEnvironment } from "@/config/environment";

declare global {
  var petAppDbSingleton: Kysely<Database> | undefined;
  var petAppPgPoolSingleton: Pool | undefined;
}

const resolveSslConfiguration = (
  sslMode: ServerDatabaseEnvironment["PGSSLMODE"],
) => {
  switch (sslMode) {
    case "disable": {
      return false;
    }
    case "verify-ca":
    case "verify-full": {
      return { rejectUnauthorized: true };
    }
    default: {
      return { rejectUnauthorized: false };
    }
  }
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

export const destroyDb = async () => {
  await globalThis.petAppDbSingleton?.destroy();
  await globalThis.petAppPgPoolSingleton?.end();
  globalThis.petAppDbSingleton = undefined;
  globalThis.petAppPgPoolSingleton = undefined;
};
