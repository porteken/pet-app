import { cookies } from "next/headers";

import { FetchLocations } from "@/lib/api/fetch-server";
import {
  DEFAULT_GRAPH_MEASURE,
  ERROR_MESSAGES,
  GRAPH_MEASURE_COOKIE_NAME,
} from "@/lib/constants/constants";

/**
 * Retrieves the graph measure preference from cookies
 * @returns The graph measure value or default if not found
 */
export const getGraphMeasureFromCookies = async (): Promise<string> => {
  const cookieStore = await cookies();
  return (
    cookieStore.get(GRAPH_MEASURE_COOKIE_NAME)?.value || DEFAULT_GRAPH_MEASURE
  );
};

/**
 * Fetches and validates location data
 * @returns Location data and options
 * @throws Error if no location data is available
 */
export const getLocationData = async () => {
  const { LocationOptions, locations } = await FetchLocations();

  if (!locations || locations.length === 0) {
    throw new Error(ERROR_MESSAGES.NO_DATA);
  }

  return { LocationOptions, locations };
};
