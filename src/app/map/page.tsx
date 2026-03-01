import dynamic from "next/dynamic";

import { LocationErrorHandler } from "@/components/app/error-handlers";
import { PageLoader } from "@/components/app/page-loader";
import {
  getForecastPreferencesFromCookies,
  getGraphMeasureFromCookies,
  getLocationData,
} from "@/lib/utils/app/page-helpers";

const Home = dynamic(() => import("@/features/home"), {
  loading: PageLoader,
});

const Page = async () => {
  try {
    const initialGraphMeasure = await getGraphMeasureFromCookies();
    const initialForecastPreferences =
      await getForecastPreferencesFromCookies();
    const { LocationOptions, locations } = await getLocationData();

    return (
      <Home
        initialForecastEnabled={initialForecastPreferences.enabled}
        initialForecastYearsAhead={initialForecastPreferences.yearsAhead}
        initialGraphMeasure={initialGraphMeasure}
        LocationOptions={LocationOptions}
        locations={locations}
      />
    );
  } catch (error) {
    return <LocationErrorHandler error={error as Error} />;
  }
};

export default Page;
