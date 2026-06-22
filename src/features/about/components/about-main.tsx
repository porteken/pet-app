"use client";

import { PageShell } from "@/components/app/page-shell";
import { APP_CONFIG } from "@/lib/constants";
import Link from "next/link";
import React from "react";

import type { AboutProperties } from "../model/types";
import type { FC } from "react";

const About: FC<AboutProperties> = ({ LocationOptions }: AboutProperties) => (
  <PageShell
    LocationOptions={LocationOptions}
    mainClassName="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10"
  >
    <section className="fade-in-up rounded-3xl p-6 glass-panel sm:p-8 lg:p-10">
      <h1 className="sr-only">About</h1>
      <p className="mb-3 text-sm font-semibold tracking-[0.24em] text-primary uppercase sm:text-base">
        Purpose of the Application
      </p>
      <p className="mt-4 max-w-3xl text-base/7 text-muted-foreground">
        This app combines interactive maps, city-level rankings, and detailed
        historical comparisons so you can see how thermal comfort has shifted
        over time.
      </p>
    </section>

    <section className="mt-8">
      <article className="fade-in-up rounded-3xl p-6 glass-panel sm:p-8 lg:p-10">
        <h2 className="mb-3 text-sm font-semibold tracking-[0.24em] text-primary uppercase sm:text-base">
          What is PET?
        </h2>
        <p className="mt-4 max-w-3xl text-base/7 text-muted-foreground">
          PET (Physiological Equivalent Temperature) is a method to measure the
          air temperature at which, in a typical indoor setting (without wind
          and solar radiation), the heat budget of the human body is balanced
          with the same core and skin temperature as under the complex outdoor
          conditions to be assessed. In other words, the PET measures thermal
          comfort based on temperature, humidity, wind speed, solar radiation,
          and clothing.
        </p>
        <p className="mt-4 max-w-3xl text-base/7 text-muted-foreground">
          Based on{" "}
          <Link
            className="text-primary underline underline-offset-4 transition hover:text-primary/80"
            href={APP_CONFIG.STUDY_URL}
          >
            this study
          </Link>{" "}
          , there is evidence to suggest that the PET may do a better job at
          measuring heat stress than other measures like WBGT and UTCI.
        </p>
      </article>
    </section>
  </PageShell>
);

export default About;
