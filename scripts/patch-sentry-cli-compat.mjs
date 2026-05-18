import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const pnpmDirectory = path.join(repositoryRoot, "node_modules", ".pnpm");
const cliIndexRelativePath = path.join(
  "node_modules",
  "@sentry",
  "cli",
  "js",
  "index.js",
);
const exportAnchor = "exports.SentryCli = SentryCli;";
const compatibilityMarker = "module.exports.default = SentryCli;";
const compatibilityBlock = [
  "exports.default = SentryCli;",
  "module.exports = SentryCli;",
  "module.exports.default = SentryCli;",
  "module.exports.SentryCli = SentryCli;",
].join("\n");

const getCandidatePaths = async () => {
  const candidatePaths = [
    path.join(
      pnpmDirectory,
      "node_modules",
      "@sentry",
      "cli",
      "js",
      "index.js",
    ),
  ];

  const directoryEntries = await readdir(pnpmDirectory, {
    withFileTypes: true,
  });
  for (const entry of directoryEntries) {
    if (!entry.isDirectory()) {
      continue;
    }

    candidatePaths.push(
      path.join(pnpmDirectory, entry.name, cliIndexRelativePath),
    );
  }

  return candidatePaths;
};

const patchFile = async (filePath) => {
  let source;

  try {
    source = await readFile(filePath, "utf8");
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return { matched: false, patched: false };
    }

    throw error;
  }

  if (source.includes(compatibilityMarker)) {
    return { matched: true, patched: false };
  }

  if (!source.includes(exportAnchor)) {
    return { matched: false, patched: false };
  }

  const patchedSource = source.replace(
    exportAnchor,
    `${exportAnchor}\n${compatibilityBlock}`,
  );

  await writeFile(filePath, patchedSource, "utf8");
  return { matched: true, patched: true };
};

const main = async () => {
  const candidatePaths = await getCandidatePaths();
  let matchedFiles = 0;
  let patchedFiles = 0;

  for (const candidatePath of candidatePaths) {
    const { matched, patched } = await patchFile(candidatePath);

    if (matched) {
      matchedFiles += 1;
    }

    if (patched) {
      patchedFiles += 1;
    }
  }

  if (matchedFiles === 0) {
    throw new Error(
      "Could not find a compatible @sentry/cli installation to patch.",
    );
  }

  const action =
    patchedFiles === 0 ? "already applied" : `patched ${patchedFiles} file(s)`;
  console.log(`[postinstall] @sentry/cli CommonJS compatibility ${action}.`);
};

try {
  await main();
} catch (error) {
  console.error("[postinstall] Failed to patch @sentry/cli compatibility.");
  console.error(error);
  process.exit(1);
}
