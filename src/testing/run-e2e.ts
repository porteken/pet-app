/* eslint-disable unicorn/no-process-exit, typescript/no-misused-promises, typescript/strict-void-return, promise/prefer-await-to-then, typescript/use-unknown-in-catch-callback-variable */
import { spawn } from "node:child_process";

import {
  applyPostgresEnv,
  seedTestPostgres,
  startTestPostgres,
  stopTestPostgres,
} from "./global-setup";

import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";

const getWrappedCommand = (arguments_: string[]) =>
  arguments_
    .filter((argument, index) => !(argument === "--" && index > 0))
    .join(" ");

async function main() {
  process.env.NEXT_PUBLIC_E2E_TEST ??= "true";
  process.env.E2E_USE_RUNTIME_MOCKS ??= "false";
  process.env.PLAYWRIGHT_TEST ??= "1";

  let container: StartedPostgreSqlContainer | undefined;
  const useRuntimeMocks = process.env.E2E_USE_RUNTIME_MOCKS === "true";

  if (useRuntimeMocks) {
    console.warn("E2E runtime DB mocks enabled; skipping PostgreSQL startup.");
  } else {
    container = await startTestPostgres();
    try {
      await seedTestPostgres(container);
      applyPostgresEnv(container);
    } catch (error) {
      await stopTestPostgres(container);
      container = undefined;
      throw error;
    }
  }

  let tornDown = false;
  let exiting = false;

  const safeTeardown = async () => {
    if (tornDown) {
      return;
    }

    tornDown = true;
    await stopTestPostgres(container);
    container = undefined;
  };

  const exitWithTeardown = async (code: number) => {
    if (exiting) {
      return;
    }

    exiting = true;
    await safeTeardown();
    process.exit(code);
  };

  // process.argv[2...] will contain the command to run, e.g. "playwright test" or "pnpm build && playwright test"
  const command = getWrappedCommand(process.argv.slice(2));
  if (!command) {
    console.error("No command provided to run-e2e.ts");
    await exitWithTeardown(1);
    return;
  }

  const child = spawn(command, {
    stdio: "inherit",
    env: process.env,
    shell: true,
  });

  const forwardSignal = async (
    signal: NodeJS.Signals,
    fallbackExitCode: number,
  ) => {
    if (!child.killed) {
      child.kill(signal);
    }

    await exitWithTeardown(fallbackExitCode);
  };

  child.once("error", async (error) => {
    console.error("Failed to launch wrapped E2E command:", error);
    await exitWithTeardown(1);
  });

  child.once("exit", async (code, signal) => {
    let exitCode = code ?? 1;

    if (code === null) {
      if (signal === "SIGINT") {
        exitCode = 130;
      } else if (signal === "SIGTERM") {
        exitCode = 143;
      }
    }

    await exitWithTeardown(exitCode);
  });

  process.once("SIGINT", () => {
    void forwardSignal("SIGINT", 130);
  });

  process.once("SIGTERM", () => {
    void forwardSignal("SIGTERM", 143);
  });
}

try {
  await main();
} catch (error) {
  console.error("Error in run-e2e wrapper:", error);
  process.exit(1);
}
