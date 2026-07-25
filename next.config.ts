import initializeBundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";

import type { NextConfig } from "next";

const withBundleAnalyzer = initializeBundleAnalyzer({
  enabled: process.env.BUNDLE_ANALYZER_ENABLED === "true",
});
const projectRoot = import.meta.dirname;

const nextConfig: NextConfig = {
  // Inlines the render-blocking stylesheet into the streamed HTML, removing a
  // round trip that cost ~1s of FCP: the 16KB stylesheet was competing for
  // bandwidth with ~17 async JS chunks requested from <head>, and on HTTP/2
  // those multiplex fairly so the CSS only got a thin slice.
  experimental: {
    inlineCss: true,
  },
  output: "standalone",
  outputFileTracingRoot: projectRoot,
  serverExternalPackages: ["pg"],
  turbopack: {
    resolveAlias: {
      underscore: "lodash",
    },
    resolveExtensions: [".mdx", ".tsx", ".ts", ".jsx", ".js", ".json"],
    root: projectRoot,
  },
};

export default withSentryConfig(withBundleAnalyzer(nextConfig), {
  org: "personal-project-0l",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  tunnelRoute: "/monitoring",
  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
  widenClientFileUpload: true,
});
