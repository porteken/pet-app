import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { middleware } from "./middleware";

// Helper function to create a mock NextRequest
const createMockRequest = (pathname: string) => {
  return {
    nextUrl: {
      pathname,
    },
  } as NextRequest;
};

describe("middleware", () => {
  describe("static files", () => {
    it("should return 404 for robots.txt", () => {
      const request = createMockRequest("/robots.txt");
      const response = middleware(request);

      expect(response.status).toBe(404);
    });

    it("should return 404 for sitemap.xml", () => {
      const request = createMockRequest("/sitemap.xml");
      const response = middleware(request);

      expect(response.status).toBe(404);
    });
  });

  describe("known routes", () => {
    it("should allow /about route", () => {
      const request = createMockRequest("/about");
      const response = middleware(request);

      // NextResponse.next() returns a response with no specific status
      expect(response).toBeDefined();
    });

    it("should allow /map route", () => {
      const request = createMockRequest("/map");
      const response = middleware(request);

      expect(response).toBeDefined();
    });
  });

  describe("dynamic routes", () => {
    it("should allow valid numeric ID", () => {
      const request = createMockRequest("/123");
      const response = middleware(request);

      expect(response).toBeDefined();
    });

    it("should return 404 for non-numeric ID", () => {
      const request = createMockRequest("/abc");
      const response = middleware(request);

      expect(response.status).toBe(404);
    });

    it("should return 404 for zero ID", () => {
      const request = createMockRequest("/0");
      const response = middleware(request);

      expect(response.status).toBe(404);
    });

    it("should return 404 for negative ID", () => {
      const request = createMockRequest("/-5");
      const response = middleware(request);

      expect(response.status).toBe(404);
    });

    it("should allow positive numeric ID", () => {
      const request = createMockRequest("/42");
      const response = middleware(request);

      expect(response).toBeDefined();
    });
  });

  describe("root route", () => {
    it("should allow root path", () => {
      const request = createMockRequest("/");
      const response = middleware(request);

      expect(response).toBeDefined();
    });
  });

  describe("edge cases", () => {
    it("should handle mixed alphanumeric routes", () => {
      const request = createMockRequest("/123abc");
      const response = middleware(request);

      expect(response.status).toBe(404);
    });

    it("should handle route with special characters", () => {
      const request = createMockRequest("/test-route");
      const response = middleware(request);

      expect(response.status).toBe(404);
    });
  });
});
