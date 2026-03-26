import { drop, factory, primaryKey } from "@mswjs/data";
import { vi } from "vitest";

let locationCounter = 1;
let petDataCounter = 1;
let petCountCounter = 1;
let trendDataCounter = 1;
let trendCountCounter = 1;

export const database = factory({
  location: {
    city: () => "Test City",
    lat: () => 40.7128,
    lng: () => -74.006,
    location_id: primaryKey(() => locationCounter++),
    state: () => "Test State",
  },
  petData: {
    date: () => new Date("2025-01-01"),
    id: primaryKey(() => petDataCounter++),
    location_id: () => 1,
    measure_type: () => "avg",
    pet_count: () => ((petCountCounter++ - 1) % 100) + 1,
  },
  trendData: {
    id: primaryKey(() => trendDataCounter++),
    location_id: () => 1,
    measure_type: () => "avg",
    pet_count: () => ((trendCountCounter++ - 1) % 100) + 1,
    year: () => 2025,
  },
});

export const resetDatabase = () => {
  locationCounter = 1;
  petDataCounter = 1;
  petCountCounter = 1;
  trendDataCounter = 1;
  trendCountCounter = 1;

  drop(database);
};

export const createMockSupabaseClient = () => ({
  from: vi.fn().mockImplementation((_table) => {
    return createMockSupabaseQuery();
  }),
  rpc: vi.fn().mockImplementation(() => createMockSupabaseQuery()),
});

const createMockSupabaseQuery = () => ({
  eq: vi.fn().mockReturnThis(),
  gt: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  lt: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn(),
  order: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  single: vi.fn(),
});

export const createMockCookieStore = () => ({
  get: vi.fn(),
  set: vi.fn(),
});

export const createMockLinearRegression = () => ({
  predict: vi.fn(),
  slope: 0,
});
export const createMockValidation = () => ({
  validateDates: vi.fn(),
  validateLocationId: vi.fn(),
  validatePets: vi.fn(),
  validateTrendOption: vi.fn(),
  validateYear: vi.fn(),
  validateYearPets: vi.fn(),
  validateYears: vi.fn(),
});

export const setupSuccessfulValidations = (
  mockValidation: ReturnType<typeof createMockValidation>
) => {
  mockValidation.validateDates.mockImplementation(() => {});
  mockValidation.validateLocationId.mockReturnValue(true);
  mockValidation.validatePets.mockImplementation(() => {});
  mockValidation.validateTrendOption.mockReturnValue(true);
  mockValidation.validateYear.mockReturnValue(true);
  mockValidation.validateYearPets.mockReturnValue(true);
  mockValidation.validateYears.mockReturnValue(true);
};
