import { NextResponse } from "next/server";

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
