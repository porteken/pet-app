import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { NavButtons } from "../components/nav-buttons";
interface MockLinkProperties extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  href: string;
}

beforeAll(() => {
  Object.defineProperty(globalThis, "matchMedia", {
    value: vi.fn().mockImplementation((query) => ({
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
  default: ({ children, href, ...rest }: MockLinkProperties) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: vi.fn().mockReturnValue("/"),
}));

describe("NavButtons", () => {
  const mockBuildUrl = vi.fn().mockImplementation((path) => path);

  it("should render all navigation buttons", () => {
    render(<NavButtons buildUrl={mockBuildUrl} />);

    expect(screen.getByText("Map")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(
      screen.getByLabelText("View source code on GitHub"),
    ).toBeInTheDocument();
  });

  it("should render buttons with correct links", () => {
    render(<NavButtons buildUrl={mockBuildUrl} />);

    expect(screen.getByLabelText("Navigate to map view")).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByLabelText("Navigate to about page")).toHaveAttribute(
      "href",
      "/about",
    );
    expect(screen.getByLabelText("View source code on GitHub")).toHaveAttribute(
      "href",
      "https://github.com/porteken/pet-app",
    );
  });

  it("should use buildUrl function for the Map link", () => {
    mockBuildUrl.mockReturnValueOnce("/with-params");
    render(<NavButtons buildUrl={mockBuildUrl} />);

    expect(screen.getByLabelText("Navigate to map view")).toHaveAttribute(
      "href",
      "/with-params",
    );
    expect(mockBuildUrl).toHaveBeenCalledWith("/");
  });
});
