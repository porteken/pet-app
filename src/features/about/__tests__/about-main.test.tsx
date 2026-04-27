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
  HeaderBar: vi.fn(({ LocationOptions }) => (
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

describe("AboutMain", () => {
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

    expect(screen.getByText(/purpose of the application/i)).toBeInTheDocument();
  });

  it("should display the purpose description", () => {
    render(<AboutMain LocationOptions={mockLocationOptions} />);

    const purposeText = screen.getByText(/explore how pet changed from/i);
    expect(purposeText).toBeInTheDocument();
    expect(purposeText).toHaveTextContent("from 2000 to 2025");
    expect(purposeText).toHaveTextContent("top 500 largest cities");
    expect(purposeText).toHaveTextContent("Contiguous United States");
  });

  it("should display the 'What is PET?' section with correct heading", () => {
    render(<AboutMain LocationOptions={mockLocationOptions} />);

    const petHeading = screen.getByRole("heading", { name: /what is pet\?/i });
    expect(petHeading).toBeInTheDocument();
    expect(petHeading).toHaveClass("text-2xl", "font-bold");
  });

  it("should display the PET definition", () => {
    render(<AboutMain LocationOptions={mockLocationOptions} />);

    const petDefinition = screen.getByText(
      /the technical definition of the pet/i,
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
      /temperature, humidity, wind speed, solar radiation, and clothing/i,
    );
    expect(factorsText).toBeInTheDocument();
  });

  it("should render a link to the research study", () => {
    render(<AboutMain LocationOptions={mockLocationOptions} />);

    const studyLink = screen.getByRole("link", { name: /this study/i });
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
      /there is evidence to suggest that the pet may do a better job/i,
    );
    expect(studyText).toBeInTheDocument();
    expect(studyText).toHaveTextContent("WBGT and UTCI");
    expect(studyText).toHaveTextContent("heat stress");
  });

  it("should render without location options", () => {
    render(<AboutMain LocationOptions={[]} />);

    const headerBar = screen.getByTestId("header-bar");
    expect(headerBar).toHaveTextContent("HeaderBar with 0 locations");
  });
});
