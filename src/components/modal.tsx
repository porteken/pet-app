"use client";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode } from "react";

interface ModalProperties {
  children: ReactNode;
  onClose: () => void;
  open: boolean;
  title?: string;
}

export default function Modal({
  children,
  onClose,
  open,
  title,
}: Readonly<ModalProperties>) {
  return (
    <Transition as={Fragment} show={open}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div
          className="fixed inset-0 bg-black/30 transition-opacity"
          style={{
            animation: open ? "fadeIn 300ms ease-out" : "fadeOut 200ms ease-in",
          }}
        />
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 py-8 text-center">
            <div
              className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
              style={{
                animation: open
                  ? "slideIn 300ms ease-out"
                  : "slideOut 200ms ease-in",
              }}
            >
              {title && (
                <h3 className="mb-6 text-center text-lg font-bold">{title}</h3>
              )}
              <button
                aria-label="Close"
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 focus:outline-none"
                onClick={onClose}
                type="button"
              >
                <svg
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div className="mb-6">{children} </div>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
