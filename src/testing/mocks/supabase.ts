import { vi } from "vitest";

/**
 * Mock Supabase client for testing
 */
export const createMockSupabaseClient = () => ({
  from: vi.fn(),
});

/**
 * Mock Supabase query builder for chaining operations
 */
export const createMockSupabaseQuery = () => ({
  eq: vi.fn().mockReturnThis(),
  order: vi.fn(),
  select: vi.fn().mockReturnThis(),
});

/**
 * Creates a mock query that resolves with data
 */
export const createMockQueryWithData = (data: any[], error?: any) => {
  const query = createMockSupabaseQuery();
  query.order.mockResolvedValue({ data, error });
  return query;
};

/**
 * Creates a mock query that resolves with error
 */
export const createMockQueryWithError = (error: any) => {
  const query = createMockSupabaseQuery();
  query.order.mockResolvedValue({ data: undefined, error });
  return query;
};

/**
 * Creates a mock query that rejects with error
 */
export const createMockQueryWithRejection = (error: Error) => {
  const query = createMockSupabaseQuery();
  query.order.mockRejectedValue(error);
  return query;
};

/**
 * Creates a mock query for fetch-server style (eq chaining)
 */
export const createMockServerQuery = () => ({
  eq: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
});

/**
 * Creates a server query that resolves with data after eq chaining
 */
export const createMockServerQueryWithData = (data: any[], error?: any) => {
  const query = createMockServerQuery();
  query.eq
    .mockReturnValueOnce(query) // first eq call
    .mockResolvedValueOnce({ data, error }); // second eq call
  return query;
};

/**
 * Creates a server query that resolves with error after eq chaining
 */
export const createMockServerQueryWithError = (error: any) => {
  const query = createMockServerQuery();
  query.eq
    .mockReturnValueOnce(query) // first eq call
    .mockResolvedValueOnce({ data: undefined, error }); // second eq call
  return query;
};

/**
 * Creates a server query that rejects with error after eq chaining
 */
export const createMockServerQueryWithRejection = (error: Error) => {
  const query = createMockServerQuery();
  query.eq
    .mockReturnValueOnce(query) // first eq call
    .mockRejectedValueOnce(error); // second eq call
  return query;
};

/**
 * Setup mock for Supabase client module
 */
export const mockSupabaseClient = () => {
  vi.mock("@/lib/config/supabase/client", () => ({
    createClient: vi.fn(),
  }));
};

/**
 * Setup mock for Supabase server module
 */
export const mockSupabaseServer = () => {
  vi.mock("@/lib/config/supabase/server", () => ({
    createClient: vi.fn(),
  }));
};
