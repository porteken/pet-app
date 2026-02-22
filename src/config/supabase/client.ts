import { createBrowserClient } from "@supabase/ssr";

import { createMockSupabaseClient } from "@/testing/mocks/mock-end-to-end-test-data";

const isE2ETestRun = process.env.NEXT_PUBLIC_E2E_TEST === "true";

export const createClient = () => {
  // Return mock client for E2E tests
  if (isE2ETestRun) {
    return createMockSupabaseClient();
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
