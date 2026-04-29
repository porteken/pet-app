import path from "node:path";

// Next.js package scripts execute from the project root, and the Turbopack
// PostCSS worker inherits that cwd.
const projectRoot = process.cwd();

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Fix for Turbopack not setting opts.from — see postcss-fix-tailwindcss.cjs.
    // Absolute path required: Turbopack bundles this config file and evaluates
    // it at .next/, so relative paths and import.meta.url are unreliable here.
    [path.join(projectRoot, "postcss-fix-tailwindcss.cjs")]: {},
    "@tailwindcss/postcss": {},
  },
};

export default config;
