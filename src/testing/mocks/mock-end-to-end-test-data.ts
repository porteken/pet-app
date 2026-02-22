/**
 * Mock data for E2E tests.
 * This data is returned when NEXT_PUBLIC_E2E_TEST=true
 */

// Generate years 2000-2024 for trend data
const generateYears = () =>
  Array.from({ length: 25 }, (_, index) => 2000 + index);

// Generate realistic PET values with a slight upward trend
/* eslint-disable sonarjs/pseudo-random -- Random values are acceptable for test mock data */
const generatePetValues = (baseValue: number, trend: number) => {
  const years = generateYears();
  return years.map((year, index) => ({
    location_id: 1,
    pet:
      Math.round((baseValue + trend * index + Math.random() * 2) * 100) / 100,
    year,
  }));
};
/* eslint-enable sonarjs/pseudo-random */

// Mock locations data
export const mockLocations = [
  {
    city: "Phoenix",
    lat: 33.4484,
    lng: -112.074,
    location_id: 1,
    state: "Arizona",
  },
  {
    city: "Tucson",
    lat: 32.2226,
    lng: -110.9747,
    location_id: 2,
    state: "Arizona",
  },
  {
    city: "Los Angeles",
    lat: 34.0522,
    lng: -118.2437,
    location_id: 3,
    state: "California",
  },
  {
    city: "San Diego",
    lat: 32.7157,
    lng: -117.1611,
    location_id: 4,
    state: "California",
  },
  {
    city: "Miami",
    lat: 25.7617,
    lng: -80.1918,
    location_id: 5,
    state: "Florida",
  },
  {
    city: "Orlando",
    lat: 28.5383,
    lng: -81.3792,
    location_id: 6,
    state: "Florida",
  },
  {
    city: "Houston",
    lat: 29.7604,
    lng: -95.3698,
    location_id: 7,
    state: "Texas",
  },
  {
    city: "Dallas",
    lat: 32.7767,
    lng: -96.797,
    location_id: 8,
    state: "Texas",
  },
];

// Mock PET year average data
export const mockPetYearAvg = generatePetValues(35, 0.15);

// Mock PET year max data
export const mockPetYearMax = generatePetValues(42, 0.2);

// Mock PET percentiles
export const mockPetPercentiles = generateYears().map((year, index) => ({
  location_id: 1,
  p10: 28 + index * 0.1,
  p90: 45 + index * 0.15,
  year,
}));

// Mock PET forecast data
export const mockPetForecast = [
  { location_id: 1, lower: 38, upper: 48, year: 2100 },
  { location_id: 2, lower: 36, upper: 46, year: 2100 },
  { location_id: 3, lower: 32, upper: 42, year: 2100 },
  { location_id: 4, lower: 30, upper: 40, year: 2100 },
  { location_id: 5, lower: 40, upper: 52, year: 2100 },
  { location_id: 6, lower: 38, upper: 50, year: 2100 },
  { location_id: 7, lower: 42, upper: 54, year: 2100 },
  { location_id: 8, lower: 40, upper: 52, year: 2100 },
];

// Mock PET change data
export const mockPetChange = mockLocations.map((loc, index) => ({
  change: 0.15 + index * 0.02,
  location_id: loc.location_id,
}));

// Mock PET year data (daily data for reference graph)
export const mockPetYear = Array.from({ length: 365 }, (_, index) => {
  const date = new Date(2024, 0, index + 1);
  return {
    date: date.toISOString().split("T")[0],
    location_id: 1,
    // eslint-disable-next-line sonarjs/pseudo-random -- Random values are acceptable for test mock data
    pet: 30 + Math.sin(index / 30) * 10 + Math.random() * 5,
    year: 2024,
  };
});

/**
 * Creates a mock Supabase client that returns test data
 */
export const createMockSupabaseClient = () => {
  const createMockQuery = (data: unknown, error?: unknown) => ({
    data,
    eq: () => createMockQuery(data, error),
    error,
    gt: () => createMockQuery(data, error),
    gte: () => createMockQuery(data, error),
    limit: () => createMockQuery(data, error),
    lt: () => createMockQuery(data, error),
    lte: () => createMockQuery(data, error),
    maybeSingle: () =>
      createMockQuery(Array.isArray(data) ? data[0] : data, error),
    order: () => createMockQuery(data, error),
    select: () => createMockQuery(data, error),
    single: () => createMockQuery(Array.isArray(data) ? data[0] : data, error),
  });

  return {
    from: (table: string) => {
      switch (table) {
        case "locations": {
          return createMockQuery(mockLocations);
        }
        case "pet_change": {
          return createMockQuery(mockPetChange);
        }
        case "pet_forecast": {
          return createMockQuery(mockPetForecast);
        }
        case "pet_percentiles": {
          return createMockQuery(mockPetPercentiles);
        }
        case "pet_year": {
          return createMockQuery(mockPetYear);
        }
        case "pet_year_avg": {
          return createMockQuery(mockPetYearAvg);
        }
        case "pet_year_max": {
          return createMockQuery(mockPetYearMax);
        }
        default: {
          return createMockQuery([]);
        }
      }
    },
    rpc: () => createMockQuery([]),
  };
};
