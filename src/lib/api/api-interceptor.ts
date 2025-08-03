import { createError, NetworkError } from "@/lib/utils/errors";

export const handleApiResponse = async <T>(
  response: Response,
  context?: Record<string, any>
): Promise<T> => {
  if (!response.ok) {
    const errorMessage = await extractErrorMessage(response);
    const error = createError(
      errorMessage,
      response.status,
      undefined,
      undefined,
      { ...context, url: response.url }
    );

    throw error;
  }

  try {
    return await response.json();
  } catch (parseError) {
    const error = new NetworkError(
      "Failed to parse server response",
      500,
      parseError,
      context
    );

    throw error;
  }
};

const extractErrorMessage = async (response: Response): Promise<string> => {
  try {
    const errorData = await response.json();

    if (errorData.message) {
      return errorData.message;
    }
    if (errorData.error) {
      return errorData.error;
    }
    if (errorData.detail) {
      return errorData.detail;
    }
    if (typeof errorData === "string") {
      return errorData;
    }

    return getDefaultErrorMessage(response.status);
  } catch {
    return getDefaultErrorMessage(response.status);
  }
};

const getDefaultErrorMessage = (statusCode: number): string => {
  switch (statusCode) {
    case 400: {
      return "Invalid request. Please check your input.";
    }
    case 401: {
      return "Authentication required. Please log in.";
    }
    case 403: {
      return "Access denied. You don't have permission to perform this action.";
    }
    case 404: {
      return "The requested resource was not found.";
    }
    case 422: {
      return "Validation failed. Please check your input.";
    }
    case 429: {
      return "Too many requests. Please try again later.";
    }
    case 500: {
      return "Internal server error. Please try again later.";
    }
    case 502: {
      return "Bad gateway. The server is temporarily unavailable.";
    }
    case 503: {
      return "Service unavailable. Please try again later.";
    }
    default: {
      return `Request failed with status ${statusCode}`;
    }
  }
};

export const apiRequest = async <T>(
  url: string,
  options: RequestInit = {},
  context?: Record<string, any>
): Promise<T> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    return await handleApiResponse<T>(response, {
      ...context,
      method: options.method || "GET",
    });
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      const networkError = new NetworkError(
        "Network connection failed",
        0,
        error,
        context
      );

      throw networkError;
    }

    throw error;
  }
};

export const apiRequestWithRetry = async <T>(
  url: string,
  options: RequestInit = {},
  retries: number = 3,
  context?: Record<string, any>
): Promise<T> => {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await apiRequest<T>(url, options, { ...context, attempt });
    } catch (error) {
      lastError = error as Error;

      if (
        error instanceof NetworkError &&
        error.statusCode >= 400 &&
        error.statusCode < 500 &&
        error.statusCode !== 429
      ) {
        throw error;
      }

      if (attempt === retries) {
        throw error;
      }

      const delay = Math.min(1000 * 2 ** (attempt - 1), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error("Unknown error occurred");
};
