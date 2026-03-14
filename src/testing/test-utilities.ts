import { vi } from "vitest";

import "./module-mocks";
import {
  createMockCookieStore,
  createMockLinearRegression,
  createMockSupabaseClient,
  createMockValidation,
  setupSuccessfulValidations,
} from "./mocks";

export const setupApiClientTest = async () => {
  const mockSupabaseClient = createMockSupabaseClient();
  const mockValidation = createMockValidation();

  const { createClient } = await import("@/config/supabase/client");
  vi.mocked(createClient).mockReturnValue(mockSupabaseClient as any);

  const validation = await import("@/lib/utils/validation");
  Object.assign(validation, mockValidation);

  setupSuccessfulValidations(mockValidation);

  return { mockSupabaseClient, mockValidation };
};

export const setupApiServerTest = async () => {
  const mockCookieStore = createMockCookieStore();
  const mockSupabaseClient = createMockSupabaseClient();
  const mockLinearRegression = createMockLinearRegression();

  const { cookies } = await import("next/headers");
  vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

  const { createClient } = await import("@/config/supabase/server");
  vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

  const { SimpleLinearRegression } =
    await import("@/lib/utils/simple-linear-regression");
  vi.mocked(SimpleLinearRegression).mockImplementation(
    function MockSimpleLinearRegression() {
      return mockLinearRegression as any;
    }
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
