import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Modal from "../modal";

describe("Modal", () => {
  const mockOnClose = vi.fn();
  const testTitle = "Test Modal Title";
  const testContent = "Test Modal Content";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders when open is true", () => {
    render(
      <Modal onClose={mockOnClose} open title={testTitle}>
        {testContent}
      </Modal>
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it("displays the title when provided", () => {
    render(
      <Modal onClose={mockOnClose} open title={testTitle}>
        {testContent}
      </Modal>
    );

    expect(screen.getByText(testTitle)).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    render(
      <Modal onClose={mockOnClose} open>
        {testContent}
      </Modal>
    );

    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("renders children content correctly", () => {
    const complexContent = (
      <div data-testid="complex-content">
        <h1>Complex Title</h1>
        <p>Complex paragraph</p>
      </div>
    );

    render(
      <Modal onClose={mockOnClose} open>
        {complexContent}
      </Modal>
    );

    expect(screen.getByTestId("complex-content")).toBeInTheDocument();
    expect(screen.getByText("Complex Title")).toBeInTheDocument();
    expect(screen.getByText("Complex paragraph")).toBeInTheDocument();
  });

  it("does not render when open is false", () => {
    render(
      <Modal onClose={mockOnClose} open={false}>
        {testContent}
      </Modal>
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
