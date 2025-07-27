import { vi } from "vitest";

import {
  createMockCookieStore,
  createMockLinearRegression,
} from "./mocks/next";
import { createMockSupabaseClient } from "./mocks/supabase";
import {
  createMockValidation,
  setupSuccessfulValidations,
} from "./mocks/validation";

/**
 * Common setup for API tests that use Supabase client and validation
 */
export const setupApiClientTest = async () => {
  const mockSupabaseClient = createMockSupabaseClient();
  const mockValidation = createMockValidation();

  // Mock createClient
  const { createClient } = await import("@/config/supabase/client");
  vi.mocked(createClient).mockReturnValue(mockSupabaseClient as any);

  // Mock validation functions
  const validation = await import("@/lib/utils/validation");
  Object.assign(validation, mockValidation);

  // Setup default successful validations
  setupSuccessfulValidations(mockValidation);

  return { mockSupabaseClient, mockValidation };
};

/**
 * Common setup for API tests that use Supabase server and cookies
 */
export const setupApiServerTest = async () => {
  const mockCookieStore = createMockCookieStore();
  const mockSupabaseClient = createMockSupabaseClient();
  const mockLinearRegression = createMockLinearRegression();

  // Mock cookies
  const { cookies } = await import("next/headers");
  vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

  // Mock createClient
  const { createClient } = await import("@/config/supabase/server");
  vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

  // Mock SimpleLinearRegression
  const { SimpleLinearRegression } = await import(
    "@/lib/utils/simple-linear-regression"
  );
  vi.mocked(SimpleLinearRegression).mockImplementation(
    () => mockLinearRegression as any
  );

  return { mockCookieStore, mockLinearRegression, mockSupabaseClient };
};

/**
 * Common setup for Next.js actions that use cookies
 */
export const setupActionsTest = async () => {
  const mockCookieStore = createMockCookieStore();

  // Mock cookies
  const { cookies } = await import("next/headers");
  vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

  return { mockCookieStore };
};

/**
 * Generic function to clear all mocks
 */
export const clearAllMocks = () => {
  vi.clearAllMocks();
};
