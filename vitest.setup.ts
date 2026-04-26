import "@testing-library/jest-dom";

import { afterAll, afterEach, beforeAll, vi } from "vitest";

import { server } from "@/testing/server";

vi.mock("next/font/google", () => ({
  Geist: () => ({
    variable: "--font-sans",
  }),
  Geist_Mono: () => ({
    variable: "--font-mono",
  }),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL ??= "https://mock-supabase.local";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??=
  "mock-supabase-publishable-key";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "bypass" });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
