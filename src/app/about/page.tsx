"use server";

import dynamic from "next/dynamic";
import React from "react";

import { FetchLocations } from "../../lib/fetchServer";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { DatabaseError } from "../../components/DatabaseError";

const About = dynamic(() => import("../../components/about/about-main"));

const Page = async () => {
  try {
    const { LocationOptions } = await FetchLocations();
    return (
      <ErrorBoundary>
        <About LocationOptions={LocationOptions} />
      </ErrorBoundary>
    );
  } catch (error) {
    console.error("Error in about page:", error);
    return (
      <DatabaseError
        title="Database Connection Error"
        message="Unable to connect to the database. Please try again later."
      />
    );
  }
};

export default Page;
