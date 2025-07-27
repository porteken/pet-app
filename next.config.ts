import type { NextConfig } from "next";

import initializeBundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";

// https://www.npmjs.com/package/@next/bundle-analyzer
const withBundleAnalyzer = initializeBundleAnalyzer({
  enabled: process.env.BUNDLE_ANALYZER_ENABLED === "true",
});

// https://nextjs.org/docs/pages/api-reference/next-config-js
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "avatars.githubusercontent.com",
        protocol: "https",
      },
      {
        hostname: "images.unsplash.com",
        protocol: "https",
      },
    ],
  },
  output: "standalone",
  outputFileTracingIncludes: {
    "/*": ["./registry/**/*"],
  },
  turbopack: {
    resolveExtensions: [".mdx", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
    rules: {
      "*.svg": {
        as: "*.js",
        loaders: ["@svgr/webpack"],
      },
    },
  },
};

export default withSentryConfig(
  withSentryConfig(
    withSentryConfig(withBundleAnalyzer(nextConfig), {
      // For all available options, see:
      // https://www.npmjs.com/package/@sentry/webpack-plugin#options

      // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
      // See the following for more information:
      // https://docs.sentry.io/product/crons/
      // https://vercel.com/docs/cron-jobs
      automaticVercelMonitors: true,
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      disableLogger: true,

      org: "personal-project-0l",

      // For all available options, see:
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

      project: "javascript-nextjs",

      // Only print logs for uploading source maps in CI
      silent: !process.env.CI,

      // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
      // This can increase your server load as well as your hosting bill.
      // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
      // side errors will fail.
      tunnelRoute: "/monitoring",

      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,
    }),
    {
      // For all available options, see:
      // https://www.npmjs.com/package/@sentry/webpack-plugin#options

      // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
      // See the following for more information:
      // https://docs.sentry.io/product/crons/
      // https://vercel.com/docs/cron-jobs
      automaticVercelMonitors: true,
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      disableLogger: true,

      org: "personal-project-0l",

      // For all available options, see:
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

      project: "javascript-nextjs",

      // Only print logs for uploading source maps in CI
      silent: !process.env.CI,

      // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
      // This can increase your server load as well as your hosting bill.
      // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
      // side errors will fail.
      tunnelRoute: "/monitoring",

      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,
    }
  ),
  {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    org: "personal-project-0l",

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    project: "javascript-nextjs",

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: "/monitoring",

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,
  }
);
