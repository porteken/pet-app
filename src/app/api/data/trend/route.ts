import { FetchTrendGraphData } from "@/lib/api/fetch-server";
import { DEFAULT_GRAPH_SEASON, normalizeGraphSeason } from "@/lib/constants";
import {
  validateLocationId,
  validateTrendOption,
} from "@/lib/utils/validation";
import { NextResponse } from "next/server";

import { createDataRouteErrorResponse } from "../response";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locationId = Number(url.searchParams.get("locationId"));
  const option = url.searchParams.get("option") ?? "";
  const season = normalizeGraphSeason(
    url.searchParams.get("season") ?? DEFAULT_GRAPH_SEASON,
  );

  if (!validateLocationId(locationId)) {
    return NextResponse.json({ error: "Invalid location ID" }, { status: 400 });
  }

  if (!validateTrendOption(option)) {
    return NextResponse.json(
      { error: "Invalid trend option" },
      { status: 400 },
    );
  }

  try {
    const data = await FetchTrendGraphData(option, locationId, season);
    return NextResponse.json(data);
  } catch (error) {
    return createDataRouteErrorResponse(
      error,
      "Failed to fetch trend graph data",
    );
  }
}
