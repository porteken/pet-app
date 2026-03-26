"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-3xl font-bold text-red-600">
          Something went wrong!
        </h1>
        <p className="max-w-md text-base text-gray-600">
          {error.message || "An unexpected error occurred"}
        </p>

        <div className="flex w-full max-w-md flex-col gap-3">
          <Button className="w-full" onClick={() => reset()} type="button">
            Try again
          </Button>

          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
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
        </div>
      </div>
    </div>
  );
}
