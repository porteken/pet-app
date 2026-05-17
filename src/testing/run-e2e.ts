/* eslint-disable unicorn/no-process-exit, typescript/no-misused-promises, typescript/strict-void-return, promise/prefer-await-to-then, typescript/use-unknown-in-catch-callback-variable */
import { spawn } from "node:child_process";

import { setup, teardown } from "./global-setup";

async function main() {
  await setup();

  // process.argv[2...] will contain the command to run, e.g. "playwright test" or "pnpm build && playwright test"
  const command = process.argv.slice(2).join(" ");
  if (!command) {
    console.error("No command provided to run-e2e.ts");
    await teardown();
    process.exit(1);
  }

  const child = spawn(command, {
    stdio: "inherit",
    env: process.env,
    shell: true,
  });

  child.on("exit", async (code) => {
    await teardown();
    process.exit(code ?? 0);
  });

  process.on("SIGINT", async () => {
    child.kill("SIGINT");
    await teardown();
    process.exit(130);
  });
}

try {
  await main();
} catch (error) {
  console.error("Error in run-e2e wrapper:", error);
  await teardown();
  process.exit(1);
}
