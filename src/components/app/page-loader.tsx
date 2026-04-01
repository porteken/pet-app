import React from "react";

export const PageLoader = () => (
  <div
    aria-live="polite"
    className="flex h-screen w-full items-center justify-center bg-gray-50"
    role="status"
  >
    <div className="flex flex-col items-center space-y-4">
      <div
        aria-hidden="true"
        className="size-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"
      />
      <p className="text-gray-600">Loading map...</p>
    </div>
  </div>
);
