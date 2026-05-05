"use strict";

const path = require("node:path");

/**
 * Turbopack doesn't set `opts.from` when invoking PostCSS plugins. Without it,
 * `@tailwindcss/postcss` computes the resolution base as
 * `path.dirname(process.cwd())`, which is the parent of the project root,
 * causing `tailwindcss` to be unresolvable. Setting a fallback keeps
 * resolution within the project.
 */
const plugin = () => ({
  postcssPlugin: "fix-tailwindcss-resolution",
  Once(_, { result }) {
    if (!result.opts.from) {
      result.opts.from = path.join(__dirname, "style.css");
    }
  },
});
plugin.postcss = true;

module.exports = plugin;
