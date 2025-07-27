"use client";

import { ErrorBoundary } from "@/components/ui/error-boundary/error-boundary";

import HomeMain from "./home-main";
import { MapProperties } from "./types";

const HomeMainWithErrorBoundary = (properties: MapProperties) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="m-10 flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8">
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
          <p className="mb-4 text-sm text-red-600">
            The application encountered an error loading the map or data.
          </p>
          <button
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            onClick={() => globalThis.location.reload()}
            type="button"
          >
            Refresh Page
          </button>
        </div>
      }
    >
      <HomeMain
        initialGraphMeasure={properties.initialGraphMeasure}
        LocationOptions={properties.LocationOptions}
        locations={properties.locations}
      />
    </ErrorBoundary>
  );
};

export default HomeMainWithErrorBoundary;
