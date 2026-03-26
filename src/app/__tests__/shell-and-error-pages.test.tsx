import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { mockAppProviders } = vi.hoisted(() => ({
  mockAppProviders: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-providers">{children}</div>
  )),
}));

vi.mock("@/components/app/providers", () => ({
  AppProviders: mockAppProviders,
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...properties }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...properties}>
      {children}
    </a>
  ),
}));

import LocationError from "../[id]/error";
import AboutError from "../about/error";
import Default from "../default";
import ErrorPage from "../error";
import GlobalErrorPage from "../global-error";
import RootLayout, { metadata } from "../layout";
import Loading from "../loading";
import MapError from "../map/error";
import NotFound from "../not-found";

describe("app shell and error pages", () => {
  it("renders the default fallback page", () => {
    render(<Default />);

    expect(screen.getByText("Default Page")).toBeInTheDocument();
    expect(
      screen.getByText("This is the default fallback page for parallel routes.")
    ).toBeInTheDocument();
  });

  it("renders the loading state", () => {
    render(<Loading />);

    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders the not found page", () => {
    render(<NotFound />);

    expect(screen.getByText("404 - Not Found")).toBeInTheDocument();
    expect(screen.getByText("The page you are looking for does not exist.")).toBeInTheDocument();
  });

  it("renders the root layout metadata and children", () => {
    const layout = RootLayout({
      children: <span>Child content</span>,
    });

    expect(layout.type).toBe("html");
    expect(layout.props.lang).toBe("en");
    expect(layout.props.children.type).toBe("body");
    expect(layout.props.children.props.suppressHydrationWarning).toBe(true);
    expect(layout.props.children.props.children.type).toBe(mockAppProviders);
    expect(layout.props.children.props.children.props.children).toEqual(<span>Child content</span>);
    expect(metadata).toEqual({
      description: "Physiological Equivalent Temperature data for US cities",
      title: "Historical PET USA",
    });
  });

  it("renders the root error page and retries on click", () => {
    const reset = vi.fn();

    render(<ErrorPage error={new Error("Unexpected failure")} reset={reset} />);

    expect(screen.getByText("Something went wrong!")).toBeInTheDocument();
    expect(screen.getByText("Unexpected failure")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "porteken@gmail.com" })).toHaveAttribute(
      "href",
      "mailto:porteken@gmail.com"
    );

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("renders the global error page and retries on click", () => {
    const reset = vi.fn();
    const globalErrorPage = GlobalErrorPage({
      error: new Error("Global failure"),
      reset,
    });

    expect(globalErrorPage.type).toBe("html");
    expect(globalErrorPage.props.lang).toBe("en");
    expect(globalErrorPage.props.children.type).toBe("body");

    render(globalErrorPage.props.children.props.children);

    expect(screen.getByText("Global failure")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Need help?");

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("renders the about page error content", () => {
    const reset = vi.fn();

    render(<AboutError error={new Error("About exploded")} reset={reset} />);

    expect(screen.getByText("About Page Error")).toBeInTheDocument();
    expect(screen.getByText("About exploded")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return to homepage" })).toHaveAttribute("href", "/");
  });

  it("renders the map error fallback content", () => {
    render(<MapError error={new Error("Map load failed")} reset={vi.fn()} />);

    expect(screen.getByText("Map Error")).toBeInTheDocument();
    expect(screen.getByText("Map load failed")).toBeInTheDocument();
  });

  it("renders the location error fallback content", () => {
    render(<LocationError error={new Error("Location data load failed")} reset={vi.fn()} />);

    expect(screen.getByText("Location Data Error")).toBeInTheDocument();
    expect(screen.getByText("Location data load failed")).toBeInTheDocument();
  });
});
