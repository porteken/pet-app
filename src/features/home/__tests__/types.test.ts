import { describe, expect, it } from "vitest";

import type { MapProperties } from "../model/types";

describe("Home Types", () => {
  describe("MapProperties", () => {
    it("should have correct structure", () => {
      const mockMap: MapProperties = {
        initialForecastEnabled: false,
        initialForecastYearsAhead: 10,
        initialGraphMeasure: "avg",
        LocationOptions: [],
        locations: [],
      };

      expect(mockMap).toHaveProperty("initialForecastEnabled");
      expect(mockMap).toHaveProperty("initialGraphMeasure");
      expect(mockMap).toHaveProperty("initialForecastYearsAhead");
      expect(mockMap).toHaveProperty("LocationOptions");
      expect(mockMap).toHaveProperty("locations");
      expect(typeof mockMap.initialForecastEnabled).toBe("boolean");
      expect(typeof mockMap.initialGraphMeasure).toBe("string");
      expect(typeof mockMap.initialForecastYearsAhead).toBe("number");
      expect(Array.isArray(mockMap.LocationOptions)).toBe(true);
      expect(Array.isArray(mockMap.locations)).toBe(true);
    });

    it("should accept proper data structures", () => {
      const mockMap: MapProperties = {
        initialForecastEnabled: true,
        initialForecastYearsAhead: 15,
        initialGraphMeasure: "max",
        LocationOptions: [
          {
            items: [{ key: 1, title: "Test Location" }],
            title: "Test Section",
          },
        ],
        locations: [
          {
            city: "Test City",
            lat: 40.7128,
            lng: -74.006,
            location_id: 1,
            state: "Test State",
          },
        ],
      };

      expect(mockMap.initialForecastEnabled).toBe(true);
      expect(mockMap.initialGraphMeasure).toBe("max");
      expect(mockMap.initialForecastYearsAhead).toBe(15);
      expect(mockMap.LocationOptions).toHaveLength(1);
      expect(mockMap.locations).toHaveLength(1);
      expect(mockMap.locations[0]).toHaveProperty("city");
      expect(mockMap.locations[0]).toHaveProperty("location_id");
    });
  });
});
