import dynamic from "next/dynamic";

import { DatabaseError } from "@/components/app/database-error";
import { InvalidLocationError } from "@/features/page/components/invalid-location-error";
import { loadLocationPageData } from "@/features/page/server/location-page-data";

const Page = dynamic(() => import("@/features/page"));

export default async function LocationPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await loadLocationPageData(id);

  if (result.status === "database-error") {
    return <DatabaseError message={result.payload.message} title={result.payload.title} />;
  }

  if (result.status === "invalid-location") {
    return <InvalidLocationError message={result.payload.message} title={result.payload.title} />;
  }

  return <Page {...result.payload} />;
}
