"use server";

import dynamic from "next/dynamic";
import React from "react";

import { FetchLocations } from "../../lib/fetchServer";

const About = dynamic(() => import("../../components/about/about-main"));
const Page = async () => {
  const { LocationOptions } = await FetchLocations();
  return <About LocationOptions={LocationOptions} />;
};
export default Page;
