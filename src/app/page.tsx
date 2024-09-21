"use server";
import dynamic from "next/dynamic";
const Home = dynamic(() => import("../components/home/main"), {
  ssr: false,
});
import { FetchLocations } from "../components/fetchData";
const Page = async () => {
  const data = await FetchLocations();
  return <Home locations={data} />;
};
export default Page;
