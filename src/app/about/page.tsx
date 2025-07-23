"use server";

import dynamic from "next/dynamic";
import React from "react";

import { FetchLocations } from "../../lib/fetch-server";
import { ErrorBoundary } from "../../components/error-boundary";
import { DatabaseError } from "../../components/database-error";

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
        title="Database Connection Error"
        message="Unable to connect to the database. Please try again later."
      />
    );
  }
};

export default Page;
