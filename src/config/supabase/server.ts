import type { cookies } from "next/headers";

export const createClient = async (
  _cookieStore: Awaited<ReturnType<typeof cookies>>,
) => {
  throw new Error(
    "Supabase server access is no longer supported. Use the Kysely-backed query helpers instead.",
  );
};
