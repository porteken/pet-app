import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/utils/reload", () => ({
  reloadPage: mockFn(),
}));

import { reloadPage } from "@/utils/reload";

import { DatabaseError } from "../database-error";

describe("databaseError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default props", () => {
    render(<DatabaseError />);

    expect(screen.getByText("Database Connection Error")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Unable to connect to the database. Please try again later.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/Need help\?/)).toBeInTheDocument();
    expect(screen.getByText(/Contact Kenneth Porter/)).toBeInTheDocument();
  });

  it("renders with custom message", () => {
    const customMessage = "Custom error message";
    render(<DatabaseError message={customMessage} />);

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it("renders with custom title", () => {
    const customTitle = "Custom Error Title";
    render(<DatabaseError title={customTitle} />);

    expect(screen.getByText(customTitle)).toBeInTheDocument();
  });

  it("hides contact info when showContactInfo is false", () => {
    render(<DatabaseError showContactInfo={false} />);

    expect(screen.queryByText(/Need help\?/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Contact Kenneth Porter/),
    ).not.toBeInTheDocument();
  });

  it("shows contact info when showContactInfo is true", () => {
    render(<DatabaseError showContactInfo />);

    expect(screen.getByText(/Need help\?/)).toBeInTheDocument();
    expect(screen.getByText(/Contact Kenneth Porter/)).toBeInTheDocument();
    expect(screen.getByText("porteken@gmail.com")).toBeInTheDocument();
  });

  it("calls location.reload when Try Again button is clicked", () => {
    render(<DatabaseError />);

    const tryAgainButton = screen.getByText("Try Again");
    fireEvent.click(tryAgainButton);

    expect(reloadPage).toHaveBeenCalled();
  });
});
