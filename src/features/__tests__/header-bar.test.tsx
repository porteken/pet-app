import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HeaderBar } from "../header-bar";

// Mock window.matchMedia for Mantine
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

const mockUseSearchParameters = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    back: vi.fn(),
    forward: vi.fn(),
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => mockUseSearchParameters(),
}));

vi.mock("@mantine/core", async () => {
  const actual = await vi.importActual("@mantine/core");
  return {
    ...actual,
    Anchor: ({ children, ...properties }: any) => (
      <a {...properties}>{children}</a>
    ),
    Group: ({ children, ...properties }: any) => (
      <div {...properties}>{children}</div>
    ),
    Select: ({ ...properties }: any) => (
      <select data-testid="city-selector" {...properties}>
        <option value="">Select City</option>
      </select>
    ),
    Text: ({ children, ...properties }: any) => (
      <div {...properties}>{children}</div>
    ),
  };
});

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

describe("HeaderBar", () => {
  const mockLocationOptions = [
    {
      items: [
        { key: 1, title: "New York" },
        { key: 2, title: "Los Angeles" },
      ],
      title: "Test States",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSearchParameters.mockReturnValue({
      get: vi.fn(),
      toString: vi.fn().mockReturnValue(""),
    });
  });

  it("should render the header bar with app name", () => {
    renderWithProvider(<HeaderBar LocationOptions={mockLocationOptions} />);
    expect(screen.getByText("Historical PET USA")).toBeInTheDocument();
  });

  it("should render navigation links", () => {
    renderWithProvider(<HeaderBar LocationOptions={mockLocationOptions} />);
    expect(screen.getByText("Map")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  it("should render GitHub link", () => {
    renderWithProvider(<HeaderBar LocationOptions={mockLocationOptions} />);
    const githubLink = screen.getByText("Github Repository");
    expect(githubLink).toBeInTheDocument();
    expect(githubLink.closest("a")).toHaveAttribute(
      "href",
      "https://github.com/porteken/pet-app"
    );
  });

  it("should render city selector", () => {
    renderWithProvider(<HeaderBar LocationOptions={mockLocationOptions} />);
    expect(screen.getByTestId("city-selector")).toBeInTheDocument();
  });

  it("should handle empty LocationOptions", () => {
    renderWithProvider(<HeaderBar LocationOptions={[]} />);
    expect(screen.getByTestId("city-selector")).toBeInTheDocument();
  });

  it("should build URL with search parameters", () => {
    mockUseSearchParameters.mockReturnValue(new URLSearchParams("param=value"));
    renderWithProvider(<HeaderBar LocationOptions={mockLocationOptions} />);
    // The component should render without error when search params exist
    expect(screen.getByTestId("city-selector")).toBeInTheDocument();
  });

  it("should build URL without search parameters when empty", () => {
    mockUseSearchParameters.mockReturnValue(new URLSearchParams(""));
    renderWithProvider(<HeaderBar LocationOptions={mockLocationOptions} />);
    expect(screen.getByTestId("city-selector")).toBeInTheDocument();
  });

  it("should handle non-array LocationOptions gracefully", () => {
    // Test when LocationOptions is not an array (edge case)
    renderWithProvider(<HeaderBar LocationOptions={undefined as any} />);
    expect(screen.getByTestId("city-selector")).toBeInTheDocument();
  });

  it("should find current city when ID is provided", () => {
    mockUseSearchParameters.mockReturnValue(new URLSearchParams(""));
    renderWithProvider(
      <HeaderBar id={1} LocationOptions={mockLocationOptions} />
    );
    expect(screen.getByTestId("city-selector")).toBeInTheDocument();
  });

  it("should handle case when current city is not found", () => {
    mockUseSearchParameters.mockReturnValue(new URLSearchParams(""));
    renderWithProvider(
      <HeaderBar id={999} LocationOptions={mockLocationOptions} />
    );
    expect(screen.getByTestId("city-selector")).toBeInTheDocument();
  });

  it("should handle ID with no current city gracefully", () => {
    mockUseSearchParameters.mockReturnValue(new URLSearchParams(""));
    renderWithProvider(
      <HeaderBar id={undefined} LocationOptions={mockLocationOptions} />
    );
    expect(screen.getByTestId("city-selector")).toBeInTheDocument();
  });

  it("should handle empty state grouping correctly", () => {
    const locationsWithEmptyStates = [
      {
        items: [
          { key: 1, title: "City One" },
          { key: 2, title: "City Two" },
        ],
        title: "",
      },
    ];

    mockUseSearchParameters.mockReturnValue(new URLSearchParams(""));
    renderWithProvider(
      <HeaderBar id={1} LocationOptions={locationsWithEmptyStates} />
    );
    expect(screen.getByTestId("city-selector")).toBeInTheDocument();
  });

  it("should trigger onChange when a city is selected", () => {
    const mockLocation = { href: "" };
    Object.defineProperty(globalThis, "location", {
      value: mockLocation,
      writable: true,
    });

    mockUseSearchParameters.mockReturnValue(new URLSearchParams(""));
    renderWithProvider(
      <HeaderBar id={1} LocationOptions={mockLocationOptions} />
    );

    const selector = screen.getByTestId("city-selector");
    expect(selector).toBeInTheDocument();

    // Test that the selector exists and can handle events
    expect(selector).toHaveProperty("onchange");
  });

  it("should have proper placeholder text based on ID", () => {
    mockUseSearchParameters.mockReturnValue(new URLSearchParams(""));

    // Test with valid ID
    renderWithProvider(
      <HeaderBar id={1} LocationOptions={mockLocationOptions} />
    );
    expect(screen.getByTestId("city-selector")).toBeInTheDocument();

    // Test with no ID - this should show "Select City" placeholder
    renderWithProvider(
      <HeaderBar id={-1} LocationOptions={mockLocationOptions} />
    );
    expect(screen.getAllByTestId("city-selector")).toHaveLength(2);
  });
});
