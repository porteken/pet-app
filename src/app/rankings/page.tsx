import type { Metadata } from "next";
import { cookies } from "next/headers";

import { RankingsMain } from "@/features/rankings";
import { FetchCityRankings, FetchLocations } from "@/lib/api/fetch-server";
import {
  RANKINGS_HEAT_STRESS_COOKIE_NAME,
  RANKINGS_STATE_COOKIE_NAME,
  RANKINGS_YEAR_COOKIE_NAME,
} from "@/lib/constants";

export const metadata: Metadata = {
  description: "City rankings by heat stress (PET) values",
  title: "City Rankings - Heat Stress Analysis",
};
const yearMapping = (value: string | undefined, cookie_value: string | undefined) => {
  if (value) {
    return Number(value);
  } else if (cookie_value) {
    return Number(cookie_value);
  }
  return 2025;
};

export default async function RankingsPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ measure?: string; year?: string }>;
}>) {
  const parameters = await searchParams;
  const cookieStore = await cookies();

  const heatStressFromCookie = cookieStore.get(RANKINGS_HEAT_STRESS_COOKIE_NAME)?.value;
  const stateFromCookie = cookieStore.get(RANKINGS_STATE_COOKIE_NAME)?.value;
  const yearFromCookie = cookieStore.get(RANKINGS_YEAR_COOKIE_NAME)?.value;

  const year = yearMapping(parameters.year, yearFromCookie);
  const [rankings, { LocationOptions }] = await Promise.all([
    FetchCityRankings(year),
    FetchLocations(),
  ]);

  return (
    <RankingsMain
      initialHeatStress={heatStressFromCookie ?? ""}
      initialState={stateFromCookie ?? ""}
      initialYear={year}
      LocationOptions={LocationOptions}
      rankings={rankings}
    />
  );
}
