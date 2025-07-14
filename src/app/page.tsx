"use server";

import dynamic from "next/dynamic";

import { FetchLocations } from "../components/fetchServer";

const Home = dynamic(() => import("../components/home/main"));
const Page = async () => {
  const { locations, LocationOptions } = await FetchLocations();
  return <Home locations={locations} LocationOptions={LocationOptions} />;
};
export default Page;
