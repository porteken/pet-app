"use server";

import dynamic from "next/dynamic";

import { FetchLocations } from "../../components/fetchServer";

const About = dynamic(() => import("../../components/about/main"));
const Page = async () => {
  const { LocationOptions } = await FetchLocations();
  return <About LocationOptions={LocationOptions} />;
};
export default Page;
