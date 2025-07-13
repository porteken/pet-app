import { test } from "@playwright/test";

/* eslint-disable no-console */
test.describe("Debug Tests", () => {
  test.beforeEach(async () => {
    console.log("🔍 Starting new test...");
  });

  test.afterEach(async () => {
    console.log("✅ Test completed");
  });

  test("debug home page loading", async ({ page }) => {
    console.log("🌐 Navigating to home page...");

    try {
      const response = await page.goto("/", {
        waitUntil: "domcontentloaded",
        timeout: 10000,
      });

      console.log(`📊 Response status: ${response?.status()}`);
      console.log(`📊 Response URL: ${response?.url()}`);

      if (response?.status() === 200) {
        console.log("✅ Home page loaded successfully");

        // Check for key elements
        const title = await page.title();
        console.log(`📄 Page title: "${title}"`);

        const mapContainer = page.locator(".leaflet-container");
        const mapVisible = await mapContainer.isVisible();
        console.log(`🗺️ Map container visible: ${mapVisible}`);

        if (!mapVisible) {
          console.log("⚠️ Map container not visible, checking for errors...");
          const errors = await page.evaluate(() => {
            return typeof window.console.error === "function"
              ? "Console errors detected"
              : "No console errors";
          });
          console.log(`🔍 Console status: ${errors}`);
        }
      } else {
        console.log(`❌ Home page failed to load: ${response?.status()}`);
      }
    } catch (error) {
      console.log(`💥 Navigation error: ${error}`);
    }
  });

  test("debug map interactions", async ({ page }) => {
    console.log("🗺️ Testing map interactions...");

    try {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      console.log("✅ Navigated to home page");

      // Wait for map to load
      await page.waitForSelector(".leaflet-container", { timeout: 10000 });
      console.log("✅ Map container found");

      // Check for markers
      const markers = page.locator(".leaflet-marker-icon");
      const markerCount = await markers.count();
      console.log(`📍 Found ${markerCount} map markers`);

      if (markerCount > 0) {
        console.log("🎯 Testing marker click...");
        await markers.first().click();
        console.log("✅ Marker clicked");

        // Check for popup
        const popup = page.locator(".leaflet-popup");
        const popupVisible = await popup.isVisible();
        console.log(`💬 Popup visible: ${popupVisible}`);

        if (popupVisible) {
          const popupText = await popup.textContent();
          console.log(`📝 Popup content: ${popupText?.substring(0, 100)}...`);
        }
      } else {
        console.log("⚠️ No markers found on map");
      }
    } catch (error) {
      console.log(`💥 Map interaction error: ${error}`);
    }
  });

  test("debug navigation between pages", async ({ page }) => {
    console.log("🧭 Testing page navigation...");

    const pages = [
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
      { name: "Map", path: "/map" },
    ];

    for (const pageInfo of pages) {
      try {
        console.log(`🔗 Testing ${pageInfo.name} page (${pageInfo.path})...`);

        const response = await page.goto(pageInfo.path, {
          waitUntil: "domcontentloaded",
          timeout: 10000,
        });

        console.log(`📊 ${pageInfo.name} status: ${response?.status()}`);

        if (response?.status() === 200) {
          const title = await page.title();
          console.log(`📄 ${pageInfo.name} title: "${title}"`);

          // Check for main content
          const mainContent = page.locator(
            'main, [role="main"], .main-content, div'
          );
          const contentVisible = await mainContent.first().isVisible();
          console.log(`📝 ${pageInfo.name} content visible: ${contentVisible}`);
        }
      } catch (error) {
        console.log(`💥 ${pageInfo.name} page error: ${error}`);
      }
    }
  });

  test("debug dynamic routes", async ({ page }) => {
    console.log("🔄 Testing dynamic routes...");

    const testIds = ["1", "999", "abc"];

    for (const id of testIds) {
      try {
        console.log(`🔗 Testing route /${id}...`);

        const response = await page.goto(`/${id}`, {
          waitUntil: "domcontentloaded",
          timeout: 10000,
        });

        console.log(`📊 Route /${id} status: ${response?.status()}`);

        if (response?.status() === 200) {
          const title = await page.title();
          console.log(`📄 Route /${id} title: "${title}"`);

          // Check for content
          const content = await page.textContent("body");
          console.log(
            `📝 Route /${id} content preview: ${content?.substring(0, 100)}...`
          );
        } else if (response?.status() === 404) {
          console.log(
            `📄 Route /${id} returned 404 (expected for invalid routes)`
          );
        }
      } catch (error) {
        console.log(`💥 Route /${id} error: ${error}`);
      }
    }
  });

  test("debug network requests", async ({ page }) => {
    console.log("🌐 Monitoring network requests...");

    let requestCount = 0;
    let responseCount = 0;

    // Listen to network requests
    page.on("request", request => {
      const url = request.url();
      if (url.includes("localhost:3001")) {
        requestCount++;
        console.log(`📤 Request: ${request.method()} ${url}`);
      }
    });

    page.on("response", response => {
      const url = response.url();
      if (url.includes("localhost:3001")) {
        responseCount++;
        console.log(`📥 Response: ${response.status()} ${url}`);
      }
    });

    try {
      await page.goto("/", { waitUntil: "networkidle" });
      console.log(`📊 Total requests: ${requestCount}`);
      console.log(`📊 Total responses: ${responseCount}`);
    } catch (error) {
      console.log(`💥 Network monitoring error: ${error}`);
    }
  });

  test("debug console errors", async ({ page }) => {
    console.log("🚨 Monitoring console errors...");

    let errorCount = 0;

    page.on("console", msg => {
      if (msg.type() === "error") {
        errorCount++;
        console.log(`🚨 Console error: ${msg.text()}`);
      }
    });

    page.on("pageerror", error => {
      errorCount++;
      console.log(`💥 Page error: ${error.message}`);
    });

    try {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      console.log(`📊 Total console errors: ${errorCount}`);
    } catch (error) {
      console.log(`💥 Error monitoring failed: ${error}`);
    }
  });
});
