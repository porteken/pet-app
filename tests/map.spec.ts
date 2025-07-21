import { test, expect } from "@playwright/test";

test.describe("Map Page", () => {
  test("should load the map page", async ({ page }) => {
    await page.goto("/map");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Check that we're on the map page
    await expect(page).toHaveURL(/.*map/);
  });

  test("should display map content", async ({ page }) => {
    await page.goto("/map");

    // Wait for content to load
    await page.waitForLoadState("networkidle");

    // Check that the page has some content - look for the map container or header
    const mainContent = page.locator("header").first();
    await expect(mainContent).toBeVisible();
  });
});
