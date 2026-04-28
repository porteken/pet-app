import path from "path";

// process.cwd() is reliably the project root because
// scripts/run-next-from-project-root.mjs calls process.chdir(projectRoot)
// before spawning Next.js, and the Turbopack PostCSS worker inherits it.
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
