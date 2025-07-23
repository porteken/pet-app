"use client";

import React from "react";

interface ErrorBoundaryProperties {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProperties,
  ErrorBoundaryState
> {
  constructor(properties: ErrorBoundaryProperties) {
    super(properties);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="mx-auto max-w-md p-6 text-center">
              <h1 className="mb-4 text-2xl font-bold text-gray-900">
                Something went wrong
              </h1>
              <p className="mb-4 text-gray-600">
                We&apos;re experiencing technical difficulties. Please try
                refreshing the page.
              </p>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  <strong>Need help?</strong> Contact Kenneth Porter at{" "}
                  <a
                    href="mailto:porteken@gmail.com"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    porteken@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
