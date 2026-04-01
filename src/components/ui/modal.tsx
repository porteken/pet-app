"use client";

import { X } from "lucide-react";
import React, { memo, useEffect, useId, useRef, type ReactNode } from "react";

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
    const dialogReference = useRef<HTMLDialogElement>(null);

    useEffect(() => {
      if (!open || !dialogReference.current) {
        return;
      }

      const dialog = dialogReference.current;
      const focusableSelector =
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => !element.hasAttribute("disabled"));

      focusableElements[0]?.focus();

      const handleKeydown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
          return;
        }

        if (event.key !== "Tab" || focusableElements.length === 0) {
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements.at(-1);
        const activeElement = document.activeElement;

        if (event.shiftKey && activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        } else if (!event.shiftKey && activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      };

      dialog.addEventListener("keydown", handleKeydown);

      return () => {
        dialog.removeEventListener("keydown", handleKeydown);
      };
    }, [onClose, open]);

    if (!open) {
      return null;
    }

    let overlayPositionClass = "fixed inset-0";
    if (constrainToParent) {
      overlayPositionClass = mobileFullscreen
        ? "fixed inset-0 sm:absolute sm:inset-0"
        : "absolute inset-0";
    }

    let dialogPositionClass = "fixed";
    if (constrainToParent) {
      dialogPositionClass = mobileFullscreen ? "fixed sm:absolute" : "absolute";
    }

    return (
      <div className={cn("z-[11000] bg-black/60", overlayPositionClass)}>
        <button
          aria-label="Close dialog"
          className="absolute inset-0 cursor-default focus:outline-none"
          onClick={onClose}
          type="button"
        />
        <dialog
          aria-labelledby={titleId}
          aria-modal="true"
          className={cn(
            mobileFullscreen
              ? "inset-0 h-[100dvh] max-h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-none border-0 bg-white p-3 shadow-lg sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[95dvh] sm:w-[calc(100%-2rem)] sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:border sm:border-gray-200 sm:p-4 lg:p-5"
              : "top-1/2 left-1/2 max-h-[86dvh] w-[calc(100%-1rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3 shadow-lg sm:max-h-[90dvh] sm:w-[calc(100%-2rem)] sm:p-6",
            dialogPositionClass,
            dialogClassName,
          )}
          onCancel={(event) => {
            event.preventDefault();
            onClose();
          }}
          open
          ref={dialogReference}
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
  },
);

Modal.displayName = "Modal";

export default Modal;
