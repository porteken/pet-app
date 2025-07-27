import React, { memo } from "react";

interface ErrorGraphDisplayProperties {
  message?: string;
}

export const ErrorGraphDisplay = memo<ErrorGraphDisplayProperties>(
  ({ message = "Unable to load graph data" }) => (
    <div className="flex h-[300px] w-full flex-col items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-red-500">
          <svg
            className="mx-auto size-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </div>
        <p className="mb-2 text-gray-600">{message}</p>
        <p className="text-sm text-gray-500">
          Contact Kenneth Porter at{" "}
          <a
            className="text-blue-600 underline hover:text-blue-800"
            href="mailto:porteken@gmail.com"
          >
            porteken@gmail.com
          </a>
        </p>
      </div>
    </div>
  )
);

ErrorGraphDisplay.displayName = "ErrorGraphDisplay";
