/* eslint-disable import/namespace */
// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  dsn: "https://6619376332d420d45e48ed32bcb5faf5@o4509742136950784.ingest.us.sentry.io/4509742137606144",

  // Enable logs to be sent to Sentry
  enableLogs: true,
  // Add optional integrations for additional features
  integrations: [Sentry.replayIntegration()],

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
