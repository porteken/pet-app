#!/usr/bin/env node

import { spawn } from "node:child_process";

import { findAvailablePort, updatePlaywrightConfig } from "./detect-port.js";

async function runTests() {
  try {
    console.log("🔍 Detecting available port...");
    const port = await findAvailablePort(3000);
    console.log(`✅ Found available port: ${port}`);

    updatePlaywrightConfig(port);

    console.log("🧪 Running Playwright tests...");

    const testProcess = spawn("npx", ["playwright", "test"], {
      env: { ...process.env, PORT: port.toString() },
      stdio: "inherit",
    });

    testProcess.on("close", code => {
      console.log(`\n🏁 Tests completed with exit code ${code}`);
      process.exit(code);
    });

    testProcess.on("error", error => {
      console.error("❌ Error running tests:", error);
      process.exit(1);
    });
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

await runTests();
