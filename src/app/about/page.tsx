"use server";

import dynamic from "next/dynamic";

import { DatabaseError } from "../../components/database-error";
import { ErrorBoundary } from "../../components/error-boundary";
import { FetchLocations } from "../../lib/fetch-server";

const About = dynamic(() => import("../../components/about/about-main"));

const Page = async () => {
  try {
    const { LocationOptions } = await FetchLocations();

    return (
      <ErrorBoundary>
        <About LocationOptions={LocationOptions} />
      </ErrorBoundary>
    );
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
