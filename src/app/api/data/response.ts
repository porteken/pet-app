import { NextResponse } from "next/server";

const DATA_RESPONSE_CACHE_CONTROL =
  "public, s-maxage=3600, stale-while-revalidate=86400";

const hasStatusCode = (
  error: unknown,
): error is {
  message: string;
  statusCode: number;
} =>
  typeof error === "object" &&
  error !== null &&
  "message" in error &&
  typeof error.message === "string" &&
  "statusCode" in error &&
  typeof error.statusCode === "number";

export const createDataRouteErrorResponse = (
  error: unknown,
  fallbackMessage: string,
) => {
  if (hasStatusCode(error)) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
};

export const createCachedDataRouteResponse = (data: unknown) =>
  NextResponse.json(data, {
    headers: {
      "Cache-Control": DATA_RESPONSE_CACHE_CONTROL,
    },
  });
