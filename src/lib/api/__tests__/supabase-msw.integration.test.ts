import { FetchTrendGraphData } from "@/lib/api/fetch-client";
import { FetchReferenceGraphData } from "@/lib/api/reference-graph-data";
import { server } from "@/testing/server";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

describe("supabase MSW integration", () => {
  it("fetches trend graph data through MSW-backed Supabase responses", async () => {
    const result = await FetchTrendGraphData("avg", 1);

    expect(result.years.length).toBeGreaterThan(0);
    expect(result.year_pets).toHaveLength(result.years.length);
    expect(result.years[0]).toBe(2000);
  });

  it("fetches reference graph data through MSW-backed Supabase responses", async () => {
    const result = await FetchReferenceGraphData("2025", 1);

    expect(result.dates.length).toBeGreaterThan(0);
    expect(result.pets).toHaveLength(result.dates.length);
  });

  it("fails with a validation error when MSW returns malformed trend data", async () => {
    server.use(
      http.get("*/rest/v1/pet_year_stats", () =>
        HttpResponse.json([
          { location_id: 1, pet: "not-a-number", year: 2025 },
        ]),
      ),
    );

    await expect(FetchTrendGraphData("avg", 1)).rejects.toThrow(
      "response validation failed",
    );
  });
});
