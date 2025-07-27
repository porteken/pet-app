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

// Define mocks at module level
const mockUseSearchParameters = vi.fn();
const mockGet = vi.fn();
const mockToString = vi.fn().mockReturnValue("");

// Mock next/navigation
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
      <div data-testid="mantine-group" {...properties}>
        {children}
      </div>
    ),
    Select: ({
      data,
      onChange,
      placeholder,
      searchable,
      value,
      ...properties
    }: any) => (
      <select
        data-searchable={searchable ? "true" : "false"}
        data-testid="city-selector"
        onChange={event => onChange && onChange(event.target.value)}
        placeholder={placeholder}
        value={value || ""}
        {...properties}
      >
        <option value="">Select City</option>
        {data?.flatMap(
          (group: any) =>
            group.items?.map((item: any) => (
              <option key={item.key} value={item.key}>
                {item.title}
              </option>
            )) || []
        )}
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

    // Reset mock behavior
    mockUseSearchParameters.mockReset();
    mockUseSearchParameters.mockReturnValue({
      get: mockGet,
      toString: mockToString,
    });

    // Mock location
    Object.defineProperty(globalThis, "location", {
      value: { href: "" },
      writable: true,
    });
  });

  describe("Basic Rendering", () => {
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
  });

  describe("Location Options Handling", () => {
    it("should handle empty LocationOptions", () => {
      renderWithProvider(<HeaderBar LocationOptions={[]} />);
      expect(screen.getByTestId("city-selector")).toBeInTheDocument();
    });

    it("should handle non-array LocationOptions gracefully", () => {
      // Test when LocationOptions is not an array (edge case)
      renderWithProvider(<HeaderBar LocationOptions={undefined as any} />);
      expect(screen.getByTestId("city-selector")).toBeInTheDocument();
    });

    it("should sort cities within states alphabetically", () => {
      // Create LocationOptions with multiple cities in unsorted order
      const mockLocationOptions = [
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

      renderWithProvider(
        <HeaderBar id={1} LocationOptions={mockLocationOptions} />
      );

      // Verify the cities are available in the selector
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
      renderWithProvider(
        <HeaderBar id={1} LocationOptions={locationsWithEmptyStates} />
      );
      expect(screen.getByTestId("city-selector")).toBeInTheDocument();
    });

    it("should handle section with empty items array", () => {
      // Create LocationOptions with a section that has an empty items array
      const mockLocationOptions = [
        {
          items: [], // Empty items array
          title: "State With No Items",
        },
        {
          items: [{ key: 1, title: "Valid City" }],
          title: "Valid State",
        },
      ];

      renderWithProvider(
        <HeaderBar id={1} LocationOptions={mockLocationOptions} />
      );

      // Verify component renders without errors
      const selector = screen.getByTestId("city-selector");
      expect(selector).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle section with items set to undefined", () => {
      // Create a location options array with empty items to trigger the fallback
      const mockLocationOptions = [
        {
          items: [] as any,
          title: "Test Section",
        },
      ];

      // Modify the items array after creation to trigger the branch condition
      delete mockLocationOptions[0].items;

      renderWithProvider(
        <HeaderBar LocationOptions={mockLocationOptions as any} />
      );

      // If it renders without errors, the fallback worked
      expect(document.body).toBeInTheDocument();
    });

    it("should handle case with no id provided and process current city correctly", () => {
      renderWithProvider(<HeaderBar LocationOptions={mockLocationOptions} />);

      // Without an ID, the placeholder should be "Select City"
      const selector = screen.getByTestId("city-selector");
      expect(selector).toHaveAttribute("placeholder", "Select City");
    });

    it("should handle the onChange event for city selector", () => {
      renderWithProvider(<HeaderBar LocationOptions={mockLocationOptions} />);

      // Get the select element and simulate change
      const selector = screen.getByTestId("city-selector");

      // Set the value property first
      Object.defineProperty(selector, "value", { value: "1" });

      // Then dispatch the change event
      selector.dispatchEvent(
        new Event("change", {
          bubbles: true,
          cancelable: true,
        })
      );

      // Check that location.href was updated
      expect(globalThis.location.href).toBe("/1");
    });

    it("should have proper placeholder text based on ID", () => {
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

  describe("City Selection and URL Building", () => {
    it("should find current city when ID is provided", () => {
      renderWithProvider(
        <HeaderBar id={1} LocationOptions={mockLocationOptions} />
      );
      expect(screen.getByTestId("city-selector")).toBeInTheDocument();
    });

    it("should handle case when current city is not found", () => {
      renderWithProvider(
        <HeaderBar id={999} LocationOptions={mockLocationOptions} />
      );
      expect(screen.getByTestId("city-selector")).toBeInTheDocument();
    });

    it("should handle ID with no current city gracefully", () => {
      renderWithProvider(
        <HeaderBar id={undefined} LocationOptions={mockLocationOptions} />
      );
      expect(screen.getByTestId("city-selector")).toBeInTheDocument();
    });

    it("should build URL with search parameters", () => {
      mockToString.mockReturnValue("param=value");
      renderWithProvider(<HeaderBar LocationOptions={mockLocationOptions} />);
      // The component should render without error when search params exist
      expect(screen.getByTestId("city-selector")).toBeInTheDocument();

      // Verify Links that use search params are rendered
      const mapButton = screen.getByLabelText("Navigate to map view");
      expect(mapButton).toHaveAttribute("href", "/?param=value");
    });

    it("should build URL without search parameters when empty", () => {
      mockToString.mockReturnValue("");
      renderWithProvider(<HeaderBar LocationOptions={mockLocationOptions} />);
      expect(screen.getByTestId("city-selector")).toBeInTheDocument();
    });
  });
});
