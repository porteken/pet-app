"use server";

import {
  FORECAST_ENABLED_COOKIE_NAME,
  FORECAST_YEARS_AHEAD_COOKIE_NAME,
  GRAPH_MEASURE_COOKIE_NAME,
  GRAPH_SEASON_COOKIE_NAME,
  PREFERENCE_COOKIE_MAX_AGE_MS,
  type GraphSeason,
  RANKINGS_HEAT_STRESS_COOKIE_NAME,
  RANKINGS_SEASON_COOKIE_NAME,
  RANKINGS_STATE_COOKIE_NAME,
  RANKINGS_YEAR_COOKIE_NAME,
} from "@/lib/constants";
import { cookies } from "next/headers";

const PREFERENCE_COOKIE_OPTIONS = {
  expires: new Date(Date.now() + PREFERENCE_COOKIE_MAX_AGE_MS),
  httpOnly: true,
  path: "/",
  sameSite: "lax",
} as const;

export async function setForecastPreferences(
  forecastEnabled: boolean,
  forecastYearsAhead: number,
) {
  const cookieStore = await cookies();

  cookieStore.set(
    FORECAST_ENABLED_COOKIE_NAME,
    String(forecastEnabled),
    PREFERENCE_COOKIE_OPTIONS,
  );

  cookieStore.set(
    FORECAST_YEARS_AHEAD_COOKIE_NAME,
    String(forecastYearsAhead),
    PREFERENCE_COOKIE_OPTIONS,
  );
}

export async function setGraphMeasure(measure: string) {
  const cookieStore = await cookies();
  cookieStore.set(
    GRAPH_MEASURE_COOKIE_NAME,
    measure,
    PREFERENCE_COOKIE_OPTIONS,
  );
}

export async function setGraphSeason(season: string) {
  const cookieStore = await cookies();
  cookieStore.set(GRAPH_SEASON_COOKIE_NAME, season, PREFERENCE_COOKIE_OPTIONS);
}

import { revalidatePath } from "next/cache";

const RANKINGS_COOKIE_OPTIONS = {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
} as const;

export const setRankingsHeatStress = async (heatStress: string) => {
  const cookieStore = await cookies();
  cookieStore.set(
    RANKINGS_HEAT_STRESS_COOKIE_NAME,
    heatStress,
    RANKINGS_COOKIE_OPTIONS,
  );
  revalidatePath("/rankings");
};

export const setRankingsSeason = async (season: GraphSeason) => {
  const cookieStore = await cookies();
  cookieStore.set(RANKINGS_SEASON_COOKIE_NAME, season, RANKINGS_COOKIE_OPTIONS);
  revalidatePath("/rankings");
};

export const setRankingsState = async (state: string) => {
  const cookieStore = await cookies();
  cookieStore.set(RANKINGS_STATE_COOKIE_NAME, state, RANKINGS_COOKIE_OPTIONS);
  revalidatePath("/rankings");
};

export const setRankingsYear = async (year: number) => {
  const cookieStore = await cookies();
  cookieStore.set(
    RANKINGS_YEAR_COOKIE_NAME,
    String(year),
    RANKINGS_COOKIE_OPTIONS,
  );
  revalidatePath("/rankings");
};
