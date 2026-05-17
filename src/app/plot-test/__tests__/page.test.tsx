import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ReactNode } from "react";

interface LineStubProperties extends Record<string, unknown> {
  children?: ReactNode;
}

const { mockLine } = vi.hoisted(() => ({
  mockLine: vi.fn<(props: LineStubProperties) => ReactNode>(({ children }) => (
    <div data-testid="recharts-line">{children}</div>
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
  ResponsiveContainer: createRechartsStub("recharts-responsive-container"),
  XAxis: createRechartsStub("recharts-x-axis"),
  YAxis: createRechartsStub("recharts-y-axis"),
}));

import Page from "../page";

describe("plot test page", () => {
  beforeEach(() => {
    mockLine.mockClear();
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
  });

  it("toggles the chart visibility", () => {
    render(<Page />);

    fireEvent.click(screen.getByRole("button", { name: "Toggle" }));
    expect(screen.queryByTestId("plot-test-chart")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Toggle" }));
    expect(screen.getByTestId("plot-test-chart")).toBeInTheDocument();
  });
});
