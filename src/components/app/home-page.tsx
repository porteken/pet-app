import { LocationErrorHandler } from "@/components/app/error-handlers";
import Home from "@/features/home";
import {
  getForecastPreferencesFromCookies,
  getGraphMeasureFromCookies,
  getGraphSeasonFromCookies,
  getLocationData,
} from "@/lib/utils/app/page-helpers";

const HomePage = async () => {
  try {
    const [
      initialGraphMeasure,
      initialGraphSeason,
      initialForecastPreferences,
      { LocationOptions, locations },
    ] = await Promise.all([
      getGraphMeasureFromCookies(),
      getGraphSeasonFromCookies(),
      getForecastPreferencesFromCookies(),
      getLocationData(),
    ]);

    return (
      <Home
        initialForecastEnabled={initialForecastPreferences.enabled}
        initialForecastYearsAhead={initialForecastPreferences.yearsAhead}
        initialGraphMeasure={initialGraphMeasure}
        initialGraphSeason={initialGraphSeason}
        LocationOptions={LocationOptions}
        locations={locations}
      />
    );
  } catch (error) {
    return <LocationErrorHandler error={error as Error} />;
  }
};

export default HomePage;
