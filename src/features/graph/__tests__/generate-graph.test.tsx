import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("recharts", async () => {
  const createStub =
    (testId: string) =>
    ({ children }: { children?: React.ReactNode }) => (
      <div data-testid={testId}>{children}</div>
    );

  return {
    Area: createStub("recharts-area"),
    CartesianGrid: createStub("recharts-grid"),
    ComposedChart: createStub("recharts-chart"),
    Legend: createStub("recharts-legend"),
    Line: createStub("recharts-line"),
    ResponsiveContainer: createStub("recharts-responsive-container"),
    Tooltip: createStub("recharts-tooltip"),
    XAxis: createStub("recharts-x-axis"),
    YAxis: createStub("recharts-y-axis"),
  };
});

import {
  GenerateReferenceGraph,
  GenerateTrendGraph,
} from "../components/generate-graph";

describe("Graph Components", () => {
  describe("GenerateTrendGraph", () => {
    it("renders the chart shell and descriptive title", () => {
      render(
        <GenerateTrendGraph
          increasePerYear={0.5}
          option="avg"
          season="Annual"
          trendlinePets={[25, 26, 27]}
          yearPets={[25.2, 26.1, 27.4]}
          years={[2020, 2021, 2022]}
        />,
      );

      expect(screen.getByText("Average Annual PET")).toBeInTheDocument();
      expect(
        screen.getByText("2020–2022 · Increase per year: +0.50°C"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("trend-chart")).toBeInTheDocument();
      expect(
        screen.getByTestId("recharts-responsive-container"),
      ).toBeInTheDocument();
    });

    it("renders the empty state when there is no trend data", () => {
      render(
        <GenerateTrendGraph
          increasePerYear={0}
          option="avg"
          trendlinePets={[]}
          yearPets={[]}
          years={[]}
        />,
      );

      expect(
        screen.getByText("No data available for the selected parameters."),
      ).toBeInTheDocument();
    });

    it("renders forecast-aware titles for maximum measure graphs", () => {
      render(
        <GenerateTrendGraph
          forecastData={{
            forecastValues: [28.6, 29.1],
            forecastYears: [2023, 2024],
            lowerBound10: [27.8, 28.1],
            upperBound90: [29.3, 30],
          }}
          increasePerYear={0.42}
          option="max"
          season="Summer"
          trendlinePets={[24.5, 25.5, 26.5]}
          yearPets={[24.8, 25.9, 26.7]}
          years={[2020, 2021, 2022]}
        />,
      );

      expect(screen.getByText("Maximum Summer PET")).toBeInTheDocument();
      expect(screen.getAllByTestId("recharts-area")).toHaveLength(2);
    });
  });

  describe("GenerateReferenceGraph", () => {
    it("renders the comparison chart title and wrapper", () => {
      render(
        <GenerateReferenceGraph
          currentPets={[24, 26]}
          currentYear={2025}
          dates={[new Date("2025-01-01"), new Date("2025-02-01")]}
          referencePets={[18, 20]}
          referenceYear="2000"
          season="Annual"
        />,
      );

      expect(
        screen.getByText("Annual PET in 2025 vs 2000"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("reference-chart")).toBeInTheDocument();
    });

    it("renders the empty state when reference data is unavailable", () => {
      render(
        <GenerateReferenceGraph
          currentPets={[]}
          dates={[]}
          referencePets={[]}
          referenceYear="2000"
        />,
      );

      expect(
        screen.getByText("No data available for the selected parameters."),
      ).toBeInTheDocument();
    });
  });
});
