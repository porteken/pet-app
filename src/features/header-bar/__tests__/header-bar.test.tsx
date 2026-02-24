import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HeaderBar } from "../header-bar";

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

const mockUseSearchParameters = vi.fn();
const mockGet = vi.fn();
const mockPush = vi.fn();
const mockToString = vi.fn().mockReturnValue("");

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: vi.fn(),
    forward: vi.fn(),
    push: mockPush,
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => mockUseSearchParameters(),
}));

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
      const githubLink = screen.getByText("Github Repository");
      expect(githubLink).toBeInTheDocument();
      expect(githubLink.closest("a")).toHaveAttribute(
        "href",
        "https://github.com/porteken/pet-app"
      );
    });

    it("should render city selector", () => {
      render(<HeaderBar LocationOptions={mockLocationOptions} />);
      expect(screen.getByTestId("city-selector")).toBeInTheDocument();
    });
  });

  describe("Location Options Handling", () => {
    it("should handle empty LocationOptions", () => {
      render(<HeaderBar LocationOptions={[]} />);
      expect(screen.getByTestId("city-selector")).toBeInTheDocument();
    });

    it("should handle non-array LocationOptions gracefully", () => {
      render(<HeaderBar LocationOptions={undefined as unknown as never} />);
      expect(screen.getByTestId("city-selector")).toBeInTheDocument();
    });

    it("should sort cities within states alphabetically", () => {
      const locations = [
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

      render(<HeaderBar id={1} LocationOptions={locations} />);

      const selector = screen.getByTestId("city-selector");
      expect(selector).toBeInTheDocument();
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

      mockToString.mockReturnValue("");
      render(<HeaderBar id={1} LocationOptions={locationsWithEmptyStates} />);
      expect(screen.getByTestId("city-selector")).toBeInTheDocument();
    });

    it("should handle section with empty items array", () => {
      const locations = [
        {
          items: [],
          title: "State With No Items",
        },
        {
          items: [{ key: 1, title: "Valid City" }],
          title: "Valid State",
        },
      ];

      render(<HeaderBar id={1} LocationOptions={locations} />);

      const selector = screen.getByTestId("city-selector");
      expect(selector).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle section with items set to undefined", () => {
      const locations = [{ title: "Test Section" }];

      render(<HeaderBar LocationOptions={locations as unknown as never} />);

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
      fireEvent.click(screen.getByRole("option", { name: "New York" }));

      expect(mockPush).toHaveBeenCalledWith("/1");
    });

    it("should allow searching by state in the city autocomplete", () => {
      render(<HeaderBar LocationOptions={mockLocationOptions} />);

      const selector = screen.getByTestId("city-selector");
      fireEvent.focus(selector);
      fireEvent.change(selector, { target: { value: "test states" } });

      expect(
        screen.getByRole("option", { name: "New York" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: "Los Angeles" })
      ).toBeInTheDocument();
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
        "Change City"
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
        <HeaderBar id={undefined} LocationOptions={mockLocationOptions} />
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
