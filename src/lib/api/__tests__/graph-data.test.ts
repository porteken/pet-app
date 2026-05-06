import { describe, expect, it } from "vitest";

import { mapTrendRowsToGraphData } from "../graph-data";

describe("mapTrendRowsToGraphData", () => {
  it("preserves valid negative yearly PET values", () => {
    const result = mapTrendRowsToGraphData([
      { pet: -4, year: 2000 },
      { pet: 0, year: 2001 },
      { pet: 4, year: 2002 },
    ]);

    expect(result).toStrictEqual({
      increase_per_year: 4,
      trendline_pets: [-4, 0, 4],
      year_pets: [-4, 0, 4],
      years: [2000, 2001, 2002],
    });
  });
});
