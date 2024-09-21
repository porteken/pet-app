"use server";
import dynamic from "next/dynamic";
const About = dynamic(() => import("../../components/about/main"), {
  ssr: false,
});
import { FetchLocations } from "../../components/fetchServer";
import React from "react";
const Page = async () => {
  const { LocationOptions } = await FetchLocations();
  return <About LocationOptions={LocationOptions} />;
};
export default Page;
