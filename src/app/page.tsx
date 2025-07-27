import dynamic from "next/dynamic";

import { LocationErrorHandler } from "@/components/app/error-handlers";
import { PageLoader } from "@/components/app/page-loader";
import {
  getGraphMeasureFromCookies,
  getLocationData,
} from "@/lib/utils/app/page-helpers";

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
