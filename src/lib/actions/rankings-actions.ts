"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { RANKINGS_YEAR_COOKIE_NAME } from "@/lib/constants";

export const setRankingsYear = async (year: number) => {
  const cookieStore = await cookies();
  cookieStore.set(RANKINGS_YEAR_COOKIE_NAME, String(year), {
    httpOnly: true,
    path: "/",
    sameSite: "strict",
  });
  revalidatePath("/rankings");
};
