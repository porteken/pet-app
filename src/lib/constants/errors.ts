export const ERROR_MESSAGES = {
  DATABASE_CONNECTION:
    "Unable to connect to the database. Please try again later.",
  NO_DATA: "No location data available",
  NO_DATA_UI:
    "Unable to load location data. The database may be temporarily unavailable.",
} as const;

export const ERROR_TITLES = {
  DATABASE_CONNECTION: "Database Connection Error",
  NO_DATA: "No Data Available",
} as const;
