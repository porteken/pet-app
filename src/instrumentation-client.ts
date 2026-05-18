import * as Sentry from "@sentry/nextjs";

const isE2ETestRun = process.env.NEXT_PUBLIC_E2E_TEST === "true";
const isProductionBuild = process.env.NODE_ENV === "production";
const shouldEnableReplay = !isE2ETestRun && isProductionBuild;

Sentry.init({
  debug: false,

  dsn: "https://6619376332d420d45e48ed32bcb5faf5@o4509742136950784.ingest.us.sentry.io/4509742137606144",
  enabled: !isE2ETestRun,

  enableLogs: true,
  integrations: shouldEnableReplay ? [Sentry.replayIntegration()] : [],

  replaysOnErrorSampleRate: shouldEnableReplay ? 1 : 0,

  replaysSessionSampleRate: shouldEnableReplay ? 0.1 : 0,

  tracesSampleRate: 1,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
