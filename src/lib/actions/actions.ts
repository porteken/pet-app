"use server";

import { cookies } from "next/headers";

import {
  FORECAST_ENABLED_COOKIE_NAME,
  FORECAST_YEARS_AHEAD_COOKIE_NAME,
  GRAPH_MEASURE_COOKIE_NAME,
  RANKINGS_HEAT_STRESS_COOKIE_NAME,
  RANKINGS_STATE_COOKIE_NAME,
  RANKINGS_YEAR_COOKIE_NAME,
} from "@/lib/constants";

export async function setForecastPreferences(
  forecastEnabled: boolean,
  forecastYearsAhead: number,
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
    },
  );
}

export async function setGraphMeasure(measure: string) {
  const cookieStore = await cookies();

  cookieStore.set(GRAPH_MEASURE_COOKIE_NAME, measure, {
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    path: "/",
  });
}

import { revalidatePath } from "next/cache";

export const setRankingsHeatStress = async (heatStress: string) => {
  const cookieStore = await cookies();
  cookieStore.set(RANKINGS_HEAT_STRESS_COOKIE_NAME, heatStress, {
    httpOnly: true,
    path: "/",
    sameSite: "strict",
  });
  revalidatePath("/rankings");
};

export const setRankingsState = async (state: string) => {
  const cookieStore = await cookies();
  cookieStore.set(RANKINGS_STATE_COOKIE_NAME, state, {
    httpOnly: true,
    path: "/",
    sameSite: "strict",
  });
  revalidatePath("/rankings");
};

export const setRankingsYear = async (year: number) => {
  const cookieStore = await cookies();
  cookieStore.set(RANKINGS_YEAR_COOKIE_NAME, String(year), {
    httpOnly: true,
    path: "/",
    sameSite: "strict",
  });
  revalidatePath("/rankings");
};
