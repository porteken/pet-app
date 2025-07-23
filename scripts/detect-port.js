#!/usr/bin/env node

import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export function findAvailablePort(startPort = 3000) {
  return new Promise((resolve, reject) => {
    const server = createServer();

    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });

    server.on("error", err => {
      if (err.code === "EADDRINUSE") {
        (async () => {
          try {
            const port = await findAvailablePort(startPort + 1);
            resolve(port);
          } catch (e) {
            reject(e);
          }
        })();
      } else {
        reject(err);
      }
    });
  });
}

export function updatePlaywrightConfig(port) {
  const configPath = path.join(
    import.meta.dirname,
    "..",
    "playwright.config.ts"
  );
  let config = readFileSync(configPath, "utf8");

  config = config.replaceAll(
    /baseURL:\s*"http:\/\/localhost:\d+"/g,
    `baseURL: "http://localhost:${port}"`
  );

  config = config.replaceAll(
    /url:\s*"http:\/\/localhost:\d+"/g,
    `url: "http://localhost:${port}"`
  );

  writeFileSync(configPath, config);
  console.log(`✅ Updated Playwright config to use port ${port}`);
}

export async function main() {
  try {
    const port = await findAvailablePort(3000);
    console.log(`🔍 Found available port: ${port}`);

    updatePlaywrightConfig(port);

    process.env.PORT = port.toString();

    console.log(`🚀 Starting development server on port ${port}...`);

    const devServer = spawn("npm", ["run", "dev"], {
      stdio: "inherit",
      env: { ...process.env, PORT: port.toString() },
    });

    devServer.on("close", code => {
      console.log(`\n🏁 Development server exited with code ${code}`);
      process.exit(code);
    });
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}

const detectPort = { findAvailablePort, updatePlaywrightConfig };
export default detectPort;
