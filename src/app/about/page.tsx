"use server";

import dynamic from "next/dynamic";

import { DatabaseError } from "@/components/app/database-error";
import { FetchLocations } from "@/lib/api/fetch-server";

const About = dynamic(() => import("@/features/about"));

const Page = async () => {
  try {
    const { LocationOptions } = await FetchLocations();

    return <About LocationOptions={LocationOptions} />;
  } catch {
    return (
      <DatabaseError
        message="Unable to connect to the database. Please try again later."
        title="Database Connection Error"
      />
    );
  }
};

export default Page;
