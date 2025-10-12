import { vi } from "vitest";

export const createMockSupabaseClient = () => ({
  from: vi.fn().mockImplementation(_table => {
    return createMockSupabaseQuery();
  }),
});

const createMockSupabaseQuery = () => ({
  eq: vi.fn().mockReturnThis(),
  order: vi.fn(),
  select: vi.fn().mockReturnThis(),
});

export const mockSupabaseClient = () => {
  vi.mock("@/config/supabase/client", () => ({
    createClient: vi.fn(),
  }));
};

export const mockSupabaseServer = () => {
  vi.mock("@/config/supabase/server", () => ({
    createClient: vi.fn(),
  }));
};
