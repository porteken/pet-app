import { DatabaseError } from "@/components/app/database-error";
import About from "@/features/about";
import { fetchLocations } from "@/lib/api/fetch-server";

const Page = async () => {
  let locationOptions;
  try {
    ({ LocationOptions: locationOptions } = await fetchLocations());
  } catch {
    return (
      <DatabaseError
        message="Unable to connect to the database. Please try again later."
        title="Database Connection Error"
      />
    );
  }

  return <About LocationOptions={locationOptions} />;
};

export default Page;
