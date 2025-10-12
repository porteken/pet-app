"use server";

import { cookies } from "next/headers";

import { GRAPH_MEASURE_COOKIE_NAME } from "@/lib/constants";

export async function setGraphMeasure(measure: string) {
  const cookieStore = await cookies();

  cookieStore.set(GRAPH_MEASURE_COOKIE_NAME, measure, {
    expires: new Date(Date.now() + 365 * 24 * 60 * 1000),
    httpOnly: true,
    path: "/",
  });
}
