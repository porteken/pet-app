import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ children, href, ...linkProperties }: any) => (
    <a href={href} {...linkProperties}>
      {children}
    </a>
  ),
}));

vi.mock("@/features/header-bar", () => ({
  HeaderBar: mockFn<
    ({ LocationOptions }: { LocationOptions: unknown[] }) => React.ReactNode
  >(({ LocationOptions }: { LocationOptions: unknown[] }) => (
    <div data-testid="header-bar">
      HeaderBar with {LocationOptions?.length || 0} locations
    </div>
  )),
}));

import AboutMain from "../components/about-main";

const mockLocationOptions = [
  {
    items: [
      { key: 1, title: "New York, NY" },
      { key: 2, title: "Los Angeles, CA" },
    ],
    title: "Major Cities",
  },
  {
    items: [{ key: 3, title: "Chicago, IL" }],
    title: "Other Cities",
  },
];

const emptyLocationOptions: typeof mockLocationOptions = [];

describe("aboutMain", () => {
  it("should render the header bar and the main about layout", () => {
    render(<AboutMain LocationOptions={mockLocationOptions} />);

    const headerBar = screen.getByTestId("header-bar");
    expect(headerBar).toBeInTheDocument();
    expect(headerBar).toHaveTextContent("HeaderBar with 2 locations");

    const container = screen.getByRole("main");
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass("mx-auto", "px-4", "py-8");

    expect(
      screen.getByText(/purpose of the application/iu),
    ).toBeInTheDocument();

    const heading = screen.getByRole("heading", { name: "About" });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass("sr-only");

    const petHeading = screen.getByRole("heading", {
      name: /what is pet\?/iu,
    });
    expect(petHeading).toBeInTheDocument();
    expect(petHeading).toHaveClass(
      "text-primary",
      "text-sm",
      "font-semibold",
      "uppercase",
    );
  });

  it("should render the PET explanation and supporting study reference", () => {
    render(<AboutMain LocationOptions={mockLocationOptions} />);

    const petDefinition = screen.getByText(
      /pet \(physiological equivalent temperature\) is a method to measure/iu,
    );
    expect(petDefinition).toBeInTheDocument();
    expect(petDefinition).toHaveTextContent(
      "Physiological Equivalent Temperature",
    );
    expect(petDefinition).toHaveTextContent("heat budget");
    expect(petDefinition).toHaveTextContent("thermal comfort");

    const factorsText = screen.getByText(
      /temperature, humidity, wind speed, solar radiation, and clothing/iu,
    );
    expect(factorsText).toBeInTheDocument();

    const studyLink = screen.getByRole("link", { name: /this study/iu });
    expect(studyLink).toBeInTheDocument();
    expect(studyLink).toHaveAttribute(
      "href",
      "https://bjsm.bmj.com/content/55/15/825",
    );
    expect(studyLink).toHaveClass("text-primary");

    const studyText = screen.getByText(
      /there is evidence to suggest that the pet may do a better job/iu,
    );
    expect(studyText).toBeInTheDocument();
    expect(studyText).toHaveTextContent("WBGT and UTCI");
    expect(studyText).toHaveTextContent("heat stress");
  });

  it("should render without location options", () => {
    render(<AboutMain LocationOptions={emptyLocationOptions} />);

    const headerBar = screen.getByTestId("header-bar");
    expect(headerBar).toHaveTextContent("HeaderBar with 0 locations");
  });
});
