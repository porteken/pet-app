import dynamic from "next/dynamic";
import { cookies } from "next/headers";
const graphMeasureCookieName = "graph-measure";
const defaultGraphMeasure = "avg";
import { DatabaseError } from "@/features/database-error";
import { FetchLocations } from "@/lib/api/fetch-server";

const Home = dynamic(() => import("@/features/home/home-main"));

const Page = async () => {
  const cookieStore = await cookies();
  const initialGraphMeasure =
    cookieStore.get(graphMeasureCookieName)?.value || defaultGraphMeasure;
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

    return (
      <Home
        initialGraphMeasure={initialGraphMeasure}
        LocationOptions={LocationOptions}
        locations={locations}
      />
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
