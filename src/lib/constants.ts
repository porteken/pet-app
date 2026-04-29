/* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
export const APP_CONFIG = {
  GITHUB_URL: "https://github.com/porteken/pet-app",
  NAME: "Historical PET USA",
  STUDY_URL: "https://bjsm.bmj.com/content/55/15/825",
  TAGLINE: "Track how thermal stress has shifted across major U.S. cities.",
} as const;

export const GRAPH_MEASURE_COOKIE_NAME = "graph-measure" as const;
export const GRAPH_SEASON_COOKIE_NAME = "graph-season" as const;
export const REFERENCE_YEAR_COOKIE_NAME = "reference-year" as const;
export const RANKINGS_HEAT_STRESS_COOKIE_NAME = "rankings-heat-stress" as const;
export const RANKINGS_SEASON_COOKIE_NAME = "rankings-season" as const;
export const RANKINGS_STATE_COOKIE_NAME = "rankings-state" as const;
export const RANKINGS_YEAR_COOKIE_NAME = "rankings-year" as const;
export const FORECAST_ENABLED_COOKIE_NAME = "forecast-enabled" as const;
export const FORECAST_YEARS_AHEAD_COOKIE_NAME = "forecast-years-ahead" as const;
export const DEFAULT_GRAPH_MEASURE = "avg" as const;
export const GRAPH_SEASONS = [
  "Annual",
  "Spring",
  "Summer",
  "Fall",
  "Winter",
] as const;
export type GraphSeason = (typeof GRAPH_SEASONS)[number];
export const DEFAULT_GRAPH_SEASON = "Annual" as const;
export const DEFAULT_REFERENCE_YEAR = "2000" as const;
export const DEFAULT_FORECAST_ENABLED = false as const;
const DEFAULT_FORECAST_YEARS = 10;
const MIN_FORECAST_YEARS = 5;
const MAX_FORECAST_YEARS = 75;

export const DEFAULT_FORECAST_YEARS_AHEAD = DEFAULT_FORECAST_YEARS;
export const MIN_FORECAST_YEARS_AHEAD = MIN_FORECAST_YEARS;
export const MAX_FORECAST_YEARS_AHEAD = MAX_FORECAST_YEARS;

const isGraphSeason = (value: string): value is GraphSeason =>
  (GRAPH_SEASONS as readonly string[]).includes(value);

export const normalizeGraphSeason = (
  value: string | undefined,
): GraphSeason => {
  if (value && isGraphSeason(value)) {
    return value;
  }

  return DEFAULT_GRAPH_SEASON;
};

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

export const GRAPH_CONFIG = {
  COLORS: {
    PRIMARY: "#1f77b4",
    REFERENCE: "#2ca02c",
    SECONDARY: "#ff7f0e",
  },
  LAYOUT: {
    HEIGHT: 400,
    MARGIN: { b: 40, l: 60, r: 20, t: 20 },
  },
  TREND_OPTIONS: {
    AVG: "avg",
    MAX: "max",
  },
  YEAR_RANGE: {
    END: 2025,
    START: 2000,
  },
} as const;

export const GRAPH_COLORS = {
  background: "var(--graph-surface)",
  confidenceFill: "var(--graph-confidence-fill)",
  grid: "var(--graph-grid)",
  primary: "var(--graph-primary)",
  reference: "var(--graph-reference)",
  secondary: "var(--graph-secondary)",
  text: "var(--graph-text)",
  tooltipBackground: "var(--graph-tooltip-background)",
  tooltipBorder: "var(--graph-tooltip-border)",
} as const;
