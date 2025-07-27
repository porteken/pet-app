import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { LocationSelect } from "../location-select";

// Mock window.matchMedia and ResizeObserver for Mantine
beforeAll(() => {
  Object.defineProperty(globalThis, "matchMedia", {
    value: vi.fn().mockImplementation(query => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: false,
      media: query,
      onchange: undefined,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    })),
    writable: true,
  });

  globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    unobserve: vi.fn(),
  }));
});

// Mock next/navigation
const mockRouterPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
  useSearchParams: () => ({
    toString: () => "existing=params",
  }),
}));

describe("LocationSelect", () => {
  const mockBuildUrl = vi.fn().mockImplementation(path => path);

  const cities = [
    { label: "New York", value: "ny" },
    { label: "Los Angeles", value: "la" },
  ];

  const states = [
    { label: "New York", value: "NY" },
    { label: "California", value: "CA" },
  ];

  const renderWithProvider = (ui: React.ReactElement) => {
    return render(<MantineProvider>{ui}</MantineProvider>);
  };

  it("should render state and city select inputs", () => {
    renderWithProvider(
      <LocationSelect
        buildUrl={mockBuildUrl}
        cities={cities}
        selectedCity="ny"
        selectedState="NY"
        states={states}
      />
    );

    expect(screen.getByTestId("state-select")).toBeInTheDocument();
    expect(screen.getByTestId("city-select")).toBeInTheDocument();
  });

  it("should disable city select when no state is selected", () => {
    renderWithProvider(
      <LocationSelect
        buildUrl={mockBuildUrl}
        cities={cities}
        selectedCity=""
        selectedState=""
        states={states}
      />
    );

    const cityInput = screen.getByTestId("city-select");
    expect(cityInput).toHaveAttribute("disabled");
  });
});
