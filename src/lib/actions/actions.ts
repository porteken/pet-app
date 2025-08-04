"use server";

import { cookies } from "next/headers";

const graphMeasureCookieName = "graph-measure";
export async function setGraphMeasure(measure: string) {
  const cookieStore = await cookies();

  cookieStore.set(graphMeasureCookieName, measure, {
    expires: new Date(Date.now() + 365 * 24 * 60 * 1000),
    httpOnly: true,
    path: "/",
  });
}
