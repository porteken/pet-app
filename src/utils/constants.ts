export const APP_CONFIG = {
  DESCRIPTION: "Historical PET values from 2000-2023 of large US cities",
  GITHUB_URL: "https://github.com/porteken/pet-app",
  NAME: "Historical PET USA",
  STUDY_URL: "https://bjsm.bmj.com/content/55/15/825",
  VERSION: "0.1.0",
} as const;

export const MAP_CONFIG = {
  ATTRIBUTION:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  DEFAULT_CENTER: [39.5, -98.35] as [number, number],
  DEFAULT_ZOOM: 5,
  TILE_URL: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
} as const;

export const GRAPH_CONFIG = {
  DEFAULT_GRAPH_MEASURE: "avg",
  DEFAULT_REFERENCE_YEAR: "2000",
  DEFAULT_SIZE: 500,
  TREND_OPTIONS: {
    AVG: "avg",
    MAX: "max",
  },
  YEAR_RANGE: {
    END: 2024,
    START: 2000,
  },
} as const;

export const VALIDATION_CONFIG = {
  COORDINATES: {
    LAT_MAX: 90,
    LAT_MIN: -90,
    LNG_MAX: 180,
    LNG_MIN: -180,
  },
  STRING_LENGTHS: {
    CITY_MAX: 100,
    STATE_MAX: 50,
  },
  YEAR_RANGE: {
    MAX: 2100,
    MIN: 1900,
  },
} as const;

export const ERROR_MESSAGES = {
  DATABASE_ERROR: "Database error occurred",
  INVALID_LOCATION_ID: "Invalid location ID provided",
  INVALID_TREND_OPTION: 'Invalid trend option. Must be "avg" or "max"',
  INVALID_YEAR_FORMAT: "Year must be in YYYY format",
  NETWORK_ERROR: "Network error occurred",
  NO_DATA_FOUND: "No data found for the specified parameters",
  VALIDATION_ERROR: "Data validation failed",
} as const;

export const SUCCESS_MESSAGES = {
  DATA_LOADED: "Data loaded successfully",
  GRAPH_GENERATED: "Graph generated successfully",
} as const;
