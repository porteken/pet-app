import { describe, expect, it } from "vitest";

import type {
  FetchLocationProperties,
  LocationOptionItem,
  LocationOptionSection,
  LocationProperties,
  NavProperties,
  ReferenceGraphDataProperties,
  SelectOptionProperties,
  TrendGraphDataProperties,
} from "../types";

describe("Types", () => {
  describe("FetchLocationProperties", () => {
    it("should have correct structure", () => {
      const mockData: FetchLocationProperties = {
        LocationOptions: [],
        locations: [],
      };

      expect(mockData).toHaveProperty("LocationOptions");
      expect(mockData).toHaveProperty("locations");
    });
  });

  describe("LocationOptionItem", () => {
    it("should have correct structure", () => {
      const mockItem: LocationOptionItem = {
        key: 1,
        title: "Test Location",
      };

      expect(mockItem).toHaveProperty("key");
      expect(mockItem).toHaveProperty("title");
      expect(typeof mockItem.key).toBe("number");
      expect(typeof mockItem.title).toBe("string");
    });
  });

  describe("LocationOptionSection", () => {
    it("should have correct structure", () => {
      const mockSection: LocationOptionSection = {
        items: [],
        title: "Test Section",
      };

      expect(mockSection).toHaveProperty("items");
      expect(mockSection).toHaveProperty("title");
      expect(Array.isArray(mockSection.items)).toBe(true);
      expect(typeof mockSection.title).toBe("string");
    });
  });

  describe("LocationProperties", () => {
    it("should have correct structure", () => {
      const mockLocation: LocationProperties = {
        city: "Test City",
        lat: 40.7128,
        lng: -74.006,
        location_id: 1,
        state: "Test State",
      };

      expect(mockLocation).toHaveProperty("city");
      expect(mockLocation).toHaveProperty("lat");
      expect(mockLocation).toHaveProperty("lng");
      expect(mockLocation).toHaveProperty("location_id");
      expect(mockLocation).toHaveProperty("state");
      expect(typeof mockLocation.city).toBe("string");
      expect(typeof mockLocation.lat).toBe("number");
      expect(typeof mockLocation.lng).toBe("number");
      expect(typeof mockLocation.location_id).toBe("number");
      expect(typeof mockLocation.state).toBe("string");
    });
  });

  describe("NavProperties", () => {
    it("should have correct structure with all properties", () => {
      const mockNav: NavProperties = {
        id: 1,
        LocationOptions: [],
        name: "Test Name",
      };

      expect(mockNav).toHaveProperty("id");
      expect(mockNav).toHaveProperty("LocationOptions");
      expect(mockNav).toHaveProperty("name");
      expect(typeof mockNav.id).toBe("number");
      expect(Array.isArray(mockNav.LocationOptions)).toBe(true);
      expect(typeof mockNav.name).toBe("string");
    });

    it("should work with optional properties undefined", () => {
      const mockNav: NavProperties = {
        LocationOptions: [],
      };

      expect(mockNav).toHaveProperty("LocationOptions");
      expect(mockNav.id).toBeUndefined();
      expect(mockNav.name).toBeUndefined();
    });
  });

  describe("ReferenceGraphDataProperties", () => {
    it("should have correct structure", () => {
      const mockData: ReferenceGraphDataProperties = {
        dates: [new Date()],
        pets: [100],
      };

      expect(mockData).toHaveProperty("dates");
      expect(mockData).toHaveProperty("pets");
      expect(Array.isArray(mockData.dates)).toBe(true);
      expect(Array.isArray(mockData.pets)).toBe(true);
      expect(mockData.dates[0]).toBeInstanceOf(Date);
      expect(typeof mockData.pets[0]).toBe("number");
    });
  });

  describe("SelectOptionProperties", () => {
    it("should have correct structure", () => {
      const mockOption: SelectOptionProperties = {
        key: "test-key",
        label: "Test Label",
      };

      expect(mockOption).toHaveProperty("key");
      expect(mockOption).toHaveProperty("label");
      expect(typeof mockOption.key).toBe("string");
      expect(typeof mockOption.label).toBe("string");
    });
  });

  describe("TrendGraphDataProperties", () => {
    it("should have correct structure", () => {
      const mockData: TrendGraphDataProperties = {
        trendline_pets: [100, 110, 120],
        year_pets: [90, 100, 110],
        years: [2020, 2021, 2022],
      };

      expect(mockData).toHaveProperty("trendline_pets");
      expect(mockData).toHaveProperty("year_pets");
      expect(mockData).toHaveProperty("years");
      expect(Array.isArray(mockData.trendline_pets)).toBe(true);
      expect(Array.isArray(mockData.year_pets)).toBe(true);
      expect(Array.isArray(mockData.years)).toBe(true);
      expect(typeof mockData.trendline_pets[0]).toBe("number");
      expect(typeof mockData.year_pets[0]).toBe("number");
      expect(typeof mockData.years[0]).toBe("number");
    });
  });
});
