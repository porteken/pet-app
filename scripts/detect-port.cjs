#!/usr/bin/env node

const { createServer } = require("http");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

function findAvailablePort(startPort = 3000) {
  return new Promise((resolve, reject) => {
    const server = createServer();

    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });

    server.on("error", err => {
      if (err.code === "EADDRINUSE") {
        findAvailablePort(startPort + 1)
          .then(resolve)
          .catch(reject);
      } else {
        reject(err);
      }
    });
  });
}

function updatePlaywrightConfig(port) {
  const configPath = path.join(__dirname, "..", "playwright.config.ts");
  let config = fs.readFileSync(configPath, "utf8");

  config = config.replace(
    /baseURL:\s*"http:\/\/localhost:\d+"/g,
    `baseURL: "http://localhost:${port}"`
  );

  config = config.replace(
    /url:\s*"http:\/\/localhost:\d+"/g,
    `url: "http://localhost:${port}"`
  );

  fs.writeFileSync(configPath, config);
  console.log(`✅ Updated Playwright config to use port ${port}`);
}

async function main() {
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
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { findAvailablePort, updatePlaywrightConfig };
