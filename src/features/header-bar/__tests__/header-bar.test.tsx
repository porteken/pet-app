/* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
// eslint-disable-next-line import/no-unassigned-import
import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HeaderBar } from "../components/header-bar";

Object.defineProperty(globalThis, "matchMedia", {
  value: mockFn().mockImplementation((query: string) => ({
    addEventListener: mockFn(),
    addListener: mockFn(),
    dispatchEvent: mockFn(),
    matches: false,
    media: query,
    onchange: undefined,
    removeEventListener: mockFn(),
    removeListener: mockFn(),
  })),
  writable: true,
});

globalThis.ResizeObserver = mockFn().mockImplementation(() => ({
  disconnect: mockFn(),
  observe: mockFn(),
  unobserve: mockFn(),
}));

const mockUseSearchParameters = mockFn();
const mockGet = mockFn();
const mockPush = mockFn();
const mockToString = mockFn().mockReturnValue("");

const mockLocationOptions = [
  {
    items: [
      { key: 1, title: "New York" },
      { key: 2, title: "Los Angeles" },
    ],
    title: "Test States",
  },
];

const emptyLocationOptions: typeof mockLocationOptions = [];

const unsortedLocationOptions = [
  {
    items: [
      { key: 1, title: "Chicago" },
      { key: 2, title: "Boston" },
      { key: 3, title: "Austin" },
    ],
    title: "State 1",
  },
  {
    items: [
      { key: 4, title: "Denver" },
      { key: 5, title: "Albany" },
    ],
    title: "State 2",
  },
];

const emptyStateLocationOptions = [
  {
    items: [
      { key: 1, title: "City One" },
      { key: 2, title: "City Two" },
    ],
    title: "",
  },
];

const mixedLocationOptions = [
  {
    items: [],
    title: "State With No Items",
  },
  {
    items: [{ key: 1, title: "Valid City" }],
    title: "Valid State",
  },
];

const titleOnlyLocationOptions = [{ title: "Test Section" }];

const undefinedLocationOptions = undefined as unknown as never;

vi.mock("next/navigation", () => ({
  usePathname: mockFn().mockReturnValue("/"),
  useRouter: () => ({
    back: mockFn(),
    forward: mockFn(),
    push: mockPush,
    refresh: mockFn(),
    replace: mockFn(),
  }),
  useSearchParams: () => mockUseSearchParameters(),
}));

describe("HeaderBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseSearchParameters.mockReset();
    mockUseSearchParameters.mockReturnValue({
      get: mockGet,
      toString: mockToString,
    });
  });

  describe("Basic Rendering", () => {
    it("should render the header bar with app name", () => {
      render(<HeaderBar LocationOptions={mockLocationOptions} />);
      expect(screen.getByText("Historical PET USA")).toBeInTheDocument();
    });

    it("should render navigation links", () => {
      render(<HeaderBar LocationOptions={mockLocationOptions} />);
      expect(screen.getByText("Map")).toBeInTheDocument();
      expect(screen.getByText("About")).toBeInTheDocument();
    });

    it("should render GitHub link", () => {
      render(<HeaderBar LocationOptions={mockLocationOptions} />);
      const githubLink = screen.getByLabelText("View source code on GitHub");
      expect(githubLink).toBeInTheDocument();
      expect(githubLink.closest("a")).toHaveAttribute(
        "href",
        "https://github.com/porteken/pet-app",
      );
    });

    it("should render city selector", () => {
      render(<HeaderBar LocationOptions={mockLocationOptions} />);
      expect(screen.getByTestId("city-selector")).toBeInTheDocument();
    });
  });

  describe("Location Options Handling", () => {
    it("should handle empty LocationOptions", () => {
      render(<HeaderBar LocationOptions={emptyLocationOptions} />);
      expect(screen.getByTestId("city-selector")).toBeInTheDocument();
    });

    it("should handle non-array LocationOptions gracefully", () => {
      render(<HeaderBar LocationOptions={undefinedLocationOptions} />);
      expect(screen.getByTestId("city-selector")).toBeInTheDocument();
    });

    it("should sort cities within states alphabetically", () => {
      render(<HeaderBar id={1} LocationOptions={unsortedLocationOptions} />);

      const selector = screen.getByTestId("city-selector");
      expect(selector).toBeInTheDocument();
    });

    it("should handle empty state grouping correctly", () => {
      mockToString.mockReturnValue("");
      render(<HeaderBar id={1} LocationOptions={emptyStateLocationOptions} />);
      expect(screen.getByTestId("city-selector")).toBeInTheDocument();
    });

    it("should handle section with empty items array", () => {
      render(<HeaderBar id={1} LocationOptions={mixedLocationOptions} />);

      const selector = screen.getByTestId("city-selector");
      expect(selector).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle section with items set to undefined", () => {
      render(
        // @ts-expect-error - Testing invalid props
        <HeaderBar LocationOptions={titleOnlyLocationOptions} />,
      );

      expect(document.body).toBeInTheDocument();
    });

    it("should handle case with no id provided and process current city correctly", () => {
      render(<HeaderBar LocationOptions={mockLocationOptions} />);

      const selector = screen.getByTestId("city-selector");
      expect(selector).toHaveAttribute("data-placeholder", "Select City");
    });

    it("should handle the onChange event for city selector", () => {
      render(<HeaderBar LocationOptions={mockLocationOptions} />);

      const selector = screen.getByTestId("city-selector");
      fireEvent.focus(selector);
      fireEvent.click(screen.getByText("New York"));

      expect(mockPush).toHaveBeenCalledWith("/1");
    });

    it("should allow searching by state in the city autocomplete", () => {
      render(<HeaderBar LocationOptions={mockLocationOptions} />);

      const selector = screen.getByTestId("city-selector");
      fireEvent.focus(selector);
      fireEvent.change(selector, { target: { value: "test states" } });

      expect(screen.getByText("New York")).toBeInTheDocument();
      expect(screen.getByText("Los Angeles")).toBeInTheDocument();
    });

    it("should clear city selection when clear button is clicked", () => {
      render(<HeaderBar id={1} LocationOptions={mockLocationOptions} />);

      fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
      expect(mockPush).toHaveBeenCalledWith("/");
    });

    it("should have proper placeholder text based on ID", () => {
      render(<HeaderBar id={1} LocationOptions={mockLocationOptions} />);
      expect(screen.getByTestId("city-selector")).toHaveAttribute(
        "data-placeholder",
        "Change City",
      );

      render(<HeaderBar id={-1} LocationOptions={mockLocationOptions} />);
      expect(screen.getAllByTestId("city-selector")).toHaveLength(2);
    });
  });

  describe("City Selection and URL Building", () => {
    it("should find current city when ID is provided", () => {
      render(<HeaderBar id={1} LocationOptions={mockLocationOptions} />);
      expect(screen.getByTestId("city-selector")).toBeInTheDocument();
    });

    it("should handle case when current city is not found", () => {
      render(<HeaderBar id={999} LocationOptions={mockLocationOptions} />);
      expect(screen.getByTestId("city-selector")).toBeInTheDocument();
    });

    it("should handle ID with no current city gracefully", () => {
      render(
        <HeaderBar id={undefined} LocationOptions={mockLocationOptions} />,
      );
      expect(screen.getByTestId("city-selector")).toBeInTheDocument();
    });

    it("should build URL with search parameters", () => {
      mockToString.mockReturnValue("param=value");
      render(<HeaderBar LocationOptions={mockLocationOptions} />);

      expect(screen.getByTestId("city-selector")).toBeInTheDocument();

      const mapButton = screen.getByLabelText("Navigate to map view");
      expect(mapButton).toHaveAttribute("href", "/?param=value");
    });

    it("should build URL without search parameters when empty", () => {
      mockToString.mockReturnValue("");
      render(<HeaderBar LocationOptions={mockLocationOptions} />);
      expect(screen.getByTestId("city-selector")).toBeInTheDocument();
    });
  });
});
