// Types related to page components and their properties

export interface GraphMeasureConfig {
  cookieName: string;
  defaultValue: string;
  validOptions: readonly string[];
}

export interface LocationData {
  LocationOptions: unknown; // Update with actual type from your codebase
  locations: unknown[]; // Update with actual type from your codebase
}

export interface PageError extends Error {
  code?: string;
  statusCode?: number;
}
