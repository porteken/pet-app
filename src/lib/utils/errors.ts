import * as Sentry from "@sentry/nextjs";

const HTTP_BAD_REQUEST = 400;
const HTTP_UNAUTHORIZED = 401;
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;
const HTTP_INTERNAL_ERROR = 500;

export type ErrorContext = Record<string, unknown> & {
  field?: string;
  resource?: string;
};

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode = HTTP_INTERNAL_ERROR,
    public readonly originalError?: unknown,
    public readonly context?: ErrorContext,
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
    originalError?: unknown,
  ) {
    super(message, "AUTHENTICATION_ERROR", HTTP_UNAUTHORIZED, originalError);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Access denied", originalError?: unknown) {
    super(message, "AUTHORIZATION_ERROR", HTTP_FORBIDDEN, originalError);
    this.name = "AuthorizationError";
  }
}

export class DatabaseError extends AppError {
  constructor(
    message: string,
    originalError?: unknown,
    context?: ErrorContext,
  ) {
    super(
      message,
      "DATABASE_ERROR",
      HTTP_INTERNAL_ERROR,
      originalError,
      context,
    );
    this.name = "DatabaseError";
  }
}

export class NetworkError extends AppError {
  constructor(
    message: string,
    statusCode: number,
    originalError?: unknown,
    context?: ErrorContext,
  ) {
    super(message, "NETWORK_ERROR", statusCode, originalError, context);
    this.name = "NetworkError";
  }
}

export class FetchError extends NetworkError {
  constructor(message: string, originalError?: unknown) {
    super(message, HTTP_INTERNAL_ERROR, originalError);
    this.name = "FetchError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, resource?: string, originalError?: unknown) {
    super(message, "NOT_FOUND_ERROR", HTTP_NOT_FOUND, originalError, {
      resource,
    });
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string, originalError?: unknown) {
    super(message, "VALIDATION_ERROR", HTTP_BAD_REQUEST, originalError, {
      field,
    });
    this.name = "ValidationError";
  }
}

export const createError = (
  message: string,
  statusCode: number = HTTP_INTERNAL_ERROR,
  _code?: string,
  originalError?: unknown,
  context?: ErrorContext,
): AppError => {
  switch (true) {
    case statusCode === HTTP_BAD_REQUEST: {
      return new ValidationError(message, context?.field, originalError);
    }
    case statusCode === HTTP_UNAUTHORIZED: {
      return new AuthenticationError(message, originalError);
    }
    case statusCode === HTTP_FORBIDDEN: {
      return new AuthorizationError(message, originalError);
    }
    case statusCode === HTTP_NOT_FOUND: {
      return new NotFoundError(message, context?.resource, originalError);
    }
    case statusCode >= HTTP_INTERNAL_ERROR: {
      return new DatabaseError(message, originalError, context);
    }
    default: {
      return new NetworkError(message, statusCode, originalError, context);
    }
  }
};

export const handleAsyncError = (
  error: unknown,
  context?: ErrorContext,
): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    if (error.message.includes("network") || error.message.includes("fetch")) {
      return new NetworkError(
        error.message,
        HTTP_INTERNAL_ERROR,
        error,
        context,
      );
    }

    if (
      error.message.includes("database") ||
      error.message.includes("connection")
    ) {
      return new DatabaseError(error.message, error, context);
    }

    return new AppError(
      error.message,
      "UNKNOWN_ERROR",
      HTTP_INTERNAL_ERROR,
      error,
      context,
    );
  }

  const message =
    typeof error === "string" ? error : "An unknown error occurred";
  return new AppError(
    message,
    "UNKNOWN_ERROR",
    HTTP_INTERNAL_ERROR,
    error,
    context,
  );
};
