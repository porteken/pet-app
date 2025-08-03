import { vi } from "vitest";

export const createMockSupabaseClient = () => ({
  from: vi.fn().mockImplementation(_table => {
    const query = createMockSupabaseQuery();
    return query;
  }),
});

export const createMockSupabaseQuery = () => ({
  eq: vi.fn().mockReturnThis(),
  order: vi.fn(),
  select: vi.fn().mockReturnThis(),
});

export const createMockQueryWithData = (data: any[], error?: any) => {
  const query = createMockSupabaseQuery();
  query.order.mockResolvedValue({ data, error });
  return query;
};

export const createMockQueryWithError = (error: any) => {
  const query = createMockSupabaseQuery();
  query.order.mockResolvedValue({ data: undefined, error });
  return query;
};

export const createMockQueryWithRejection = (error: Error) => {
  const query = createMockSupabaseQuery();
  query.order.mockRejectedValue(error);
  return query;
};

export const createMockServerQuery = () => ({
  eq: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
});

export const createMockServerQueryWithData = (data: any[], error?: any) => {
  const query = createMockServerQuery();
  query.eq.mockReturnValueOnce(query).mockResolvedValueOnce({ data, error });
  return query;
};

export const createMockServerQueryWithError = (error: any) => {
  const query = createMockServerQuery();
  query.eq
    .mockReturnValueOnce(query)
    .mockResolvedValueOnce({ data: undefined, error });
  return query;
};

export const createMockServerQueryWithRejection = (error: Error) => {
  const query = createMockServerQuery();
  query.eq.mockReturnValueOnce(query).mockRejectedValueOnce(error);
  return query;
};

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
