import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  DEFAULT_REFERENCE_YEAR,
  GRAPH_MEASURE_COOKIE_NAME,
  GRAPH_SEASON_COOKIE_NAME,
  normalizeGraphSeason,
  REFERENCE_YEAR_COOKIE_NAME,
} from "@/lib/constants";
import { validateTrendOption, validateYear } from "@/lib/utils/validation";

interface GraphPreferencesPayload {
  graphMeasure?: string;
  graphSeason?: string;
  referenceYear?: string;
}

const ONE_YEAR_IN_MILLISECONDS = 365 * 24 * 60 * 60 * 1000;

const buildCookieOptions = () => ({
  expires: new Date(Date.now() + ONE_YEAR_IN_MILLISECONDS),
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
});

export async function POST(request: Request) {
  let payload: GraphPreferencesPayload;

  try {
    payload = (await request.json()) as GraphPreferencesPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();

  if (payload.graphMeasure !== undefined) {
    if (!validateTrendOption(payload.graphMeasure)) {
      return NextResponse.json(
        { error: "Invalid graph measure" },
        { status: 400 },
      );
    }

    cookieStore.set(
      GRAPH_MEASURE_COOKIE_NAME,
      payload.graphMeasure,
      buildCookieOptions(),
    );
  }

  if (payload.graphSeason !== undefined) {
    const normalizedSeason = normalizeGraphSeason(payload.graphSeason);

    if (normalizedSeason !== payload.graphSeason) {
      return NextResponse.json(
        { error: "Invalid graph season" },
        { status: 400 },
      );
    }

    cookieStore.set(
      GRAPH_SEASON_COOKIE_NAME,
      normalizedSeason,
      buildCookieOptions(),
    );
  }

  if (payload.referenceYear !== undefined) {
    const normalizedReferenceYear =
      payload.referenceYear || DEFAULT_REFERENCE_YEAR;

    if (!validateYear(normalizedReferenceYear)) {
      return NextResponse.json(
        { error: "Invalid reference year" },
        { status: 400 },
      );
    }

    cookieStore.set(
      REFERENCE_YEAR_COOKIE_NAME,
      normalizedReferenceYear,
      buildCookieOptions(),
    );
  }

  return NextResponse.json({ ok: true });
}
