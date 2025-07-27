import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import GlobalError from "../global-error";

// Mock Mantine components for testing
vi.mock("@mantine/core", () => ({
  Alert: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert">{children}</div>
  ),
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <button data-testid="reset-button" onClick={onClick} type="button">
      {children}
    </button>
  ),
  Container: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="container">{children}</div>
  ),
  Stack: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="stack">{children}</div>
  ),
  Text: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="text">{children}</span>
  ),
  Title: ({ children }: { children: React.ReactNode }) => (
    <h1 data-testid="title">{children}</h1>
  ),
}));

describe("GlobalError", () => {
  const mockReset = vi.fn();
  const mockError = new Error("Test error message");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render error message", () => {
    render(<GlobalError error={mockError} reset={mockReset} />);

    expect(screen.getByText("Something went wrong!")).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("should call reset function when reset button is clicked", () => {
    render(<GlobalError error={mockError} reset={mockReset} />);

    const resetButton = screen.getByText("Try again");
    fireEvent.click(resetButton);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it("should render refresh page button", () => {
    render(<GlobalError error={mockError} reset={mockReset} />);

    expect(screen.getByText("Refresh Page")).toBeInTheDocument();
  });

  it("should display alert message", () => {
    render(<GlobalError error={mockError} reset={mockReset} />);

    expect(screen.getByTestId("alert")).toBeInTheDocument();
  });

  it("should handle different error messages", () => {
    const customError = new Error("Custom error message");
    render(<GlobalError error={customError} reset={mockReset} />);

    expect(screen.getByText("Custom error message")).toBeInTheDocument();
  });

  it("should handle error with undefined message", () => {
    // Create an error object with undefined message to test fallback behavior
    const errorWithUndefinedMessage = Object.create(Error.prototype);
    errorWithUndefinedMessage.message = undefined;
    errorWithUndefinedMessage.name = "Error";

    render(<GlobalError error={errorWithUndefinedMessage} reset={mockReset} />);

    expect(screen.getByText("Something went wrong!")).toBeInTheDocument();
  });
});
