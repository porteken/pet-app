"use client";

import { Database, MapPinned, ThermometerSun } from "lucide-react";
import Link from "next/link";
import React, { FC } from "react";

import { HeaderBar } from "@/features/header-bar";
import { APP_CONFIG, GRAPH_CONFIG } from "@/lib/constants";

import { AboutProperties } from "../model/types";
const About: FC<AboutProperties> = ({ LocationOptions }: AboutProperties) => {
  const { END, START } = GRAPH_CONFIG.YEAR_RANGE;

  return (
    <>
      <HeaderBar LocationOptions={LocationOptions} />
      <main
        className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10"
        id="main-content"
      >
        <section className="climate-hero fade-in-up rounded-4xl p-6 sm:p-8 lg:p-10">
          <p className="mb-2 text-xs font-semibold tracking-[0.24em] text-white/80 uppercase">
            Purpose of the Application
          </p>
          <h1 className="max-w-3xl text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            Explore how PET changed from {START} to {END} across the top 500
            largest cities in the Contiguous United States.
          </h1>
          <p className="mt-4 max-w-3xl text-base text-white/85">
            This app combines interactive maps, city-level rankings, and
            detailed historical comparisons so you can see how thermal comfort
            has shifted over time — and where future heat stress may intensify.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
              {START}–{END} historical span
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
              500 largest U.S. cities
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
              Forecast-enabled trends
            </span>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="glass-panel fade-in-up rounded-3xl p-5">
            <MapPinned className="text-primary mb-4 size-9" />
            <h2 className="text-foreground mb-2 text-lg font-semibold">
              Nationwide perspective
            </h2>
            <p className="text-muted-foreground text-sm">
              Jump from the national map to detailed city pages without losing
              your analysis settings.
            </p>
          </article>
          <article className="glass-panel fade-in-up rounded-3xl p-5 [animation-delay:80ms]">
            <ThermometerSun className="text-primary mb-4 size-9" />
            <h2 className="text-foreground mb-2 text-lg font-semibold">
              Thermal stress context
            </h2>
            <p className="text-muted-foreground text-sm">
              Translate raw PET values into understandable thermal stress bands
              for easier comparison and communication.
            </p>
          </article>
          <article className="glass-panel fade-in-up rounded-3xl p-5 [animation-delay:160ms]">
            <Database className="text-primary mb-4 size-9" />
            <h2 className="text-foreground mb-2 text-lg font-semibold">
              Historical + forecast data
            </h2>
            <p className="text-muted-foreground text-sm">
              Compare historical reference years, inspect annual trends, and
              preview forecast ranges where available.
            </p>
          </article>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
          <article className="glass-panel fade-in-up rounded-3xl p-6">
            <h2 className="text-foreground mb-4 text-2xl font-bold">
              What is PET?
            </h2>
            <p className="text-muted-foreground text-base leading-7">
              The technical definition of the PET or Physiological Equivalent
              Temperature is a method to measure the air temperature at which,
              in a typical indoor setting (without wind and solar radiation),
              the heat budget of the human body is balanced with the same core
              and skin temperature as under the complex outdoor conditions to be
              assessed. In other words, the PET measures thermal comfort based
              on temperature, humidity, wind speed, solar radiation, and
              clothing.
            </p>
            <p className="text-muted-foreground mt-4 text-base leading-7">
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

          <aside className="glass-panel fade-in-up rounded-3xl p-6 [animation-delay:120ms]">
            <h2 className="text-foreground mb-4 text-2xl font-bold">
              Data & methodology
            </h2>
            <ul className="text-muted-foreground space-y-3 text-sm">
              <li>
                Historical PET data spanning {START}–{END}.
              </li>
              <li>
                Coverage focused on the top 500 largest cities in the Contiguous
                United States.
              </li>
              <li>
                Location pages pair annual trends with day-level historical
                comparisons for richer context.
              </li>
            </ul>
            <div className="mt-6 rounded-2xl bg-(--pill-surface) p-4">
              <p className="text-foreground text-sm font-medium">
                Want to inspect the implementation details too?
              </p>
              <Link
                className="text-primary mt-2 inline-flex text-sm font-semibold underline underline-offset-4"
                href={APP_CONFIG.GITHUB_URL}
              >
                View the GitHub repository
              </Link>
            </div>
          </aside>
        </section>
      </main>
    </>
  );
};

export default About;
