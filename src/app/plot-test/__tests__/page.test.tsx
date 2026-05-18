import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ReactNode } from "react";

interface LineStubProperties extends Record<string, unknown> {
  children?: ReactNode;
}

interface ResponsiveContainerStubProperties extends Record<string, unknown> {
  children?: ReactNode;
  initialDimension?: { height: number; width: number };
}

const { mockLine, mockResponsiveContainer } = vi.hoisted(() => ({
  mockLine: vi.fn<(props: LineStubProperties) => ReactNode>(({ children }) => (
    <div data-testid="recharts-line">{children}</div>
  )),
  mockResponsiveContainer: vi.fn<
    (props: ResponsiveContainerStubProperties) => ReactNode
  >(({ children }) => (
    <div data-testid="recharts-responsive-container">{children}</div>
  )),
}));

function createRechartsStub(testId: string) {
  return ({ children }: { children?: ReactNode }) => (
    <div data-testid={testId}>{children}</div>
  );
}

vi.mock("recharts", () => ({
  CartesianGrid: createRechartsStub("recharts-grid"),
  Line: mockLine,
  LineChart: createRechartsStub("recharts-line-chart"),
  ResponsiveContainer: mockResponsiveContainer,
  XAxis: createRechartsStub("recharts-x-axis"),
  YAxis: createRechartsStub("recharts-y-axis"),
}));

import Page from "../page";

describe("plot test page", () => {
  beforeEach(() => {
    mockLine.mockClear();
    mockResponsiveContainer.mockClear();
  });

  it("renders the chart by default", () => {
    render(<Page />);

    expect(screen.getByRole("button", { name: "Toggle" })).toBeInTheDocument();
    expect(screen.getByTestId("plot-test-chart")).toBeInTheDocument();
    expect(
      screen.getByTestId("recharts-responsive-container"),
    ).toBeInTheDocument();
    expect(mockLine).toHaveBeenCalledWith(
      expect.objectContaining({
        dataKey: "value",
        dot: { fill: "var(--graph-primary)", r: 4 },
        stroke: "var(--graph-primary)",
        strokeWidth: 2.5,
        type: "monotone",
      }),
      undefined,
    );

    const responsiveContainerProps = mockResponsiveContainer.mock.calls[0]?.[0];

    expect(responsiveContainerProps).toStrictEqual(
      expect.objectContaining({
        height: "100%",
        initialDimension: expect.objectContaining({
          height: expect.any(Number),
          width: expect.any(Number),
        }),
        width: "100%",
      }),
    );
    expect(responsiveContainerProps?.initialDimension?.width).toBeGreaterThan(
      0,
    );
    expect(responsiveContainerProps?.initialDimension?.height).toBeGreaterThan(
      0,
    );
  });

  it("toggles the chart visibility", () => {
    render(<Page />);

    fireEvent.click(screen.getByRole("button", { name: "Toggle" }));
    expect(screen.queryByTestId("plot-test-chart")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Toggle" }));
    expect(screen.getByTestId("plot-test-chart")).toBeInTheDocument();
  });
});
