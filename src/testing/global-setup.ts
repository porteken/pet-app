/* eslint-disable unicorn/prefer-module, sonarjs/sql-queries */
import fs from "node:fs/promises";
import path from "node:path";

import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { Client } from "pg";

import { getRuntimeMockTableRows } from "./runtime-mocks";
let container: any;

export async function setup() {
  console.warn("Starting PostgreSQL Testcontainer...");
  container = await new PostgreSqlContainer("postgres:16-alpine").start();

  const client = new Client({
    connectionString: `${container.getConnectionUri()}?sslmode=disable`,
  });
  await client.connect();

  console.warn("Applying schema and seeding data...");

  // 1. Create tables
  const createTablesSql = await fs.readFile(
    path.join(import.meta.dirname, "db/schema/create_tables.sql"),
    "utf8",
  );
  await client.query(createTablesSql);

  // 2. Seed locations
  const locations = getRuntimeMockTableRows("locations") as any[];
  if (locations.length > 0) {
    const locationValues = locations
      .map(
        (loc) =>
          `(${loc.id}, '${loc.city.replace(/'/gu, "''")}', '${loc.state.replace(/'/gu, "''")}', ${loc.lat}, ${loc.lng})`,
      )
      .join(", ");
    await client.query(
      `INSERT INTO locations (id, city, state, lat, lng) VALUES ${locationValues};`,
    );
  }

  // 3. Seed pet data
  const pets = getRuntimeMockTableRows("pet") as any[];
  if (pets.length > 0) {
    const chunkSize = 1000;
    for (let i = 0; i < pets.length; i += chunkSize) {
      const chunk = pets.slice(i, i + chunkSize);
      const petValues = chunk
        .map((p) => `(${p.location_id}, '${p.date}', ${p.pet})`)
        .join(", ");
      await client.query(
        `INSERT INTO pet (location_id, date, pet) VALUES ${petValues};`,
      );
    }
  }

  // 4. Create views (this will compute materialized views from the seeded data)
  const createViewsSql = await fs.readFile(
    path.join(import.meta.dirname, "db/schema/create_views.sql"),
    "utf8",
  );
  await client.query(createViewsSql);

  await client.end();

  // Set environment variables for Vitest workers
  process.env.PGDATABASE = container.getDatabase();
  process.env.PGHOST = container.getHost();
  process.env.PGPASSWORD = container.getPassword();
  process.env.PGPORT = container.getPort().toString();
  process.env.PGUSER = container.getUsername();
  process.env.PGSSLMODE = "disable";

  // Make sure E2E test runs are disabled during these vitest runs
  process.env.NEXT_PUBLIC_E2E_TEST = "false";

  console.warn("PostgreSQL Testcontainer ready on port", process.env.PGPORT);
}

export async function teardown() {
  if (container) {
    console.warn("Stopping PostgreSQL Testcontainer...");
    await container.stop();
  }
}
