import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import React, { type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Modal from "../modal";

interface MockModalProperties {
  children: ReactNode;
  onClose: () => void;
  opened: boolean;
  title?: string;
}

vi.mock("@mantine/core", () => ({
  Modal: ({ children, onClose, opened, title }: MockModalProperties) => {
    if (!opened) {
      return;
    }
    return (
      <div
        aria-modal="true"
        data-opened={opened}
        data-testid="modal"
        role="dialog"
      >
        {title && <div data-testid="modal-title">{title}</div>}
        <div className="mb-6">{children}</div>
        <button data-testid="close-button" onClick={onClose} type="button">
          Close
        </button>
      </div>
    );
  },
}));

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

    const modal = screen.getByTestId("modal");
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute("data-opened", "true");
    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it("displays the title when provided", () => {
    render(
      <Modal onClose={mockOnClose} open title={testTitle}>
        {testContent}
      </Modal>
    );

    expect(screen.getByTestId("modal-title")).toHaveTextContent(testTitle);
  });

  it("calls onClose when close button is clicked", () => {
    render(
      <Modal onClose={mockOnClose} open>
        {testContent}
      </Modal>
    );

    fireEvent.click(screen.getByTestId("close-button"));
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

    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });
});
