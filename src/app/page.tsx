"use server";

import dynamic from "next/dynamic";

import { FetchLocations } from "../lib/fetchServer";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { DatabaseError } from "../components/DatabaseError";

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
  } catch (error) {
    console.error("Error in home page:", error);
    return (
      <DatabaseError
        title="Database Connection Error"
        message="Unable to connect to the database. Please try again later."
      />
    );
  }
};

export default Page;
