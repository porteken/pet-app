#!/usr/bin/env node

const { spawn } = require("child_process");
const {
  findAvailablePort,
  updatePlaywrightConfig,
} = require("./detect-port.cjs");

async function runTests() {
  try {
    console.log("🔍 Detecting available port...");
    const port = await findAvailablePort(3000);
    console.log(`✅ Found available port: ${port}`);

    updatePlaywrightConfig(port);

    console.log("🧪 Running Playwright tests...");

    const testProcess = spawn("npx", ["playwright", "test"], {
      stdio: "inherit",
      env: { ...process.env, PORT: port.toString() },
    });

    testProcess.on("close", code => {
      console.log(`\n🏁 Tests completed with exit code ${code}`);
      process.exit(code);
    });

    testProcess.on("error", err => {
      console.error("❌ Error running tests:", err);
      process.exit(1);
    });
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

runTests();
