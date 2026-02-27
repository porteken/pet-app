import type { SupabaseClient } from "@supabase/supabase-js";

import { createBrowserClient } from "@supabase/ssr";

import { createRuntimeMockSupabaseClient } from "@/testing/runtime-mocks";

const isE2ETestRun = process.env.NEXT_PUBLIC_E2E_TEST === "true";

export const createClient = (): SupabaseClient => {
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

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};
