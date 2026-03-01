import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "@/testing/server";

process.env.NEXT_PUBLIC_SUPABASE_URL ??= "https://mock-supabase.local";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "mock-supabase-anon-key";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "bypass" });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
