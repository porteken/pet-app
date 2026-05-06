// oxlint-disable-next-line import/no-unassigned-import
import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { yAxisMock } = vi.hoisted(() => ({
  yAxisMock: vi.fn<
    ({ children }: { children?: React.ReactNode }) => React.ReactNode
  >(({ children }) => <div data-testid="recharts-y-axis">{children}</div>),
}));

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
    YAxis: yAxisMock,
  };
});

import {
  GenerateReferenceGraph,
  GenerateTrendGraph,
} from "../components/generate-graph";

const mockTrendlinePets1 = [25, 26, 27];
const mockYearPets1 = [25.2, 26.1, 27.4];
const mockYears1 = [2020, 2021, 2022];

const emptyPets: number[] = [];
const emptyYears: number[] = [];
const emptyDates: Date[] = [];

const mockForecastData = {
  forecastValues: [28.6, 29.1],
  forecastYears: [2023, 2024],
  lowerBound10: [27.8, 28.1],
  upperBound90: [29.3, 30],
};
const mockTrendlinePets2 = [24.5, 25.5, 26.5];
const mockYearPets2 = [24.8, 25.9, 26.7];

const mockCurrentPets = [24, 26];
const mockDates = [new Date("2025-01-01"), new Date("2025-02-01")];
const mockReferencePets = [18, 20];

const mockTrendlinePets3 = [22, 27, 31];
const mockYearPets3 = [18, 24, 29];

const mockForecastData2 = {
  forecastValues: [29, 31],
  forecastYears: [2023, 2024],
  lowerBound10: [20, 19],
  upperBound90: [38, 39],
};

const mockTrendlinePets4 = [22, 27, 30];
const mockYearPets4 = [18, 24, 28];

const mockCurrentPets2 = [19, 31];
const mockReferencePets2 = [18, 28];

describe("graph Components", () => {
  beforeEach(() => {
    yAxisMock.mockClear();
  });

  it("sets a tighter y-axis domain around trend data", () => {
    render(
      <GenerateTrendGraph
        increasePerYear={0.5}
        option="avg"
        season="Annual"
        trendlinePets={mockTrendlinePets3}
        yearPets={mockYearPets3}
        years={mockYears1}
      />,
    );

    expect(yAxisMock).toHaveBeenCalledWith(
      expect.objectContaining({
        allowDataOverflow: true,
        domain: [16, 32],
      }),
      undefined,
    );
  });

  it("keeps the forecast y-axis tight to historical and forecast lines", () => {
    render(
      <GenerateTrendGraph
        forecastData={mockForecastData2}
        increasePerYear={0.5}
        option="avg"
        season="Annual"
        trendlinePets={mockTrendlinePets4}
        yearPets={mockYearPets4}
        years={mockYears1}
      />,
    );

    expect(yAxisMock).toHaveBeenCalledWith(
      expect.objectContaining({
        allowDataOverflow: true,
        domain: [16, 32],
      }),
      undefined,
    );
  });

  describe("generateTrendGraph", () => {
    it("renders the chart shell and descriptive title", () => {
      render(
        <GenerateTrendGraph
          increasePerYear={0.5}
          option="avg"
          season="Annual"
          trendlinePets={mockTrendlinePets1}
          yearPets={mockYearPets1}
          years={mockYears1}
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
          trendlinePets={emptyPets}
          yearPets={emptyPets}
          years={emptyYears}
        />,
      );

      expect(
        screen.getByText("No data available for the selected parameters."),
      ).toBeInTheDocument();
    });

    it("renders forecast-aware titles for maximum measure graphs", () => {
      render(
        <GenerateTrendGraph
          forecastData={mockForecastData}
          increasePerYear={0.42}
          option="max"
          season="Summer"
          trendlinePets={mockTrendlinePets2}
          yearPets={mockYearPets2}
          years={mockYears1}
        />,
      );

      expect(screen.getByText("Maximum Summer PET")).toBeInTheDocument();
      expect(screen.getAllByTestId("recharts-area")).toHaveLength(2);
    });
  });

  describe("generateReferenceGraph", () => {
    it("sets a tighter y-axis domain around reference data", () => {
      render(
        <GenerateReferenceGraph
          currentPets={mockCurrentPets2}
          currentYear={2025}
          dates={mockDates}
          referencePets={mockReferencePets2}
          referenceYear="2000"
          season="Annual"
        />,
      );

      expect(yAxisMock).toHaveBeenCalledWith(
        expect.objectContaining({
          allowDataOverflow: true,
          domain: [16, 32],
        }),
        undefined,
      );
    });

    it("renders the comparison chart title and wrapper", () => {
      render(
        <GenerateReferenceGraph
          currentPets={mockCurrentPets}
          currentYear={2025}
          dates={mockDates}
          referencePets={mockReferencePets}
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
          currentPets={emptyPets}
          dates={emptyDates}
          referencePets={emptyPets}
          referenceYear="2000"
        />,
      );

      expect(
        screen.getByText("No data available for the selected parameters."),
      ).toBeInTheDocument();
    });
  });
});
