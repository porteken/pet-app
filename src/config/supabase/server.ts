import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { getPublicEnvironment, isE2ETestRun } from "@/config/environment";
import { createRuntimeMockSupabaseClient } from "@/testing/runtime-mocks";

export const createClient = async (
  cookieStore: Awaited<ReturnType<typeof cookies>>,
): Promise<SupabaseClient> => {
  if (isE2ETestRun()) {
    return createRuntimeMockSupabaseClient() as unknown as SupabaseClient;
  }

  const { NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, NEXT_PUBLIC_SUPABASE_URL } =
    getPublicEnvironment();

  return createServerClient(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, options, value } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        },
      },
    },
  );
};
