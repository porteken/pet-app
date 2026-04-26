import { describe, expect, it } from "vitest";

import {
  getForecastHeatStressDescription,
  getHeatStressDescription,
  getHeatStressInfo,
} from "../heat-stress";

describe("heat-stress", () => {
  describe("getHeatStressInfo", () => {
    it("should return None to Slight for PET < 29", () => {
      const result = getHeatStressInfo(20);
      expect(result.level).toBe("None to Slight");
      expect(result.color).toBe("text-green-600");
      expect(result.value).toBe("20.0");
    });

    it("should return None to Slight for PET at boundary (28.9)", () => {
      const result = getHeatStressInfo(28.9);
      expect(result.level).toBe("None to Slight");
      expect(result.color).toBe("text-green-600");
      expect(result.value).toBe("28.9");
    });

    it("should return Moderate for PET = 29", () => {
      const result = getHeatStressInfo(29);
      expect(result.level).toBe("Moderate");
      expect(result.color).toBe("text-yellow-600");
      expect(result.value).toBe("29.0");
    });

    it("should return Moderate for PET between 29 and 35", () => {
      const result = getHeatStressInfo(32);
      expect(result.level).toBe("Moderate");
      expect(result.color).toBe("text-yellow-600");
      expect(result.value).toBe("32.0");
    });

    it("should return Moderate for PET at upper boundary (35)", () => {
      const result = getHeatStressInfo(35);
      expect(result.level).toBe("Moderate");
      expect(result.color).toBe("text-yellow-600");
      expect(result.value).toBe("35.0");
    });

    it("should return Strong for PET = 35.1", () => {
      const result = getHeatStressInfo(35.1);
      expect(result.level).toBe("Strong");
      expect(result.color).toBe("text-orange-600");
      expect(result.value).toBe("35.1");
    });

    it("should return Strong for PET between 35 and 41", () => {
      const result = getHeatStressInfo(38);
      expect(result.level).toBe("Strong");
      expect(result.color).toBe("text-orange-600");
      expect(result.value).toBe("38.0");
    });

    it("should return Strong for PET at upper boundary (41)", () => {
      const result = getHeatStressInfo(41);
      expect(result.level).toBe("Strong");
      expect(result.color).toBe("text-orange-600");
      expect(result.value).toBe("41.0");
    });

    it("should return Extreme for PET > 41", () => {
      const result = getHeatStressInfo(45);
      expect(result.level).toBe("Extreme");
      expect(result.color).toBe("text-red-600");
      expect(result.value).toBe("45.0");
    });

    it("should return Extreme for PET = 41.1", () => {
      const result = getHeatStressInfo(41.1);
      expect(result.level).toBe("Extreme");
      expect(result.color).toBe("text-red-600");
      expect(result.value).toBe("41.1");
    });

    it("should format value to 1 decimal place", () => {
      const result1 = getHeatStressInfo(35.678);
      expect(result1.value).toBe("35.7");

      const result2 = getHeatStressInfo(35.123);
      expect(result2.value).toBe("35.1");
    });
  });

  describe("getHeatStressDescription", () => {
    it("should return description for average measure type", () => {
      const result = getHeatStressDescription(32, "avg", 2024);
      expect(result.prefix).toBe("The 2024 annual average heat stress is");
      expect(result.value).toBe("32.0");
      expect(result.colorClass).toBe("text-yellow-600");
      expect(result.confidenceRange).toBeUndefined();
    });

    it("should return description for max measure type", () => {
      const result = getHeatStressDescription(38, "max", 2023);
      expect(result.prefix).toBe("The 2023 annual max heat stress is");
      expect(result.value).toBe("38.0");
      expect(result.colorClass).toBe("text-orange-600");
    });

    it("should use default year 2025 when not provided", () => {
      const result = getHeatStressDescription(30, "avg");
      expect(result.prefix).toBe("The 2025 annual average heat stress is");
    });

    it("should handle None to Slight heat stress level", () => {
      const result = getHeatStressDescription(25, "avg", 2024);
      expect(result.colorClass).toBe("text-green-600");
      expect(result.value).toBe("25.0");
    });

    it("should handle Extreme heat stress level", () => {
      const result = getHeatStressDescription(45, "max", 2024);
      expect(result.colorClass).toBe("text-red-600");
      expect(result.value).toBe("45.0");
    });
  });

  describe("getForecastHeatStressDescription", () => {
    it("should return forecast description with confidence range", () => {
      const result = getForecastHeatStressDescription(35, 2050, 32, 38);
      expect(result.prefix).toBe("By end of 2050, it could be");
      expect(result.value).toBe("35.0");
      expect(result.colorClass).toBe("text-yellow-600");
      expect(result.confidenceRange).toBe("(10-90%: 32.0-38.0°C)");
    });

    it("should handle forecast without confidence bounds", () => {
      const result = getForecastHeatStressDescription(35, 2050);
      expect(result.prefix).toBe("By end of 2050, it could be");
      expect(result.value).toBe("35.0");
      expect(result.confidenceRange).toBeUndefined();
    });

    it("should handle NaN lower bound", () => {
      const result = getForecastHeatStressDescription(35, 2050, Number.NaN, 38);
      expect(result.confidenceRange).toBeUndefined();
    });

    it("should handle NaN upper bound", () => {
      const result = getForecastHeatStressDescription(35, 2050, 32, Number.NaN);
      expect(result.confidenceRange).toBeUndefined();
    });

    it("should not show confidence range when bounds are too close (< 0.1)", () => {
      const result = getForecastHeatStressDescription(35, 2050, 35.01, 35.05);
      expect(result.confidenceRange).toBeUndefined();
    });

    it("should show confidence range when bounds are more than 0.1 apart", () => {
      const result = getForecastHeatStressDescription(35, 2050, 34.9, 35.1);
      expect(result.confidenceRange).toBe("(10-90%: 34.9-35.1°C)");
    });

    it("should handle None to Slight forecast", () => {
      const result = getForecastHeatStressDescription(25, 2050, 22, 28);
      expect(result.colorClass).toBe("text-green-600");
      expect(result.value).toBe("25.0");
      expect(result.confidenceRange).toBe("(10-90%: 22.0-28.0°C)");
    });

    it("should handle Moderate forecast", () => {
      const result = getForecastHeatStressDescription(32, 2050, 30, 34);
      expect(result.colorClass).toBe("text-yellow-600");
      expect(result.value).toBe("32.0");
    });

    it("should handle Strong forecast", () => {
      const result = getForecastHeatStressDescription(38, 2050, 36, 40);
      expect(result.colorClass).toBe("text-orange-600");
      expect(result.value).toBe("38.0");
    });

    it("should handle Extreme forecast", () => {
      const result = getForecastHeatStressDescription(45, 2050, 42, 48);
      expect(result.colorClass).toBe("text-red-600");
      expect(result.value).toBe("45.0");
      expect(result.confidenceRange).toBe("(10-90%: 42.0-48.0°C)");
    });

    it("should format confidence range values to 1 decimal place", () => {
      const result = getForecastHeatStressDescription(35, 2050, 32.456, 37.892);
      expect(result.confidenceRange).toBe("(10-90%: 32.5-37.9°C)");
    });

    it("should handle different forecast years", () => {
      const result1 = getForecastHeatStressDescription(35, 2030, 32, 38);
      expect(result1.prefix).toBe("By end of 2030, it could be");

      const result2 = getForecastHeatStressDescription(35, 2100, 32, 38);
      expect(result2.prefix).toBe("By end of 2100, it could be");
    });
  });
});
