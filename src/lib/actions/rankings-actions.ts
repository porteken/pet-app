"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import {
  RANKINGS_MEASURE_COOKIE_NAME,
  RANKINGS_YEAR_COOKIE_NAME,
} from "@/lib/constants";

export const setRankingsMeasure = async (measure: "avg" | "max") => {
  const cookieStore = await cookies();
  cookieStore.set(RANKINGS_MEASURE_COOKIE_NAME, measure, {
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
