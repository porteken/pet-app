"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error;
  reset: () => void;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto max-w-xl px-4 py-12">
          <div className="flex flex-col items-center gap-6 text-center">
            <h1 className="text-3xl font-bold text-red-600">
              Something went wrong!
            </h1>
            <p className="max-w-md text-base text-gray-600">{error.message}</p>

            <div className="flex w-full max-w-md flex-col gap-3">
              <Button className="w-full" onClick={() => reset()} type="button">
                Try again
              </Button>

              <Alert variant="info">
                <AlertTitle>Need help?</AlertTitle>
                <AlertDescription>
                  Contact Kenneth Porter at{" "}
                  <a
                    className="text-blue-600 underline hover:text-blue-800"
                    href="mailto:porteken@gmail.com"
                  >
                    porteken@gmail.com
                  </a>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
