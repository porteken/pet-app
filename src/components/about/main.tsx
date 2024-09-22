"use client";

import Link from "next/link";
import { FC } from "react";
import { AboutProps } from "./types";
import { HeaderBar } from "../headerBar";
const About: FC<AboutProps> = ({ LocationOptions }: AboutProps) => {
  return (
    <>
      <HeaderBar LocationOptions={LocationOptions} />
      <div className="grid flex-col gap-5">
        <div className="w-1/2">
          <h1 className="text-2xl font-extrabold dark:text-white">
            Purpose of the Application
          </h1>
          <p>
            This application shows how the Physiological Equivalent Temperature
            or PET has changed from 2000 to 2013 in the top 500 largest cities
            in the Contiguous United States.
          </p>
        </div>
        <div>
          <h1 className="text-2xl font-extrabold dark:text-white">
            What is PET?
          </h1>
          <p className="w-1/2">
            The technical definition of the PET or Physiological Equivalent
            Temperature is a method to measure the air temperature at which, in
            a typical indoor setting (without wind and solar radiation), the
            heat budget of the human body is balanced with the same core and
            skin temperature as under the complex outdoor conditions to be
            assessed. In other words, the PET measures thermal comfort based on
            temperature, humidity, wind speed, solar radiation, and clothing.
            Based on{" "}
            <Link
              href={"https://bjsm.bmj.com/content/55/15/825"}
              className="text-blue-600"
            >
              this
            </Link>{" "}
            study, there is evidence to suggest that the PET may do a better job
            at measuring heat stress than other measures like WBGT and UTCI.
          </p>
        </div>
      </div>
    </>
  );
};

export default About;
