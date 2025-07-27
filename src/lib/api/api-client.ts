import * as Sentry from "@sentry/nextjs";

import { FetchError } from "@/lib/utils/errors";

// Define API response type
export type ApiResponse<T> =
  | {
      data: T;
      error: undefined;
    }
  | {
      data: undefined;
      error: {
        code?: string;
        message: string;
        status?: number;
      };
    };

// Error handler type
type ErrorHandler = (error: Error) => void;

// Generic API request function with error handling
export async function apiRequest<T>(
  requestFunction: () => Promise<T>,
  errorHandler?: ErrorHandler
): Promise<ApiResponse<T>> {
  try {
    const data = await requestFunction();

    return {
      data,
      error: undefined,
    };
  } catch (error) {
    // Handle and format error
    const formattedError = handleApiError(error);

    // Call custom error handler if provided
    if (errorHandler && error instanceof Error) {
      errorHandler(error);
    }

    return {
      data: undefined,
      error: formattedError,
    };
  }
}

// Helper function to check if response has error
export function hasError<T>(response: ApiResponse<T>): response is {
  data: undefined;
  error: {
    code?: string;
    message: string;
    status?: number;
  };
} {
  return response.error !== undefined;
}

// Process API errors
function handleApiError(error: unknown) {
  // Send error to Sentry
  if (error instanceof Error) {
    Sentry.captureException(error, {
      tags: {
        errorSource: "API",
      },
    });
  }

  // Format error message for client
  if (error instanceof FetchError) {
    return {
      code: "FETCH_ERROR",
      message: error.message,
      status: 500,
    };
  }

  if (error instanceof Error) {
    return {
      code: "UNKNOWN_ERROR",
      message: error.message,
      status: 500,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "An unknown error occurred",
    status: 500,
  };
}
