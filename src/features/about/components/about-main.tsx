"use client";

import { HeaderBar } from "@/features/header-bar";
import { APP_CONFIG } from "@/lib/constants";
import Link from "next/link";
import React from "react";

import type { AboutProperties } from "../model/types";
import type { FC } from "react";
const About: FC<AboutProperties> = ({ LocationOptions }: AboutProperties) => (
  <>
    <HeaderBar LocationOptions={LocationOptions} />
    <main
      className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10"
      id="main-content"
    >
      <section className="fade-in-up glass-panel rounded-3xl p-6 sm:p-8 lg:p-10">
        <h1 className="sr-only">About</h1>
        <p className="text-primary mb-3 text-sm font-semibold tracking-[0.24em] uppercase sm:text-base">
          Purpose of the Application
        </p>
        <p className="text-muted-foreground mt-4 max-w-3xl text-base/7">
          This app combines interactive maps, city-level rankings, and detailed
          historical comparisons so you can see how thermal comfort has shifted
          over time.
        </p>
      </section>

      <section className="mt-8">
        <article className="fade-in-up glass-panel rounded-3xl p-6 sm:p-8 lg:p-10">
          <h2 className="text-primary mb-3 text-sm font-semibold tracking-[0.24em] uppercase sm:text-base">
            What is PET?
          </h2>
          <p className="text-muted-foreground mt-4 max-w-3xl text-base/7">
            PET (Physiological Equivalent Temperature) is a method to measure
            the air temperature at which, in a typical indoor setting (without
            wind and solar radiation), the heat budget of the human body is
            balanced with the same core and skin temperature as under the
            complex outdoor conditions to be assessed. In other words, the PET
            measures thermal comfort based on temperature, humidity, wind speed,
            solar radiation, and clothing.
          </p>
          <p className="text-muted-foreground mt-4 max-w-3xl text-base/7">
            Based on{" "}
            <Link
              className="text-primary hover:text-primary/80 underline underline-offset-4 transition"
              href={APP_CONFIG.STUDY_URL}
            >
              this study
            </Link>{" "}
            , there is evidence to suggest that the PET may do a better job at
            measuring heat stress than other measures like WBGT and UTCI.
          </p>
        </article>
      </section>
    </main>
  </>
);

export default About;
