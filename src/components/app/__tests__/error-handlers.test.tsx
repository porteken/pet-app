import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { LocationErrorHandler } from "../error-handlers";

vi.mock("@/components/app/database-error", () => ({
  DatabaseError: ({ message, title }: { message?: string; title?: string }) => (
    <div>
      <span data-testid="db-error-title">{title}</span>
      <span data-testid="db-error-message">{message}</span>
    </div>
  ),
}));

describe("locationErrorHandler", () => {
  it("renders the no-data error UI when error message is NO_DATA", () => {
    const error = new Error("No location data available");
    render(<LocationErrorHandler error={error} />);

    expect(screen.getByTestId("db-error-title")).toHaveTextContent(
      "No Data Available",
    );
    expect(screen.getByTestId("db-error-message")).toHaveTextContent(
      "Unable to load location data. The database may be temporarily unavailable.",
    );
  });

  it("renders the database connection error UI for any other error", () => {
    const error = new Error("Some unexpected database error");
    render(<LocationErrorHandler error={error} />);

    expect(screen.getByTestId("db-error-title")).toHaveTextContent(
      "Database Connection Error",
    );
    expect(screen.getByTestId("db-error-message")).toHaveTextContent(
      "Unable to connect to the database. Please try again later.",
    );
  });

  it("has a displayName set correctly", () => {
    expect(LocationErrorHandler.displayName).toBe("LocationErrorHandler");
  });
});
