"use server";
import dynamic from "next/dynamic";
const Home = dynamic(() => import("../components/home/main"), {
  ssr: false,
});
import { FetchLocations } from "../components/fetchServer";
import React from "react";
const Page = async () => {
  const { locations, LocationOptions } = await FetchLocations();
  return <Home locations={locations} LocationOptions={LocationOptions} />;
};
export default Page;
