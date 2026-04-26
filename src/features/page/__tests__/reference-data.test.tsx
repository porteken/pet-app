import "@testing-library/jest-dom";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/graph", () => ({
  GenerateReferenceGraph: vi
    .fn()
    .mockResolvedValue(
      <div data-testid="mock-reference-graph">Reference Graph</div>,
    ),
}));

vi.mock("@/lib/api/fetch-client", () => ({
  FetchReferenceGraphData: vi.fn().mockResolvedValue({
    dates: [new Date("2023-01-01"), new Date("2023-02-01")],
    pets: [10, 20],
  }),
}));

import { GenerateReferenceGraph } from "@/features/graph";
import { FetchReferenceGraphData } from "@/lib/api/fetch-client";

import { ReferenceData } from "../components/reference-data";

const defaultProps: React.ComponentProps<typeof ReferenceData> = {
  CurrentDates: [new Date("2023-06-01"), new Date("2023-06-02")],
  CurrentPets: [22, 24],
  id: 1,
  initialReferenceYear: "2000",
  onReferenceYearChange: vi.fn(),
  referenceYear: "2000",
  ReferencePets: [18, 20],
};

describe("ReferenceData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(globalThis, "matchMedia", {
      value: vi.fn().mockImplementation(() => ({
        addEventListener: vi.fn(),
        addListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches: false,
        media: "(max-width: 639px)",
        onchange: undefined,
        removeEventListener: vi.fn(),
        removeListener: vi.fn(),
      })),
      writable: true,
    });
  });

  it("should render reference graph controls and graph", async () => {
    const { container } = render(<ReferenceData {...defaultProps} />);

    expect(screen.getByText("Reference Data")).toBeInTheDocument();
    expect(screen.getByLabelText("Reference Year")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("mock-reference-graph")).toBeInTheDocument();
    });

    expect(container.querySelector("#reference-data-graph")).toHaveClass(
      "flex-1",
    );
    expect(container.querySelector("#reference-data-graph")).not.toHaveClass(
      "mt-auto",
    );
  });

  it("should keep mobile graph legend collapsed by default and toggle open", async () => {
    Object.defineProperty(globalThis, "matchMedia", {
      value: vi.fn().mockImplementation(() => ({
        addEventListener: vi.fn(),
        addListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches: true,
        media: "(max-width: 639px)",
        onchange: undefined,
        removeEventListener: vi.fn(),
        removeListener: vi.fn(),
      })),
      writable: true,
    });

    render(<ReferenceData {...defaultProps} />);

    const toggle = screen.getByRole("button", { name: "Show Graph Legend" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await waitFor(() => {
      const calls = vi.mocked(GenerateReferenceGraph).mock.calls;
      expect(calls.at(-1)?.[4]).toBe(false);
      expect(calls.at(-1)?.[5]).toBe(true);
    });

    fireEvent.click(toggle);

    await waitFor(() => {
      const calls = vi.mocked(GenerateReferenceGraph).mock.calls;
      expect(calls.at(-1)?.[4]).toBe(true);
      expect(calls.at(-1)?.[5]).toBe(true);
    });
  });

  it("should notify the parent and fetch selected annual reference year data", async () => {
    const onReferenceYearChange = vi.fn();
    const { rerender } = render(
      <ReferenceData
        {...defaultProps}
        onReferenceYearChange={onReferenceYearChange}
      />,
    );

    const referenceYear = screen.getByLabelText("Reference Year");
    fireEvent.change(referenceYear, { target: { value: "2001" } });

    expect(onReferenceYearChange).toHaveBeenCalledWith("2001");

    rerender(
      <ReferenceData
        {...defaultProps}
        onReferenceYearChange={onReferenceYearChange}
        referenceYear="2001"
      />,
    );

    await waitFor(() => {
      expect(FetchReferenceGraphData).toHaveBeenCalledWith("2001", 1, "Annual");
    });
  });
});
