import * as Sentry from "@sentry/nextjs";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode = 500,
    public readonly originalError?: unknown,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = "AppError";

    Sentry.captureException(this, {
      contexts: {
        error: {
          code: this.code,
          context: this.context,
          statusCode: this.statusCode,
        },
      },
      tags: {
        errorCode: this.code,
        errorType: "AppError",
      },
    });
  }
}

export class AuthenticationError extends AppError {
  constructor(
    message: string = "Authentication failed",
    originalError?: unknown
  ) {
    super(message, "AUTHENTICATION_ERROR", 401, originalError);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Access denied", originalError?: unknown) {
    super(message, "AUTHORIZATION_ERROR", 403, originalError);
    this.name = "AuthorizationError";
  }
}

export class DatabaseError extends AppError {
  constructor(
    message: string,
    originalError?: unknown,
    context?: Record<string, any>
  ) {
    super(message, "DATABASE_ERROR", 500, originalError, context);
    this.name = "DatabaseError";
  }
}

export class NetworkError extends AppError {
  constructor(
    message: string,
    statusCode: number,
    originalError?: unknown,
    context?: Record<string, any>
  ) {
    super(message, "NETWORK_ERROR", statusCode, originalError, context);
    this.name = "NetworkError";
  }
}

export class FetchError extends NetworkError {
  constructor(message: string, originalError?: unknown) {
    super(message, 500, originalError);
    this.name = "FetchError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, resource?: string, originalError?: unknown) {
    super(message, "NOT_FOUND_ERROR", 404, originalError, { resource });
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string, originalError?: unknown) {
    super(message, "VALIDATION_ERROR", 400, originalError, { field });
    this.name = "ValidationError";
  }
}

export const createError = (
  message: string,
  statusCode: number = 500,
  _code?: string,
  originalError?: unknown,
  context?: Record<string, any>
): AppError => {
  switch (statusCode) {
    case 400: {
      return new ValidationError(message, context?.field, originalError);
    }
    case 401: {
      return new AuthenticationError(message, originalError);
    }
    case 403: {
      return new AuthorizationError(message, originalError);
    }
    case 404: {
      return new NotFoundError(message, context?.resource, originalError);
    }
    default: {
      if (statusCode >= 500) {
        return new DatabaseError(message, originalError, context);
      }
      return new NetworkError(message, statusCode, originalError, context);
    }
  }
};

export const handleAsyncError = (
  error: unknown,
  context?: Record<string, any>
): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    if (error.message.includes("network") || error.message.includes("fetch")) {
      return new NetworkError(error.message, 500, error, context);
    }

    if (
      error.message.includes("database") ||
      error.message.includes("connection")
    ) {
      return new DatabaseError(error.message, error, context);
    }

    return new AppError(error.message, "UNKNOWN_ERROR", 500, error, context);
  }

  const message =
    typeof error === "string" ? error : "An unknown error occurred";
  return new AppError(message, "UNKNOWN_ERROR", 500, error, context);
};
