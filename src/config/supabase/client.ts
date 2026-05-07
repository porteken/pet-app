import { getPublicEnvironment, isE2ETestRun } from "@/config/environment";
import { createRuntimeMockSupabaseClient } from "@/testing/runtime-mocks";
import { createBrowserClient } from "@supabase/ssr";

import type { SupabaseClient } from "@supabase/supabase-js";

let cachedBrowserClient: SupabaseClient | undefined;

export const createClient = (): SupabaseClient => {
  if (isE2ETestRun()) {
    return createRuntimeMockSupabaseClient() as unknown as SupabaseClient;
  }

  if (cachedBrowserClient) {
    return cachedBrowserClient;
  }

  const { NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, NEXT_PUBLIC_SUPABASE_URL } =
    getPublicEnvironment();

  cachedBrowserClient = createBrowserClient(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

  return cachedBrowserClient;
};
