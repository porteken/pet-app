"use client";

import { reloadPage } from "@/utils/reload";
import React from "react";

interface DatabaseErrorProperties {
  message?: string;
  showContactInfo?: boolean;
  title?: string;
}

export const DatabaseError: React.FC<DatabaseErrorProperties> = ({
  message = "Unable to connect to the database. Please try again later.",
  showContactInfo = true,
  title = "Database Connection Error",
}) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="mx-auto max-w-md p-6 text-center">
        <div className="mb-6">
          <svg
            aria-hidden="true"
            className="mx-auto size-12 text-red-500"
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

        <h1 className="mb-4 text-2xl font-bold text-gray-900">{title}</h1>

        <p className="mb-6 text-gray-600">{message}</p>

        {showContactInfo && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>Need help?</strong> Contact Kenneth Porter at{" "}
              <a
                className="text-blue-600 underline hover:text-blue-800"
                href="mailto:porteken@gmail.com"
              >
                porteken@gmail.com
              </a>
            </p>
          </div>
        )}

        <div className="mt-6">
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
            onClick={reloadPage}
            type="button"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};
