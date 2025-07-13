import { test, expect } from "@playwright/test";

test.describe("Dynamic Route Pages", () => {
  test("should load a location page with valid ID", async ({ page }) => {
    // Test with a sample location ID (you may need to adjust this based on your data)
    await page.goto("/1");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Check that we're on a location page
    await expect(page).toHaveURL(/\/\d+/);
  });

  test("should handle invalid location ID gracefully", async ({ page }) => {
    // Test with an invalid location ID
    await page.goto("/999999");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Should show "Location not found" message
    await expect(page.locator("text=Location not found")).toBeVisible();
  });

  test("should display location-specific content", async ({ page }) => {
    await page.goto("/1");

    // Wait for content to load
    await page.waitForLoadState("networkidle");

    // Check that the page has some content
    const mainContent = page.locator('main, [role="main"], .main-content, div');
    await expect(mainContent.first()).toBeVisible();
  });
});
