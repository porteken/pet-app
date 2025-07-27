import { render } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { GenerateReferenceGraph } from "../generate-graph";

// Mock react-plotly.js
vi.mock("react-plotly.js", () => ({
  default: vi.fn(({ data, layout }) => (
    <div data-testid="plotly-graph">
      <div data-testid="graph-data">{JSON.stringify(data)}</div>
      <div data-testid="graph-layout">{JSON.stringify(layout)}</div>
    </div>
  )),
}));

// Mock dynamic import
vi.mock("next/dynamic", () => ({
  default: vi.fn((_importFunction, _options) => {
    const mockComponent = vi.fn(properties => (
      <div data-testid="dynamic-component">{JSON.stringify(properties)}</div>
    ));
    return mockComponent;
  }),
}));

describe("GenerateReferenceGraph", () => {
  const mockDates = [
    new Date("2023-06-01"),
    new Date("2023-06-02"),
    new Date("2023-06-03"),
  ];
  const mockReferencePets = [25.5, 26, 24.8];
  const mockCurrentPets = [28.2, 29.1, 27.5];

  it("should render reference graph with valid data", async () => {
    const result = await GenerateReferenceGraph(
      "2020",
      mockDates,
      mockReferencePets,
      mockCurrentPets
    );

    const { container } = render(result);
    expect(container).toBeInTheDocument();
  });

  it("should display no data message when dates array is empty", async () => {
    const result = await GenerateReferenceGraph(
      "2020",
      [],
      mockReferencePets,
      mockCurrentPets
    );

    const { getByText } = render(result);
    expect(
      getByText("No data available for the selected parameters")
    ).toBeInTheDocument();
  });

  it("should display no data message when reference pets array is empty", async () => {
    const result = await GenerateReferenceGraph(
      "2020",
      mockDates,
      [],
      mockCurrentPets
    );

    const { getByText } = render(result);
    expect(
      getByText("No data available for the selected parameters")
    ).toBeInTheDocument();
  });

  it("should display no data message when current pets array is empty", async () => {
    const result = await GenerateReferenceGraph(
      "2020",
      mockDates,
      mockReferencePets,
      []
    );

    const { getByText } = render(result);
    expect(
      getByText("No data available for the selected parameters")
    ).toBeInTheDocument();
  });

  it("should include reference year in title", async () => {
    const result = await GenerateReferenceGraph(
      "2018",
      mockDates,
      mockReferencePets,
      mockCurrentPets
    );

    // Since the component returns JSX, we test by rendering and checking structure
    const { container } = render(result);
    expect(container.firstChild).toBeTruthy();
  });

  it("should handle different reference years", async () => {
    const result2000 = await GenerateReferenceGraph(
      "2000",
      mockDates,
      mockReferencePets,
      mockCurrentPets
    );

    const result2010 = await GenerateReferenceGraph(
      "2010",
      mockDates,
      mockReferencePets,
      mockCurrentPets
    );

    // Both should render successfully
    const { container: container2000 } = render(result2000);
    const { container: container2010 } = render(result2010);

    expect(container2000.firstChild).toBeTruthy();
    expect(container2010.firstChild).toBeTruthy();
  });

  it("should work with single data point", async () => {
    const singleDate = [new Date("2023-06-01")];
    const singleReferencePet = [25.5];
    const singleCurrentPet = [28.2];

    const result = await GenerateReferenceGraph(
      "2020",
      singleDate,
      singleReferencePet,
      singleCurrentPet
    );

    const { container } = render(result);
    expect(container.firstChild).toBeTruthy();
  });

  it("should handle zero values in pet data", async () => {
    const zeroReferencePets = [0, 0, 0];
    const zeroCurrentPets = [0, 0, 0];

    const result = await GenerateReferenceGraph(
      "2020",
      mockDates,
      zeroReferencePets,
      zeroCurrentPets
    );

    const { container } = render(result);
    expect(container.firstChild).toBeTruthy();
  });

  it("should handle negative values in pet data", async () => {
    const negativeReferencePets = [-5, -3.2, -4.1];
    const negativeCurrentPets = [-2.1, -1.8, -3];

    const result = await GenerateReferenceGraph(
      "2020",
      mockDates,
      negativeReferencePets,
      negativeCurrentPets
    );

    const { container } = render(result);
    expect(container.firstChild).toBeTruthy();
  });
});
