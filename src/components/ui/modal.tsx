"use client";

import { X } from "lucide-react";
import React, { memo, useId, type ReactNode } from "react";

import { cn } from "@/lib/utilities";

interface ModalProperties {
  children: ReactNode;
  onClose: () => void;
  open: boolean;
  title?: string;
}

const Modal = memo<ModalProperties>(({ children, onClose, open, title }) => {
  const titleId = useId();

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60"
      onClick={onClose}
      role="presentation"
    >
      <dialog
        aria-labelledby={titleId}
        className={cn(
          "fixed top-1/2 left-1/2 max-h-[90dvh] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-gray-200 bg-white p-6 shadow-lg"
        )}
        onCancel={event => {
          event.preventDefault();
          onClose();
        }}
        onClick={event => {
          event.stopPropagation();
        }}
        open
      >
        <h2
          className={title ? "text-lg leading-none font-semibold" : "sr-only"}
          id={titleId}
        >
          {title ?? "Details"}
        </h2>
        <button
          aria-label="Close"
          className="absolute top-4 right-4 rounded-sm text-gray-500 transition-colors hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
          onClick={onClose}
          type="button"
        >
          <X className="size-4" />
        </button>
        <div className="mt-4 mb-6">{children}</div>
      </dialog>
    </div>
  );
});

Modal.displayName = "Modal";

export default Modal;
