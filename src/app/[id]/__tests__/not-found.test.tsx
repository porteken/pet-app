import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...properties
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...properties}>
      {children}
    </a>
  ),
}));

import LocationNotFound from "../not-found";

describe("location not found page", () => {
  it("renders the invalid location message and recovery link", () => {
    render(<LocationNotFound />);

    expect(screen.getByText("Location not found")).toBeInTheDocument();
    expect(
      screen.getByText("The requested location could not be found."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
