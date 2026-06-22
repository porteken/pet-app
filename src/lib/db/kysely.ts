import { getServerDatabaseEnvironment } from "@/config/environment";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import type { Database } from "./types";
import type { ServerDatabaseEnvironment } from "@/config/environment";

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
