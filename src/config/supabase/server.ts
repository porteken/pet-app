import type { SupabaseClient } from "@supabase/supabase-js";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getPublicEnvironment, isE2ETestRun } from "@/config/environment";
import { createRuntimeMockSupabaseClient } from "@/testing/runtime-mocks";

export const createClient = async (
  cookieStore: ReturnType<typeof cookies>
): Promise<SupabaseClient> => {
  if (isE2ETestRun()) {
    return createRuntimeMockSupabaseClient() as unknown as SupabaseClient;
  }

  const { NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_URL } =
    getPublicEnvironment();

  const resolvedCookieStore = await cookieStore;

  return createServerClient(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
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
    }
  );
};
