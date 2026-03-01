"use client";

import { X } from "lucide-react";
import React, { memo, useId, type ReactNode } from "react";

import { cn } from "@/lib/utilities";

interface ModalProperties {
  children: ReactNode;
  constrainToParent?: boolean;
  dialogClassName?: string;
  mobileFullscreen?: boolean;
  onClose: () => void;
  open: boolean;
  title?: string;
}

const Modal = memo<ModalProperties>(
  ({
    children,
    constrainToParent = false,
    dialogClassName,
    mobileFullscreen = false,
    onClose,
    open,
    title,
  }) => {
    const titleId = useId();

    if (!open) {
      return null;
    }

    return (
      <div
        className={cn(
          "z-[11000] bg-black/60",
          constrainToParent
            ? mobileFullscreen
              ? "fixed inset-0 sm:absolute sm:inset-0"
              : "absolute inset-0"
            : "fixed inset-0"
        )}
        onClick={onClose}
        role="presentation"
      >
        <dialog
          aria-labelledby={titleId}
          className={cn(
            mobileFullscreen
              ? "inset-0 h-[100dvh] max-h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-none border-0 bg-white p-3 shadow-lg sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[95dvh] sm:w-[calc(100%-2rem)] sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:border sm:border-gray-200 sm:p-4 lg:p-5"
              : "top-1/2 left-1/2 max-h-[86dvh] w-[calc(100%-1rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3 shadow-lg sm:max-h-[90dvh] sm:w-[calc(100%-2rem)] sm:p-6",
            constrainToParent
              ? mobileFullscreen
                ? "fixed sm:absolute"
                : "absolute"
              : "fixed",
            dialogClassName
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
            className={
              title
                ? "text-base leading-none font-semibold sm:text-lg"
                : "sr-only"
            }
            id={titleId}
          >
            {title ?? "Details"}
          </h2>
          <button
            aria-label="Close"
            className="absolute top-3 right-3 rounded-sm text-gray-500 transition-colors hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none sm:top-4 sm:right-4"
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
          <div className="mt-3 mb-4 sm:mt-3 sm:mb-4">{children}</div>
        </dialog>
      </div>
    );
  }
);

Modal.displayName = "Modal";

export default Modal;
