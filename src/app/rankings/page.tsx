import type { Metadata } from "next";

import { RankingsMain } from "@/features/rankings/rankings-main";
import { FetchCityRankings, FetchLocations } from "@/lib/api/fetch-server";

export const metadata: Metadata = {
  description: "City rankings by heat stress (PET) values",
  title: "City Rankings - Heat Stress Analysis",
};

export default async function RankingsPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ measure?: string; year?: string }>;
}>) {
  const parameters = await searchParams;
  const year = parameters.year ? Number(parameters.year) : 2025;
  const measureType =
    parameters.measure === "max" ? "max" : ("avg" as "avg" | "max");

  const [rankings, { LocationOptions }] = await Promise.all([
    FetchCityRankings(year, measureType),
    FetchLocations(),
  ]);

  return (
    <RankingsMain
      initialMeasure={measureType}
      initialYear={year}
      LocationOptions={LocationOptions}
      rankings={rankings}
    />
  );
}
