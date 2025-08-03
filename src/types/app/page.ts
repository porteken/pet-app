export interface GraphMeasureConfig {
  cookieName: string;
  defaultValue: string;
  validOptions: readonly string[];
}

export interface LocationData {
  LocationOptions: unknown;
  locations: unknown[];
}

export interface PageError extends Error {
  code?: string;
  statusCode?: number;
}
