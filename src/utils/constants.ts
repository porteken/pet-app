// Application constants
export const APP_CONFIG = {
  NAME: "Historical PET USA",
  DESCRIPTION: "Historical PET values from 2000-2023 of large US cities",
  VERSION: "0.1.0",
  GITHUB_URL: "https://github.com/porteken/pet-app",
  STUDY_URL: "https://bjsm.bmj.com/content/55/15/825",
} as const;

// Map constants
export const MAP_CONFIG = {
  DEFAULT_CENTER: [39.5, -98.35] as [number, number],
  DEFAULT_ZOOM: 5,
  TILE_URL: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  ATTRIBUTION:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
} as const;

// Graph constants
export const GRAPH_CONFIG = {
  DEFAULT_SIZE: 500,
  TREND_OPTIONS: {
    AVG: "avg",
    MAX: "max",
  },
  DEFAULT_GRAPH_TYPE: "avg",
  DEFAULT_REFERENCE_YEAR: "2000",
  YEAR_RANGE: {
    START: 2000,
    END: 2024,
  },
} as const;

// Data validation constants
export const VALIDATION_CONFIG = {
  YEAR_RANGE: {
    MIN: 1900,
    MAX: 2100,
  },
  COORDINATES: {
    LAT_MIN: -90,
    LAT_MAX: 90,
    LNG_MIN: -180,
    LNG_MAX: 180,
  },
  STRING_LENGTHS: {
    CITY_MAX: 100,
    STATE_MAX: 50,
  },
} as const;

// Error messages
export const ERROR_MESSAGES = {
  INVALID_LOCATION_ID: "Invalid location ID provided",
  INVALID_YEAR_FORMAT: "Year must be in YYYY format",
  INVALID_TREND_OPTION: 'Invalid trend option. Must be "avg" or "max"',
  NO_DATA_FOUND: "No data found for the specified parameters",
  DATABASE_ERROR: "Database error occurred",
  NETWORK_ERROR: "Network error occurred",
  VALIDATION_ERROR: "Data validation failed",
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  DATA_LOADED: "Data loaded successfully",
  GRAPH_GENERATED: "Graph generated successfully",
} as const;
