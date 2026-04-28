import { vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: mockFn(),
}));

vi.mock("@/lib/utils/simple-linear-regression", () => ({
  SimpleLinearRegression: mockFn(),
}));

vi.mock("@/config/supabase/client", () => ({
  createClient: mockFn(),
}));

vi.mock("@/config/supabase/server", () => ({
  createClient: mockFn(),
}));

vi.mock("@/lib/utils/validation", () => ({
  validateDates: mockFn(),
  validateLocationId: mockFn(),
  validatePets: mockFn(),
  validateTrendOption: mockFn(),
  validateYear: mockFn(),
  validateYearPets: mockFn(),
  validateYears: mockFn(),
}));
