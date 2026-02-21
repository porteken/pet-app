import * as Sentry from "@sentry/nextjs";

const isE2ETestRun = process.env.NEXT_PUBLIC_E2E_TEST === "true";

Sentry.init({
  debug: false,
  dsn: "https://6619376332d420d45e48ed32bcb5faf5@o4509742136950784.ingest.us.sentry.io/4509742137606144",
  enabled: !isE2ETestRun,
  enableLogs: true,
  tracesSampleRate: 1,
});
