"use server";
import { FetchLocations } from "../../components/fetchServer";
import dynamic from "next/dynamic";
import React from "react";
const About = dynamic(() => import("../../components/about/main"), {
  ssr: false,
});
const Page = async () => {
  const { LocationOptions } = await FetchLocations();
  return <About LocationOptions={LocationOptions} />;
};
export default Page;
