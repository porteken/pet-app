import { createError, NetworkError } from "@/lib/utils/errors";

// API response interceptor for handling errors
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

// Extract error message from response
const extractErrorMessage = async (response: Response): Promise<string> => {
  try {
    const errorData = await response.json();

    // Common error message patterns
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

// Get default error message based on status code
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

// Fetch wrapper with error handling
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
    // Handle network errors (fetch failures)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      const networkError = new NetworkError(
        "Network connection failed",
        0,
        error,
        context
      );

      // Network error occurred, throw it directly
      throw networkError;
    }

    // Re-throw if it's already one of our custom errors
    throw error;
  }
};

// Retry mechanism for failed requests
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

      // Don't retry client errors (4xx) except for 429 (rate limiting)
      if (
        error instanceof NetworkError &&
        error.statusCode >= 400 &&
        error.statusCode < 500 &&
        error.statusCode !== 429
      ) {
        throw error;
      }

      // Don't retry on the last attempt
      if (attempt === retries) {
        throw error;
      }

      // Exponential backoff
      const delay = Math.min(1000 * 2 ** (attempt - 1), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // This should never be reached due to the logic above, but TypeScript needs this
  throw lastError || new Error("Unknown error occurred");
};
