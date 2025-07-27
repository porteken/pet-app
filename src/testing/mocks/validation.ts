import { vi } from "vitest";

/**
 * Mock validation functions for testing
 */
export const createMockValidation = () => ({
  validateDates: vi.fn(),
  validateLocationId: vi.fn(),
  validatePets: vi.fn(),
  validateTrendOption: vi.fn(),
  validateYear: vi.fn(),
  validateYearPets: vi.fn(),
  validateYears: vi.fn(),
});

/**
 * Setup default successful validations
 */
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

/**
 * Setup mock for validation module
 */
export const mockValidationModule = () => {
  vi.mock("@/lib/utils/validation", () => ({
    validateDates: vi.fn(),
    validateLocationId: vi.fn(),
    validatePets: vi.fn(),
    validateTrendOption: vi.fn(),
    validateYear: vi.fn(),
    validateYearPets: vi.fn(),
    validateYears: vi.fn(),
  }));
};
