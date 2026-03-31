import { describe, expect, it } from "vitest";

import { GraphOptions, YearOptions } from "../select-options";

describe("Select Options", () => {
  describe("GraphOptions", () => {
    it("should return correct graph options", () => {
      expect(GraphOptions).toEqual([
        { key: "avg", label: "Average" },
        { key: "max", label: "Max" },
      ]);
    });
  });

  describe("YearOptions", () => {
    it("should return year options from 2000 to 2024", () => {
      const yearOptions = YearOptions();

      expect(yearOptions).toHaveLength(25);
      expect(yearOptions[0]).toEqual({ key: "2000", label: "2000" });
      expect(yearOptions[24]).toEqual({ key: "2024", label: "2024" });
    });
  });
});
