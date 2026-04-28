"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AboutError({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-3xl font-bold text-red-600">About Page Error</h1>
        <p className="max-w-md text-base text-gray-600">
          {error.message ||
            "An error occurred while loading the about page content."}
        </p>

        <div className="flex w-full max-w-md flex-col gap-3">
          <Button className="w-full" onClick={reset} type="button">
            Try again
          </Button>
          <Button asChild className="w-full" variant="outline">
            <Link href="/">Return to homepage</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
