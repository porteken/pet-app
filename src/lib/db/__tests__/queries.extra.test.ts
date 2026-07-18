import * as environment from "@/config/environment";
import { describe, expect, it, vi } from "vitest";

import {
  fetchCityRankingsRows,
  fetchLocationRows,
  fetchTrendGraphRows,
  fetchHistoricalYearRow,
  fetchForecastRows,
} from "../queries";

describe("db queries extra coverage", () => {
  it("uses runtime mock when runtime DB mocks are enabled", async () => {
    vi.spyOn(environment, "shouldUseRuntimeDbMocks").mockReturnValue(true);

    const rankings = await fetchCityRankingsRows(2024);
    expect(rankings).toBeInstanceOf(Array);

    const locations = await fetchLocationRows("id");
    expect(locations).toBeInstanceOf(Array);

    const trend = await fetchTrendGraphRows(1, "avg");
    expect(trend).toBeInstanceOf(Array);

    const historicalYear = await fetchHistoricalYearRow(1);
    expect(historicalYear).toBeDefined();

    const forecast = await fetchForecastRows(1, {
      lastHistoricalYear: 2020,
      targetYear: 2030,
    });
    expect(forecast).toBeInstanceOf(Array);

    vi.restoreAllMocks();
  });
});
