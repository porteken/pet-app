"use server";

import dynamic from "next/dynamic";

import { FetchLocations } from "../lib/fetch-server";
import { ErrorBoundary } from "../components/error-boundary";
import { DatabaseError } from "../components/database-error";

const Home = dynamic(() => import("../components/home/home-main"));

const Page = async () => {
  try {
    const { locations, LocationOptions } = await FetchLocations();

    if (!locations || locations.length === 0) {
      return (
        <DatabaseError
          title="No Data Available"
          message="Unable to load location data. The database may be temporarily unavailable."
        />
      );
    }

    return (
      <ErrorBoundary>
        <Home locations={locations} LocationOptions={LocationOptions} />
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
