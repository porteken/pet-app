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

export const setupActionsTest = async () => {
  const mockCookieStore = createMockCookieStore();

  const { cookies } = await import("next/headers");
  vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

  return { mockCookieStore };
};

export const clearAllMocks = () => {
  vi.clearAllMocks();
};
