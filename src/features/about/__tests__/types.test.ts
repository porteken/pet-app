import { describe, expect, it } from "vitest";

import type { AboutProperties } from "../types";

describe("About Types", () => {
  describe("AboutProperties", () => {
    it("should have correct structure", () => {
      const mockAbout: AboutProperties = {
        LocationOptions: [],
      };

      expect(mockAbout).toHaveProperty("LocationOptions");
      expect(Array.isArray(mockAbout.LocationOptions)).toBe(true);
    });

    it("should accept LocationOptionSection array", () => {
      const mockAbout: AboutProperties = {
        LocationOptions: [
          {
            items: [{ key: 1, title: "Test" }],
            title: "Test Section",
          },
        ],
      };

      expect(mockAbout.LocationOptions).toHaveLength(1);
      expect(mockAbout.LocationOptions[0]).toHaveProperty("items");
      expect(mockAbout.LocationOptions[0]).toHaveProperty("title");
    });
  });
});
