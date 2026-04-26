import { describe, expect, it } from "vitest";

import {
  getForecastHeatStressDescription,
  getHeatStressDescription,
  getHeatStressInfo,
} from "../thermal-stress";

describe("thermal-stress", () => {
  describe("getHeatStressInfo", () => {
    it("should return Extreme Cold Stress for PET < 4", () => {
      const result = getHeatStressInfo(3.9);
      expect(result.level).toBe("Extreme Cold Stress");
      expect(result.color).toBe("text-blue-900");
      expect(result.value).toBe("3.9");
    });

    it("should return Strong Cold Stress for PET from 4 to 8", () => {
      const result = getHeatStressInfo(4);
      expect(result.level).toBe("Strong Cold Stress");
      expect(result.color).toBe("text-blue-700");
      expect(result.value).toBe("4.0");
    });

    it("should keep PET = 8 in Strong Cold Stress", () => {
      const result = getHeatStressInfo(8);
      expect(result.level).toBe("Strong Cold Stress");
      expect(result.color).toBe("text-blue-700");
      expect(result.value).toBe("8.0");
    });

    it("should return Moderate Cold Stress for PET just above 8", () => {
      const result = getHeatStressInfo(8.1);
      expect(result.level).toBe("Moderate Cold Stress");
      expect(result.color).toBe("text-sky-700");
      expect(result.value).toBe("8.1");
    });

    it("should keep PET = 13 in Moderate Cold Stress", () => {
      const result = getHeatStressInfo(13);
      expect(result.level).toBe("Moderate Cold Stress");
      expect(result.color).toBe("text-sky-700");
      expect(result.value).toBe("13.0");
    });

    it("should return Slight Cold Stress for PET just above 13", () => {
      const result = getHeatStressInfo(13.1);
      expect(result.level).toBe("Slight Cold Stress");
      expect(result.color).toBe("text-cyan-600");
      expect(result.value).toBe("13.1");
    });

    it("should keep PET = 18 in Slight Cold Stress", () => {
      const result = getHeatStressInfo(18);
      expect(result.level).toBe("Slight Cold Stress");
      expect(result.color).toBe("text-cyan-600");
      expect(result.value).toBe("18.0");
    });

    it("should return No Thermal Stress for PET just above 18", () => {
      const result = getHeatStressInfo(18.1);
      expect(result.level).toBe("No Thermal Stress");
      expect(result.color).toBe("text-green-600");
      expect(result.value).toBe("18.1");
    });

    it("should keep PET = 23 in No Thermal Stress", () => {
      const result = getHeatStressInfo(23);
      expect(result.level).toBe("No Thermal Stress");
      expect(result.color).toBe("text-green-600");
      expect(result.value).toBe("23.0");
    });

    it("should return Slight Heat Stress for PET just above 23", () => {
      const result = getHeatStressInfo(23.1);
      expect(result.level).toBe("Slight Heat Stress");
      expect(result.color).toBe("text-yellow-600");
      expect(result.value).toBe("23.1");
    });

    it("should keep PET = 29 in Slight Heat Stress", () => {
      const result = getHeatStressInfo(29);
      expect(result.level).toBe("Slight Heat Stress");
      expect(result.color).toBe("text-yellow-600");
      expect(result.value).toBe("29.0");
    });

    it("should return Moderate Heat Stress for PET just above 29", () => {
      const result = getHeatStressInfo(29.1);
      expect(result.level).toBe("Moderate Heat Stress");
      expect(result.color).toBe("text-amber-600");
      expect(result.value).toBe("29.1");
    });

    it("should keep PET = 35 in Moderate Heat Stress", () => {
      const result = getHeatStressInfo(35);
      expect(result.level).toBe("Moderate Heat Stress");
      expect(result.color).toBe("text-amber-600");
      expect(result.value).toBe("35.0");
    });

    it("should return Strong Heat Stress for PET just above 35", () => {
      const result = getHeatStressInfo(35.1);
      expect(result.level).toBe("Strong Heat Stress");
      expect(result.color).toBe("text-orange-600");
      expect(result.value).toBe("35.1");
    });

    it("should keep PET = 41 in Strong Heat Stress", () => {
      const result = getHeatStressInfo(41);
      expect(result.level).toBe("Strong Heat Stress");
      expect(result.color).toBe("text-orange-600");
      expect(result.value).toBe("41.0");
    });

    it("should return Extreme Heat Stress for PET > 41", () => {
      const result = getHeatStressInfo(45);
      expect(result.level).toBe("Extreme Heat Stress");
      expect(result.color).toBe("text-red-600");
      expect(result.value).toBe("45.0");
    });

    it("should return Extreme Heat Stress for PET = 41.1", () => {
      const result = getHeatStressInfo(41.1);
      expect(result.level).toBe("Extreme Heat Stress");
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
      expect(result.prefix).toBe("The 2024 annual average thermal stress is");
      expect(result.value).toBe("32.0");
      expect(result.colorClass).toBe("text-amber-600");
      expect(result.confidenceRange).toBeUndefined();
    });

    it("should return description for max measure type", () => {
      const result = getHeatStressDescription(38, "max", 2023);
      expect(result.prefix).toBe("The 2023 annual max thermal stress is");
      expect(result.value).toBe("38.0");
      expect(result.colorClass).toBe("text-orange-600");
    });

    it("should use default year 2025 when not provided", () => {
      const result = getHeatStressDescription(30, "avg");
      expect(result.prefix).toBe("The 2025 annual average thermal stress is");
    });

    it("should handle No Thermal Stress level", () => {
      const result = getHeatStressDescription(22, "avg", 2024);
      expect(result.colorClass).toBe("text-green-600");
      expect(result.value).toBe("22.0");
    });

    it("should handle Extreme Heat Stress level", () => {
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
      expect(result.colorClass).toBe("text-amber-600");
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

    it("should handle No Thermal Stress forecast", () => {
      const result = getForecastHeatStressDescription(22, 2050, 20, 23);
      expect(result.colorClass).toBe("text-green-600");
      expect(result.value).toBe("22.0");
      expect(result.confidenceRange).toBe("(10-90%: 20.0-23.0°C)");
    });

    it("should handle Moderate Heat Stress forecast", () => {
      const result = getForecastHeatStressDescription(32, 2050, 30, 34);
      expect(result.colorClass).toBe("text-amber-600");
      expect(result.value).toBe("32.0");
    });

    it("should handle Strong Heat Stress forecast", () => {
      const result = getForecastHeatStressDescription(38, 2050, 36, 40);
      expect(result.colorClass).toBe("text-orange-600");
      expect(result.value).toBe("38.0");
    });

    it("should handle Extreme Heat Stress forecast", () => {
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
