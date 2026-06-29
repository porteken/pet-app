import { DatabaseError } from "@/components/app/database-error";
import Page, { PageQueryProvider } from "@/features/page";
import { loadLocationPageData } from "@/features/page/server/location-page-data";
import { notFound } from "next/navigation";

export default async function LocationPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await loadLocationPageData(id);

  if (result.status === "database-error") {
    return (
      <DatabaseError
        message={result.payload.message}
        title={result.payload.title}
      />
    );
  }

  if (result.status === "invalid-location") {
    notFound();
  }

  return (
    <PageQueryProvider>
      <Page {...result.payload} />
    </PageQueryProvider>
  );
}
