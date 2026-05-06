import { describe, expect, it } from "vitest";

import { GraphOptions, YearOptions } from "../select-options";

describe("select Options", () => {
  describe("graphOptions", () => {
    it("should return correct graph options", () => {
      expect(GraphOptions).toStrictEqual([
        { key: "avg", label: "Average" },
        { key: "max", label: "Max" },
      ]);
    });
  });

  describe("yearOptions", () => {
    it("should return year options from 2000 to 2025", () => {
      const yearOptions = YearOptions();

      expect(yearOptions).toHaveLength(26);
      expect(yearOptions[0]).toStrictEqual({ key: "2000", label: "2000" });
      expect(yearOptions[25]).toStrictEqual({ key: "2025", label: "2025" });
    });
  });
});
