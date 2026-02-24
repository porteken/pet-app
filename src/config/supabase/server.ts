import type { SupabaseClient } from "@supabase/supabase-js";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { createRuntimeMockSupabaseClient } from "@/testing/runtime-mocks";

const isE2ETestRun = process.env.NEXT_PUBLIC_E2E_TEST === "true";

export const createClient = async (
  cookieStore: ReturnType<typeof cookies>
): Promise<SupabaseClient> => {
  // Return mock client for E2E tests
  if (isE2ETestRun) {
    return createRuntimeMockSupabaseClient() as unknown as SupabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
    );
  }

  const resolvedCookieStore = await cookieStore;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return resolvedCookieStore.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, options, value } of cookiesToSet) {
          resolvedCookieStore.set(name, value, options);
        }
      },
    },
  });
};
