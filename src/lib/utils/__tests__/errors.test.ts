import { describe, expect, it } from "vitest";

import { AppError, DatabaseError, FetchError } from "../errors";

describe("Error Classes", () => {
  describe("AppError", () => {
    it("should create an AppError with basic properties", () => {
      const error = new AppError("Test message", "TEST_CODE");

      expect(error.message).toBe("Test message");
      expect(error.code).toBe("TEST_CODE");
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe("AppError");
      expect(error.originalError).toBeUndefined();
    });

    it("should create an AppError with custom status code", () => {
      const error = new AppError("Not found", "NOT_FOUND", 404);

      expect(error.message).toBe("Not found");
      expect(error.code).toBe("NOT_FOUND");
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe("AppError");
    });

    it("should create an AppError with original error", () => {
      const originalError = new Error("Original error");
      const error = new AppError(
        "Wrapped error",
        "WRAP_ERROR",
        500,
        originalError
      );

      expect(error.message).toBe("Wrapped error");
      expect(error.code).toBe("WRAP_ERROR");
      expect(error.statusCode).toBe(500);
      expect(error.originalError).toBe(originalError);
      expect(error.name).toBe("AppError");
    });

    it("should be an instance of Error", () => {
      const error = new AppError("Test", "TEST");
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe("DatabaseError", () => {
    it("should create a DatabaseError with basic properties", () => {
      const error = new DatabaseError("Database connection failed");

      expect(error.message).toBe("Database connection failed");
      expect(error.code).toBe("DATABASE_ERROR");
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe("DatabaseError");
      expect(error.originalError).toBeUndefined();
    });

    it("should create a DatabaseError with original error", () => {
      const originalError = new Error("Connection timeout");
      const error = new DatabaseError("Database error", originalError);

      expect(error.message).toBe("Database error");
      expect(error.code).toBe("DATABASE_ERROR");
      expect(error.statusCode).toBe(500);
      expect(error.originalError).toBe(originalError);
      expect(error.name).toBe("DatabaseError");
    });

    it("should be an instance of AppError and Error", () => {
      const error = new DatabaseError("Test");
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(DatabaseError);
    });
  });

  describe("FetchError", () => {
    it("should create a FetchError with basic properties", () => {
      const error = new FetchError("Fetch failed");

      expect(error.message).toBe("Fetch failed");
      expect(error.name).toBe("FetchError");
      expect(error.originalError).toBeUndefined();
    });

    it("should create a FetchError with original error", () => {
      const originalError = new Error("Network error");
      const error = new FetchError("Fetch error", originalError);

      expect(error.message).toBe("Fetch error");
      expect(error.originalError).toBe(originalError);
      expect(error.name).toBe("FetchError");
    });

    it("should be an instance of Error", () => {
      const error = new FetchError("Test");
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(FetchError);
    });

    it("should not be an instance of AppError", () => {
      const error = new FetchError("Test");
      expect(error).not.toBeInstanceOf(AppError);
    });
  });
});
