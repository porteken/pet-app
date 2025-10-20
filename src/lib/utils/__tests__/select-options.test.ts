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

    it("should have exactly 2 options", () => {
      expect(GraphOptions).toHaveLength(2);
    });

    it("should have valid structure for each option", () => {
      for (const option of GraphOptions) {
        expect(option).toHaveProperty("key");
        expect(option).toHaveProperty("label");
        expect(typeof option.key).toBe("string");
        expect(typeof option.label).toBe("string");
      }
    });
  });

  describe("YearOptions", () => {
    it("should return year options from 2000 to 2024", () => {
      const yearOptions = YearOptions();

      expect(yearOptions).toHaveLength(25);
      expect(yearOptions[0]).toEqual({ key: "2000", label: "2000" });
      expect(yearOptions[24]).toEqual({ key: "2024", label: "2024" });
    });

    it("should generate consecutive years", () => {
      const yearOptions = YearOptions();

      for (let index = 0; index < yearOptions.length - 1; index++) {
        const currentYear = Number.parseInt(yearOptions[index].key, 10);
        const nextYear = Number.parseInt(yearOptions[index + 1].key, 10);
        expect(nextYear).toBe(currentYear + 1);
      }
    });

    it("should have valid structure for each year option", () => {
      const yearOptions = YearOptions();

      for (const option of yearOptions) {
        expect(option).toHaveProperty("key");
        expect(option).toHaveProperty("label");
        expect(typeof option.key).toBe("string");
        expect(typeof option.label).toBe("string");
        expect(option.key).toBe(option.label);

        const year = Number.parseInt(option.key, 10);
        expect(year).toBeGreaterThanOrEqual(2000);
        expect(year).toBeLessThan(2025);
      }
    });

    it("should return a new array each time", () => {
      const options1 = YearOptions();
      const options2 = YearOptions();

      expect(options1).toEqual(options2);
      expect(options1).not.toBe(options2);
    });

    it("should handle year range configuration", () => {
      const yearOptions = YearOptions();
      const startYear = Number.parseInt(yearOptions[0].key, 10);
      const endYear = Number.parseInt(yearOptions.at(-1)!.key, 10);

      expect(startYear).toBe(2000);
      expect(endYear).toBe(2024);
      expect(yearOptions.length).toBe(endYear - startYear + 1);
    });
  });
});
