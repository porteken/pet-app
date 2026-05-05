import { FetchError } from "@/lib/utils/errors";
import * as Sentry from "@sentry/nextjs";

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

type ErrorHandler = (error: Error) => void;

export async function apiRequest<T>(
  requestFunction: () => Promise<T>,
  errorHandler?: ErrorHandler,
): Promise<ApiResponse<T>> {
  try {
    const data = await requestFunction();

    return {
      data,
      error: undefined,
    };
  } catch (error) {
    const formattedError = handleApiError(error);

    if (errorHandler && error instanceof Error) {
      errorHandler(error);
    }

    return {
      data: undefined,
      error: formattedError,
    };
  }
}

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

function handleApiError(error: unknown) {
  if (error instanceof Error) {
    Sentry.captureException(error, {
      tags: {
        errorSource: "API",
      },
    });
  }

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
