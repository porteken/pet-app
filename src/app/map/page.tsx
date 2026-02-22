import dynamic from "next/dynamic";
import { cookies } from "next/headers";

import { DatabaseError } from "@/components/ui/database-error";
import { FetchLocations } from "@/lib/api/fetch-server";
import {
  DEFAULT_FORECAST_ENABLED,
  DEFAULT_FORECAST_YEARS_AHEAD,
  DEFAULT_GRAPH_MEASURE,
  FORECAST_ENABLED_COOKIE_NAME,
  FORECAST_YEARS_AHEAD_COOKIE_NAME,
  GRAPH_MEASURE_COOKIE_NAME,
  MAX_FORECAST_YEARS_AHEAD,
  MIN_FORECAST_YEARS_AHEAD,
} from "@/lib/constants";

const Home = dynamic(() => import("@/features/home/home-main"));

const Page = async () => {
  const cookieStore = await cookies();
  const initialGraphMeasure =
    cookieStore.get(GRAPH_MEASURE_COOKIE_NAME)?.value || DEFAULT_GRAPH_MEASURE;
  const initialForecastEnabled =
    cookieStore.get(FORECAST_ENABLED_COOKIE_NAME)?.value === "true"
      ? true
      : DEFAULT_FORECAST_ENABLED;
  const initialForecastYearsAheadValue = Number(
    cookieStore.get(FORECAST_YEARS_AHEAD_COOKIE_NAME)?.value
  );
  const initialForecastYearsAhead =
    Number.isInteger(initialForecastYearsAheadValue) &&
    initialForecastYearsAheadValue >= MIN_FORECAST_YEARS_AHEAD &&
    initialForecastYearsAheadValue <= MAX_FORECAST_YEARS_AHEAD
      ? initialForecastYearsAheadValue
      : DEFAULT_FORECAST_YEARS_AHEAD;
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
        initialForecastEnabled={initialForecastEnabled}
        initialForecastYearsAhead={initialForecastYearsAhead}
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
