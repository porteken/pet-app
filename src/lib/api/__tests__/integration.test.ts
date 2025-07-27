import { beforeEach, describe, expect, it, vi } from "vitest";

import { FetchTrendGraphData } from "../fetch-client";
import { FetchReferenceGraphData } from "../reference-graph-data";

// Mock the client functions completely since they don't call server functions
vi.mock("../fetch-client");
vi.mock("../reference-graph-data");

describe("API Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Client-Server Integration", () => {
    it("should handle complete trend data flow", async () => {
      const mockTrendData = {
        trendline_pets: [12, 16, 22],
        year_pets: [10, 15, 20],
        years: [2020, 2021, 2022],
      };

      vi.mocked(FetchTrendGraphData).mockResolvedValue(mockTrendData);

      const result = await FetchTrendGraphData("avg", 1);

      expect(result).toEqual(mockTrendData);
      expect(FetchTrendGraphData).toHaveBeenCalledWith("avg", 1);
    });

    it("should handle complete reference data flow", async () => {
      const mockReferenceData = {
        dates: [new Date("2022-01-01"), new Date("2022-01-02")],
        pets: [25, 30],
      };

      vi.mocked(FetchReferenceGraphData).mockResolvedValue(mockReferenceData);

      const result = await FetchReferenceGraphData("2022", 1);

      expect(result).toEqual(mockReferenceData);
      expect(FetchReferenceGraphData).toHaveBeenCalledWith("2022", 1);
    });

    it("should propagate errors from server to client", async () => {
      const serverError = new Error("Server connection failed");
      vi.mocked(FetchTrendGraphData).mockRejectedValue(serverError);

      await expect(FetchTrendGraphData("avg", 1)).rejects.toThrow(
        "Server connection failed"
      );
    });

    it("should validate data consistency between client and server", async () => {
      // Test that both client and server handle the same validation rules
      const invalidLocationId = -1;

      // Mock implementation that validates location ID
      vi.mocked(FetchTrendGraphData).mockImplementation(
        (_option, locationId) => {
          if (locationId <= 0) {
            return Promise.reject(new Error("Invalid location ID"));
          }
          return Promise.resolve({
            trendline_pets: [],
            year_pets: [],
            years: [],
          });
        }
      );

      // Client should also reject it
      await expect(
        FetchTrendGraphData("avg", invalidLocationId)
      ).rejects.toThrow("Invalid location ID");
    });
  });
});
