"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import React, {
  memo,
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";

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

    const handleCancel = useCallback(
      (event: React.SyntheticEvent<HTMLDialogElement>) => {
        event.preventDefault();
        onClose();
      },
      [onClose],
    );

    useEffect(() => {
      const dialog = dialogReference.current;
      if (!open || !dialog) {
        return () => {};
      }

      const focusableSelector =
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const focusableElements = [
        ...dialog.querySelectorAll<HTMLElement>(focusableSelector),
      ].filter((element) => !element.hasAttribute("disabled"));

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

    let dialogPositionClass = "relative";
    if (constrainToParent) {
      dialogPositionClass = mobileFullscreen ? "fixed sm:static" : "static";
    }

    return (
      <div
        className={cn(
          "z-11000 bg-black/60",
          overlayPositionClass,
          mobileFullscreen
            ? "sm:flex sm:items-center sm:justify-center sm:p-4"
            : "flex items-center justify-center p-2 sm:p-4",
        )}
      >
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
              ? "inset-0 flex h-dvh max-h-dvh w-screen max-w-none flex-col overflow-y-auto rounded-none border-0 bg-background/95 p-3 shadow-lg backdrop-blur-xl sm:h-auto sm:max-h-[95dvh] sm:w-[calc(100%-2rem)] sm:max-w-3xl sm:rounded-3xl sm:border sm:border-border sm:p-4 lg:p-5"
              : "flex max-h-[86dvh] w-[calc(100%-1rem)] max-w-3xl flex-col overflow-y-auto rounded-3xl border border-border bg-background/95 p-3 shadow-lg backdrop-blur-xl sm:max-h-[90dvh] sm:w-[calc(100%-2rem)] sm:p-6",
            dialogPositionClass,
            dialogClassName,
          )}
          onCancel={handleCancel}
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
            className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/25 absolute top-3 right-3 rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none sm:top-4 sm:right-4"
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
          <div className="mt-3 mb-1 flex min-h-0 flex-1 flex-col sm:mt-3 sm:mb-2">
            {children}
          </div>
        </dialog>
      </div>
    );
  },
);

Modal.displayName = "Modal";

export default Modal;
