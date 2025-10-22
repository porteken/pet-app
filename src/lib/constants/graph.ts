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
  background: "#ffffff",
  grid: "#e5e7eb",
  primary: "#3b82f6",
  secondary: "#000000",
} as const;
