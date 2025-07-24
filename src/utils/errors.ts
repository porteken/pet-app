export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode = 500,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: unknown) {
    super(message, "DATABASE_ERROR", 500, originalError);
    this.name = "DatabaseError";
  }
}

export class NetworkError extends AppError {
  constructor(message: string, originalError?: unknown) {
    super(message, "NETWORK_ERROR", 503, originalError);
    this.name = "NetworkError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, originalError?: unknown) {
    super(message, "VALIDATION_ERROR", 400, originalError);
    this.name = "ValidationError";
  }
}

export const logError = (
  error: AppError,
  context?: Record<string, unknown>
) => {
  const errorLog: Record<string, unknown> = {
    code: error.code,
    context,
    message: error.message,
    name: error.name,
    statusCode: error.statusCode,
    timestamp: new Date().toISOString(),
  };

  if (error.originalError) {
    errorLog.originalError = error.originalError;
  }

  if (process.env.NODE_ENV === "development") {
    console.error("Error Details:", errorLog);
  } else {
    console.error(`[${error.code}] ${error.message}`);
  }
};
