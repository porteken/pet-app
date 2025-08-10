/* eslint-disable import/namespace */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  debug: false,

  dsn: "https://6619376332d420d45e48ed32bcb5faf5@o4509742136950784.ingest.us.sentry.io/4509742137606144",

  enableLogs: true,
  integrations: [Sentry.replayIntegration()],

  replaysOnErrorSampleRate: 1,

  replaysSessionSampleRate: 0.1,

  tracesSampleRate: 1,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
