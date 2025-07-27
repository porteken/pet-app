"use client";

import * as Sentry from "@sentry/nextjs";
import React, { Component, ReactNode } from "react";

interface ErrorBoundaryProperties {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | undefined;
  hasError: boolean;
}

class ErrorBoundary extends Component<
  ErrorBoundaryProperties,
  ErrorBoundaryState
> {
  constructor(properties: ErrorBoundaryProperties) {
    super(properties);
    this.state = {
      error: undefined,
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      error,
      hasError: true,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      tags: {
        errorSource: "ErrorBoundary",
      },
    });

    // Errors are logged to Sentry - console logging removed for production
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8">
            <div className="mb-2 text-red-500">
              <svg
                className="h-10 w-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
            <h2 className="mb-2 text-lg font-semibold text-red-700">
              Something went wrong
            </h2>
            <p className="text-sm text-red-600">
              The application encountered an unexpected error. Please try
              refreshing the page.
            </p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
