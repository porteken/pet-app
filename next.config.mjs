/** @type {import('next').NextConfig} */

const withBundleAnalyzer = config => {
  if (process.env.ANALYZE === "true") {
    // Dynamic import for bundle analyzer
    const bundleAnalyzer = require("@next/bundle-analyzer");
    return bundleAnalyzer({ enabled: true })(config);
  }
  return config;
};

const nextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: ["@heroui/react", "react-icons"],
  },
  eslint: {
    dirs: ["src", "tests"],
    ignoreDuringBuilds: false,
  },
  images: {
    domains: ["tile.openstreetmap.org"],
    formats: ["image/webp", "image/avif"],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
        common: {
          name: "common",
          minChunks: 2,
          chunks: "all",
          enforce: true,
        },
      };
    }

    return config;
  },
  headers: async () => {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
