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
  it("should render the header bar with location options", () => {
    render(<AboutMain LocationOptions={mockLocationOptions} />);

    const headerBar = screen.getByTestId("header-bar");
    expect(headerBar).toBeInTheDocument();
    expect(headerBar).toHaveTextContent("HeaderBar with 2 locations");
  });

  it("should render the main content container", () => {
    render(<AboutMain LocationOptions={mockLocationOptions} />);

    const container = screen.getByRole("main");
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass("mx-auto", "px-4", "py-8");
  });

  it("should display the purpose section label", () => {
    render(<AboutMain LocationOptions={mockLocationOptions} />);

    expect(
      screen.getByText(/purpose of the application/iu),
    ).toBeInTheDocument();
  });

  it("should keep the page heading accessible", () => {
    render(<AboutMain LocationOptions={mockLocationOptions} />);

    const heading = screen.getByRole("heading", { name: "About" });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass("sr-only");
  });

  it("should display the 'What is PET?' section with correct heading", () => {
    render(<AboutMain LocationOptions={mockLocationOptions} />);

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

  it("should display the PET definition", () => {
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
  });

  it("should include factors that PET measures", () => {
    render(<AboutMain LocationOptions={mockLocationOptions} />);

    const factorsText = screen.getByText(
      /temperature, humidity, wind speed, solar radiation, and clothing/iu,
    );
    expect(factorsText).toBeInTheDocument();
  });

  it("should render a link to the research study", () => {
    render(<AboutMain LocationOptions={mockLocationOptions} />);

    const studyLink = screen.getByRole("link", { name: /this study/iu });
    expect(studyLink).toBeInTheDocument();
    expect(studyLink).toHaveAttribute(
      "href",
      "https://bjsm.bmj.com/content/55/15/825",
    );
    expect(studyLink).toHaveClass("text-primary");
  });

  it("should mention the study's findings about PET", () => {
    render(<AboutMain LocationOptions={mockLocationOptions} />);

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
