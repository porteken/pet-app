import dynamic from "next/dynamic";

import { LocationErrorHandler } from "./components/error-handlers";
import { PageLoader } from "./components/page-loader";
import {
  getGraphMeasureFromCookies,
  getLocationData,
} from "./utils/page-helpers";

// Dynamic import for better performance - colocated near usage
const Home = dynamic(() => import("@/features/home/home-main"), {
  loading: PageLoader,
});

const Page = async () => {
  const initialGraphMeasure = await getGraphMeasureFromCookies();

  try {
    const { LocationOptions, locations } = await getLocationData();

    return (
      <Home
        initialGraphMeasure={initialGraphMeasure}
        LocationOptions={LocationOptions}
        locations={locations}
      />
    );
  } catch (error) {
    // Handle different types of errors appropriately
    return <LocationErrorHandler error={error as Error} />;
  }
};

export default Page;
