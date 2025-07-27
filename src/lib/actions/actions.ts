"use server";

import { cookies } from "next/headers";

const graphMeasureCookieName = "graph-measure";

/**

    A Server Action that sets the graph measure cookie.

    It follows the official Next.js pattern.
    */
export async function setGraphMeasure(measure: string) {
  const cookieStore = await cookies();

  // Use the cookie store to set the value.
  // This happens entirely on the server.
  cookieStore.set(graphMeasureCookieName, measure, {
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    httpOnly: true, // Recommended for security if the cookie isn't needed by client-side JS
    path: "/",
  });
}
