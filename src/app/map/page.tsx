"use server";
import dynamic from "next/dynamic";
import React from "react";

import { FetchLocations } from "../../lib/fetchServer";
import { ErrorBoundary } from "../../components/ErrorBoundary";

const Home = dynamic(() => import("../../components/home/home-main"));

const Page = async () => {
  try {
    const { locations, LocationOptions } = await FetchLocations();
    return (
      <ErrorBoundary>
        <Home locations={locations} LocationOptions={LocationOptions} />
      </ErrorBoundary>
    );
  } catch (error) {
    console.error("Error in map page:", error);
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Historical PET USA Map
          </h1>
          <p className="text-gray-600">
            Data temporarily unavailable. Please try again later.
          </p>
        </div>
      </div>
    );
  }
};

export default Page;
