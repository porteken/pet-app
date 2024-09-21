"use client";

import Link from "next/link";
import { FC } from "react";
import { AboutProps } from "./types";
import { HeaderBar } from "../headerBar";
const About: FC<AboutProps> = ({ LocationOptions }: AboutProps) => {
  return (
    <>
      <div className="grid-cols-1 grid gap-10">
        <HeaderBar LocationOptions={LocationOptions} />
        <div>
          <Link
            href={"https://github.com/porteken/pet-app"}
            className="text-blue-600"
          >
            View Source code
          </Link>
        </div>
        <div>
          <h1 className="text-2xl font-extrabold dark:text-white">
            What is PET?
          </h1>
          <p>
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
