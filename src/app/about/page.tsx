"use server";

import dynamic from "next/dynamic";
import React from "react";

import { FetchLocations } from "../../components/fetchServer";

const About = dynamic(() => import("../../components/about/main"), {
  ssr: false,
});
const Page = async () => {
  const { LocationOptions } = await FetchLocations();
  return <About LocationOptions={LocationOptions} />;
};
export default Page;
