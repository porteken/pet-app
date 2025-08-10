import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { NavButtons } from "../nav-buttons";

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

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("NavButtons", () => {
  const mockBuildUrl = vi.fn().mockImplementation(path => path);

  const renderWithProvider = (ui: React.ReactElement) => {
    return render(<MantineProvider>{ui}</MantineProvider>);
  };

  it("should render all navigation buttons", () => {
    renderWithProvider(<NavButtons buildUrl={mockBuildUrl} />);

    expect(screen.getByText("Map")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Github Repository")).toBeInTheDocument();
  });

  it("should render buttons with correct links", () => {
    renderWithProvider(<NavButtons buildUrl={mockBuildUrl} />);

    expect(screen.getByLabelText("Navigate to map view")).toHaveAttribute(
      "href",
      "/"
    );
    expect(screen.getByLabelText("Navigate to about page")).toHaveAttribute(
      "href",
      "/about"
    );
    expect(screen.getByLabelText("View source code on GitHub")).toHaveAttribute(
      "href",
      "https://github.com/porteken/pet-app"
    );
  });

  it("should use buildUrl function for the Map link", () => {
    mockBuildUrl.mockReturnValueOnce("/with-params");
    renderWithProvider(<NavButtons buildUrl={mockBuildUrl} />);

    expect(screen.getByLabelText("Navigate to map view")).toHaveAttribute(
      "href",
      "/with-params"
    );
    expect(mockBuildUrl).toHaveBeenCalledWith("/");
  });
});
