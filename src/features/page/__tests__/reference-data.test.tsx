import { GenerateReferenceGraph } from "@/features/graph";
import { FetchReferenceGraphData } from "@/lib/api/fetch-client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ReferenceData } from "../components/reference-data";

const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(ui, { wrapper: Wrapper });
};

vi.mock("@/features/graph", () => ({
  // Returns the element lazily from the mock implementation rather than via
  // mockReturnValue: this factory is hoisted and triggered by the top-level
  // `@/features/graph` import before the auto-injected jsx-runtime import has
  // initialized, so evaluating JSX at factory time would throw a TDZ error.
  GenerateReferenceGraph: mockFn(() => (
    <div data-testid="mock-reference-graph">Reference Graph</div>
  )),
}));

vi.mock("@/lib/api/fetch-client", () => ({
  FetchReferenceGraphData: mockFn().mockResolvedValue({
    dates: [new Date("2023-01-01"), new Date("2023-02-01")],
    pets: [10, 20],
  }),
}));

const defaultProps: React.ComponentProps<typeof ReferenceData> = {
  CurrentDates: [new Date("2023-06-01"), new Date("2023-06-02")],
  CurrentPets: [22, 24],
  id: 1,
  initialReferenceYear: "2000",
  onReferenceYearChange: mockFn(),
  referenceYear: "2000",
  ReferencePets: [18, 20],
};

const testCurrentDates = [new Date("2025-01-01T00:00:00.000Z")];
const testCurrentPets = [22];
const testReferencePets = [18];
const emptyDates: Date[] = [];
const emptyPets: number[] = [];

describe("referenceData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(globalThis, "matchMedia", {
      value: mockFn().mockReturnValue({
        addEventListener: mockFn(),
        addListener: mockFn(),
        dispatchEvent: mockFn(),
        matches: false,
        media: "(max-width: 639px)",
        onchange: undefined,
        removeEventListener: mockFn(),
        removeListener: mockFn(),
      }),
      writable: true,
    });
  });

  it("should render reference graph controls and graph", async () => {
    const { container } = renderWithQueryClient(
      <ReferenceData {...defaultProps} />,
    );

    expect(screen.getByText("Reference Data")).toBeInTheDocument();
    expect(screen.getByLabelText("Reference Year")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("mock-reference-graph")).toBeInTheDocument();
    });

    expect(
      screen.getByTestId("reference-graph-scroll-region"),
    ).toBeInTheDocument();

    expect(container.querySelector("#reference-data-graph")).toHaveClass(
      "flex-1",
    );
    expect(container.querySelector("#reference-data-graph")).not.toHaveClass(
      "mt-auto",
    );
  });

  it("should keep mobile graph legend collapsed by default and toggle open", async () => {
    Object.defineProperty(globalThis, "matchMedia", {
      value: mockFn().mockReturnValue({
        addEventListener: mockFn(),
        addListener: mockFn(),
        dispatchEvent: mockFn(),
        matches: true,
        media: "(max-width: 639px)",
        onchange: undefined,
        removeEventListener: mockFn(),
        removeListener: mockFn(),
      }),
      writable: true,
    });

    renderWithQueryClient(<ReferenceData {...defaultProps} />);

    const toggle = screen.getByRole("button", { name: "Show Graph Legend" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await waitFor(() => {
      const calls = vi.mocked(GenerateReferenceGraph).mock.calls;
      expect(calls.at(-1)?.[0]).toStrictEqual(
        expect.objectContaining({
          isMobileViewport: true,
          showLegend: false,
        }),
      );
    });

    fireEvent.click(toggle);

    await waitFor(() => {
      const calls = vi.mocked(GenerateReferenceGraph).mock.calls;
      expect(calls.at(-1)?.[0]).toStrictEqual(
        expect.objectContaining({
          isMobileViewport: true,
          showLegend: true,
        }),
      );
    });
  });

  it("should notify the parent and fetch selected annual reference year data", async () => {
    const onReferenceYearChange = mockFn();
    const { rerender } = renderWithQueryClient(
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

  it("should pass the current year using UTC-safe date handling", async () => {
    renderWithQueryClient(
      <ReferenceData
        {...defaultProps}
        CurrentDates={testCurrentDates}
        CurrentPets={testCurrentPets}
        ReferencePets={testReferencePets}
      />,
    );

    await waitFor(() => {
      const calls = vi.mocked(GenerateReferenceGraph).mock.calls;
      expect(calls.at(-1)?.[0]).toStrictEqual(
        expect.objectContaining({
          currentYear: 2025,
        }),
      );
    });
  });

  it("should refetch the initial reference year when the server snapshot is empty", async () => {
    renderWithQueryClient(
      <ReferenceData
        {...defaultProps}
        CurrentDates={emptyDates}
        CurrentPets={emptyPets}
        ReferencePets={emptyPets}
      />,
    );

    await waitFor(() => {
      expect(FetchReferenceGraphData).toHaveBeenCalledWith("2000", 1, "Annual");
    });
  });
});
