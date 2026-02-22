"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import {
  RANKINGS_HEAT_STRESS_COOKIE_NAME,
  RANKINGS_STATE_COOKIE_NAME,
  RANKINGS_YEAR_COOKIE_NAME,
} from "@/lib/constants";

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
