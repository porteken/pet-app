"use server";
import dynamic from "next/dynamic";

import { DatabaseError } from "../../components/database-error";
import { FetchLocations } from "../../lib/fetch-server";

const Home = dynamic(() => import("../../components/home/home-main"));

const Page = async () => {
  try {
    const { LocationOptions, locations } = await FetchLocations();

    if (!locations || locations.length === 0) {
      return (
        <DatabaseError
          message="Unable to load location data. The database may be temporarily unavailable."
          title="No Data Available"
        />
      );
    }

    return <Home LocationOptions={LocationOptions} locations={locations} />;
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
