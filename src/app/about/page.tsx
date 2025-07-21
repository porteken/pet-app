"use server";

import dynamic from "next/dynamic";
import React from "react";

import { FetchLocations } from "../../lib/fetchServer";
import { ErrorBoundary } from "../../components/ErrorBoundary";

const About = dynamic(() => import("../../components/about/about-main"));

const Page = async () => {
  try {
    const { LocationOptions } = await FetchLocations();
    return (
      <ErrorBoundary>
        <About LocationOptions={LocationOptions} />
      </ErrorBoundary>
    );
  } catch (error) {
    console.error("Error in about page:", error);
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            About PET Application
          </h1>
          <p className="mb-4 text-gray-600">
            Data temporarily unavailable. Please try again later.
          </p>
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Purpose of the Application
              </h2>
              <p className="text-gray-600">
                This application shows how the Physiological Equivalent
                Temperature or PET has changed from 2000 to 2013 in the top 500
                largest cities in the Contiguous United States.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                What is PET?
              </h2>
              <p className="text-gray-600">
                The technical definition of the PET or Physiological Equivalent
                Temperature is a method to measure the air temperature at which,
                in a typical indoor setting (without wind and solar radiation),
                the heat budget of the human body is balanced with the same core
                and skin temperature as under the complex outdoor conditions to
                be assessed.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default Page;
