"use server";

import { cookies } from "next/headers";

import {
  FORECAST_ENABLED_COOKIE_NAME,
  FORECAST_YEARS_AHEAD_COOKIE_NAME,
  GRAPH_MEASURE_COOKIE_NAME,
} from "@/lib/constants";

export async function setForecastPreferences(
  forecastEnabled: boolean,
  forecastYearsAhead: number
) {
  const cookieStore = await cookies();
  const expires = new Date(Date.now() + 5 * 60 * 1000);

  cookieStore.set(FORECAST_ENABLED_COOKIE_NAME, String(forecastEnabled), {
    expires,
    httpOnly: true,
    path: "/",
  });

  cookieStore.set(
    FORECAST_YEARS_AHEAD_COOKIE_NAME,
    String(forecastYearsAhead),
    {
      expires,
      httpOnly: true,
      path: "/",
    }
  );
}

export async function setGraphMeasure(measure: string) {
  const cookieStore = await cookies();

  cookieStore.set(GRAPH_MEASURE_COOKIE_NAME, measure, {
    expires: new Date(Date.now() + 365 * 24 * 60 * 1000),
    httpOnly: true,
    path: "/",
  });
}
