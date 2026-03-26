import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getPublicEnvironment, isE2ETestRun } from "@/config/environment";
import { createRuntimeMockSupabaseClient } from "@/testing/runtime-mocks";

export const createClient = (): SupabaseClient => {
  if (isE2ETestRun()) {
    return createRuntimeMockSupabaseClient() as unknown as SupabaseClient;
  }

  const { NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_URL } = getPublicEnvironment();

  return createBrowserClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);
};
