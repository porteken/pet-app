/* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
// eslint-disable-next-line import/no-unassigned-import
import "./module-mocks";

import { vi } from "vitest";

import {
  createMockCookieStore,
  createMockLinearRegression,
  createMockSupabaseClient,
  createMockValidation,
  setupSuccessfulValidations,
} from "./mocks";

import type { createClient as createBrowserClient } from "@/config/supabase/client";
import type { createClient as createServerClient } from "@/config/supabase/server";
import type { SimpleLinearRegression } from "@/lib/utils/simple-linear-regression";
import type { cookies as cookiesFunction } from "next/headers";

export const setupApiClientTest = async () => {
  const mockSupabaseClient = createMockSupabaseClient();
  const mockValidation = createMockValidation();

  const { createClient } = await import("@/config/supabase/client");
  vi.mocked(createClient).mockReturnValue(
    mockSupabaseClient as ReturnType<typeof createBrowserClient>,
  );

  const validation = await import("@/lib/utils/validation");
  Object.assign(validation, mockValidation);

  setupSuccessfulValidations(mockValidation);

  return { mockSupabaseClient, mockValidation };
};

export const setupApiServerTest = async () => {
  const mockCookieStore = createMockCookieStore();
  const mockSupabaseClient = createMockSupabaseClient();
  const mockLinearRegression = createMockLinearRegression();
  const mockValidation = createMockValidation();

  const { cookies } = await import("next/headers");
  vi.mocked(cookies).mockResolvedValue(
    mockCookieStore as unknown as Awaited<ReturnType<typeof cookiesFunction>>,
  );

  const { createClient } = await import("@/config/supabase/server");
  vi.mocked(createClient).mockResolvedValue(
    mockSupabaseClient as Awaited<ReturnType<typeof createServerClient>>,
  );

  const { SimpleLinearRegression } =
    await import("@/lib/utils/simple-linear-regression");
  vi.mocked(SimpleLinearRegression).mockImplementation(
    function MockSimpleLinearRegression() {
      return mockLinearRegression as unknown as SimpleLinearRegression;
    },
  );

  const validation = await import("@/lib/utils/validation");
  Object.assign(validation, mockValidation);
  setupSuccessfulValidations(mockValidation);

  return {
    mockCookieStore,
    mockLinearRegression,
    mockSupabaseClient,
    mockValidation,
  };
};

export const clearAllMocks = () => {
  vi.clearAllMocks();
};
