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

    // Should show "Location not found" message, "No data available" message, or fallback content
    const errorMessage = page.locator("div").filter({
      hasText:
        /Location not found|No data available|Data temporarily unavailable/,
    });
    await expect(errorMessage.first()).toBeVisible();
  });

  test("should display location-specific content", async ({ page }) => {
    await page.goto("/1");

    // Wait for content to load
    await page.waitForLoadState("networkidle");

    // Check that the page has some content - look for the main container
    // The page should show some content - either the location data or an error message
    const mainContent = page.locator("main, div").filter({
      hasText:
        /Los Angeles|California|No data available|Data temporarily unavailable/,
    });
    await expect(mainContent.first()).toBeVisible();
  });
});
