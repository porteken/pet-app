import { vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/lib/utils/simple-linear-regression", () => ({
  SimpleLinearRegression: vi.fn(),
}));

vi.mock("@/config/supabase/client", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/config/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/utils/validation", () => ({
  validateDates: vi.fn(),
  validateLocationId: vi.fn(),
  validatePets: vi.fn(),
  validateTrendOption: vi.fn(),
  validateYear: vi.fn(),
  validateYearPets: vi.fn(),
  validateYears: vi.fn(),
}));
