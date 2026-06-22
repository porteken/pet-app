import type { Database } from "./types";
import type { Kysely } from "kysely";
import type { Pool } from "pg";

declare global {
  var petAppDbSingleton: Kysely<Database> | undefined;
  var petAppPgPoolSingleton: Pool | undefined;
}
